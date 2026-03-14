import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ErrorMessage } from '../components/ErrorMessage'
import { GiftListFormModal } from '../components/GiftListFormModal'
import { GiftItemFormModal } from '../components/GiftItemFormModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
        <p className="text-muted-foreground text-center py-12">読み込み中...</p>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/gift-lists')}
            className="mb-1 -ml-2 text-muted-foreground"
          >
            ← リスト一覧
          </Button>
          <h1 className="text-xl font-bold">{list.name}</h1>
          <div className="mt-1">
            <Badge variant={list.groupId ? 'secondary' : 'outline'}>
              {list.groupId ? 'グループリスト' : '個人リスト'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEditListModal(true)}>
            編集
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteList}>
            削除
          </Button>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* アイテム追加ボタン */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAddItemModal(true)}>+ アイテムを追加</Button>
      </div>

      {/* アイテム一覧 */}
      {list.items.length === 0 ? (
        <div className="text-center py-12 border rounded-xl">
          <p className="text-muted-foreground mb-4">まだアイテムがありません</p>
          <Button variant="link" onClick={() => setShowAddItemModal(true)}>
            最初のアイテムを追加する
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.items.map((item) => (
            <li key={item.id}>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{item.name}</p>
                      {item.price != null && (
                        <p className="text-sm text-primary mt-0.5">
                          ¥{item.price.toLocaleString()}
                        </p>
                      )}
                      {item.memo && (
                        <p className="text-sm text-muted-foreground mt-1">{item.memo}</p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary/70 hover:text-primary mt-1 block truncate"
                        >
                          {item.url}
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingItem(item)}
                        aria-label={`${item.name}を編集`}
                      >
                        編集
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item)}
                        aria-label={`${item.name}を削除`}
                        className="text-destructive hover:text-destructive"
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
