import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { FormField } from './FormField'
import { ErrorMessage } from './ErrorMessage'

interface GroupFormModalProps {
  initialName?: string
  onSubmit: (name: string) => Promise<void>
  onClose: () => void
}

export function GroupFormModal({ initialName = '', onSubmit, onClose }: GroupFormModalProps) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = !!initialName

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('グループ名を入力してください')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(name.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作に失敗しました')
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'グループ名を変更' : 'グループを作成'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ErrorMessage message={error} />
          <FormField
            label="グループ名"
            id="group-name"
            value={name}
            onChange={setName}
            required
          />
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
