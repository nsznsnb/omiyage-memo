import { useState } from 'react'
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {isEdit ? 'アイテムを編集' : 'アイテムを追加'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ErrorMessage message={error} />

          <FormField label="アイテム名" id="item-name" value={name} onChange={setName} required />
          <FormField label="価格（円）" id="item-price" type="number" value={price} onChange={setPrice} />
          <FormField label="メモ" id="item-memo" value={memo} onChange={setMemo} />
          <FormField label="URL" id="item-url" type="url" value={url} onChange={setUrl} />

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white
                hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? '処理中...' : isEdit ? '変更する' : '追加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
