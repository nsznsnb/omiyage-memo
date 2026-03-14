import { useState, useEffect } from 'react'
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {isEdit ? 'リスト名を変更' : 'リストを作成'}
        </h2>

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
            <div className="flex flex-col gap-1">
              <label htmlFor="group-select" className="text-sm font-medium text-gray-700">
                グループ（任意）
              </label>
              <select
                id="group-select"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
                  outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">個人リスト</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

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
