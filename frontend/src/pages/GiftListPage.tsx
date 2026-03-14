import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ErrorMessage } from '../components/ErrorMessage'
import { GiftListFormModal } from '../components/GiftListFormModal'
import * as giftListsApi from '../api/giftLists'
import type { GiftList } from '../types'

export function GiftListPage() {
  const [lists, setLists] = useState<GiftList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadLists()
  }, [])

  async function loadLists() {
    try {
      const data = await giftListsApi.listGiftLists()
      setLists(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'リストの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate(name: string, groupId?: string) {
    const list = await giftListsApi.createGiftList(name, groupId)
    setLists((prev) => [list, ...prev])
    setShowModal(false)
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">プレゼントリスト</h1>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white
            hover:bg-indigo-700 transition-colors"
        >
          + リストを作成
        </button>
      </div>

      <ErrorMessage message={error} />

      {isLoading ? (
        <p className="text-gray-400 text-center py-12">読み込み中...</p>
      ) : lists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">まだリストがありません</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            最初のリストを作成する
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {lists.map((list) => (
            <li key={list.id}>
              <Link
                to={`/gift-lists/${list.id}`}
                className="flex items-center justify-between rounded-xl bg-white border
                  border-gray-200 px-5 py-4 hover:border-indigo-300 hover:shadow-sm transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">{list.name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {list.groupId ? 'グループリスト' : '個人リスト'} ·{' '}
                    {list.items.length}件
                  </p>
                </div>
                <span className="text-gray-300 text-lg">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <GiftListFormModal onSubmit={handleCreate} onClose={() => setShowModal(false)} />
      )}
    </Layout>
  )
}
