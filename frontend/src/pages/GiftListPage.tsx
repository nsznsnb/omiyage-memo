import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ErrorMessage } from '../components/ErrorMessage'
import { GiftListFormModal } from '../components/GiftListFormModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card'
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
        <h1 className="text-xl font-bold">プレゼントリスト</h1>
        <Button onClick={() => setShowModal(true)}>+ リストを作成</Button>
      </div>

      <ErrorMessage message={error} />

      {isLoading ? (
        <p className="text-muted-foreground text-center py-12">読み込み中...</p>
      ) : lists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">まだリストがありません</p>
          <Button variant="link" onClick={() => setShowModal(true)}>
            最初のリストを作成する
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {lists.map((list) => (
            <li key={list.id}>
              <Link to={`/gift-lists/${list.id}`}>
                <Card className="hover:ring-primary/30 transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{list.name}</CardTitle>
                    <CardDescription>{list.items.length}件のアイテム</CardDescription>
                    <CardAction>
                      <Badge variant={list.groupId ? 'secondary' : 'outline'}>
                        {list.groupId ? 'グループリスト' : '個人リスト'}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                </Card>
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
