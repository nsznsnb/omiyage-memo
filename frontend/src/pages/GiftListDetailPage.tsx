import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ErrorMessage } from '../components/ErrorMessage'
import { GiftListFormModal } from '../components/GiftListFormModal'
import { GiftItemFormModal } from '../components/GiftItemFormModal'
import * as giftListsApi from '../api/giftLists'
import type { GiftList, GiftItem } from '../types'
import type { GiftItemInput } from '../api/giftLists'

export function GiftListDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [list, setList] = useState<GiftList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditListModal, setShowEditListModal] = useState(false)
  const [editingItem, setEditingItem] = useState<GiftItem | null>(null)
  const [showAddItemModal, setShowAddItemModal] = useState(false)

  useEffect(() => {
    if (id) loadList(id)
  }, [id])

  async function loadList(listId: string) {
    try {
      const data = await giftListsApi.getGiftList(listId)
      setList(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'リストの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdateList(name: string) {
    if (!id) return
    const updated = await giftListsApi.updateGiftList(id, name)
    setList(updated)
    setShowEditListModal(false)
  }

  async function handleDeleteList() {
    if (!id || !confirm(`「${list?.name}」を削除しますか？`)) return
    try {
      await giftListsApi.deleteGiftList(id)
      navigate('/gift-lists')
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  async function handleAddItem(data: GiftItemInput) {
    if (!id) return
    const item = await giftListsApi.addGiftItem(id, data)
    setList((prev) => prev ? { ...prev, items: [...prev.items, item] } : prev)
    setShowAddItemModal(false)
  }

  async function handleUpdateItem(data: GiftItemInput) {
    if (!id || !editingItem) return
    const updated = await giftListsApi.updateGiftItem(id, editingItem.id, data)
    setList((prev) =>
      prev ? { ...prev, items: prev.items.map((i) => (i.id === updated.id ? updated : i)) } : prev,
    )
    setEditingItem(null)
  }

  async function handleDeleteItem(item: GiftItem) {
    if (!id || !confirm(`「${item.name}」を削除しますか？`)) return
    try {
      await giftListsApi.deleteGiftItem(id, item.id)
      setList((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.id !== item.id) } : prev,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <p className="text-gray-400 text-center py-12">読み込み中...</p>
      </Layout>
    )
  }

  if (!list) {
    return (
      <Layout>
        <ErrorMessage message={error ?? 'リストが見つかりません'} />
      </Layout>
    )
  }

  return (
    <Layout>
      {/* ヘッダー */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/gift-lists')}
            className="text-sm text-gray-400 hover:text-gray-600 mb-1"
          >
            ← リスト一覧
          </button>
          <h1 className="text-xl font-bold text-gray-900">{list.name}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {list.groupId ? 'グループリスト' : '個人リスト'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEditListModal(true)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600
              hover:bg-gray-50 transition-colors"
          >
            編集
          </button>
          <button
            onClick={handleDeleteList}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-500
              hover:bg-red-50 transition-colors"
          >
            削除
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* アイテム追加ボタン */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAddItemModal(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white
            hover:bg-indigo-700 transition-colors"
        >
          + アイテムを追加
        </button>
      </div>

      {/* アイテム一覧 */}
      {list.items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 mb-4">まだアイテムがありません</p>
          <button
            onClick={() => setShowAddItemModal(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            最初のアイテムを追加する
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.items.map((item) => (
            <li
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 px-5 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  {item.price != null && (
                    <p className="text-sm text-indigo-600 mt-0.5">
                      ¥{item.price.toLocaleString()}
                    </p>
                  )}
                  {item.memo && (
                    <p className="text-sm text-gray-500 mt-1">{item.memo}</p>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-600 mt-1 block truncate"
                    >
                      {item.url}
                    </a>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={`${item.name}を編集`}
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    aria-label={`${item.name}を削除`}
                  >
                    削除
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showEditListModal && (
        <GiftListFormModal
          initialName={list.name}
          onSubmit={handleUpdateList}
          onClose={() => setShowEditListModal(false)}
        />
      )}
      {showAddItemModal && (
        <GiftItemFormModal onSubmit={handleAddItem} onClose={() => setShowAddItemModal(false)} />
      )}
      {editingItem && (
        <GiftItemFormModal
          initial={editingItem}
          onSubmit={handleUpdateItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </Layout>
  )
}
