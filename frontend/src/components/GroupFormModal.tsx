import { useState } from 'react'
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {isEdit ? 'グループ名を変更' : 'グループを作成'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ErrorMessage message={error} />
          <FormField
            label="グループ名"
            id="group-name"
            value={name}
            onChange={setName}
            required
          />
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
              {isSubmitting ? '処理中...' : isEdit ? '変更する' : '作成する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
