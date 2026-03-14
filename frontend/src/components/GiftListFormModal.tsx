import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from './FormField'
import { ErrorMessage } from './ErrorMessage'
import * as groupsApi from '../api/groups'
import type { Group } from '../types'

interface GiftListFormModalProps {
  initialName?: string
  onSubmit: (name: string, groupId?: string) => Promise<void>
  onClose: () => void
}

export function GiftListFormModal({ initialName = '', onSubmit, onClose }: GiftListFormModalProps) {
  const [name, setName] = useState(initialName)
  const [groupId, setGroupId] = useState('')
  const [groups, setGroups] = useState<Group[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = !!initialName

  useEffect(() => {
    if (!isEdit) {
      groupsApi.listGroups().then(setGroups).catch(() => {})
    }
  }, [isEdit])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('リスト名を入力してください')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(name.trim(), groupId || undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作に失敗しました')
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'リスト名を変更' : 'リストを作成'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ErrorMessage message={error} />

          <FormField
            label="リスト名"
            id="list-name"
            value={name}
            onChange={setName}
            required
          />

          {!isEdit && groups.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="group-select">グループ（任意）</Label>
              <Select
                value={groupId || 'personal'}
                onValueChange={(v) => setGroupId(v === 'personal' ? '' : v)}
              >
                <SelectTrigger id="group-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">個人リスト</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '処理中...' : isEdit ? '変更する' : '作成する'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
