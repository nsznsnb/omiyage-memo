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
import type { GiftItem } from '../types'
import type { GiftItemInput } from '../api/giftLists'

interface GiftItemFormModalProps {
  initial?: GiftItem
  onSubmit: (data: GiftItemInput) => Promise<void>
  onClose: () => void
}

export function GiftItemFormModal({ initial, onSubmit, onClose }: GiftItemFormModalProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [memo, setMemo] = useState(initial?.memo ?? '')
  const [url, setUrl] = useState(initial?.url ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = !!initial

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('アイテム名を入力してください')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        price: price ? parseInt(price, 10) : null,
        memo: memo.trim() || null,
        url: url.trim() || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作に失敗しました')
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'アイテムを編集' : 'アイテムを追加'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ErrorMessage message={error} />

          <FormField label="アイテム名" id="item-name" value={name} onChange={setName} required />
          <FormField label="価格（円）" id="item-price" type="number" value={price} onChange={setPrice} />
          <FormField label="メモ" id="item-memo" value={memo} onChange={setMemo} />
          <FormField label="URL" id="item-url" type="url" value={url} onChange={setUrl} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '処理中...' : isEdit ? '変更する' : '追加する'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
