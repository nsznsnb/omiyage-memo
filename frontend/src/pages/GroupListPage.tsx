import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ErrorMessage } from '../components/ErrorMessage'
import { GroupFormModal } from '../components/GroupFormModal'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import * as groupsApi from '../api/groups'
import type { Group } from '../types'

export function GroupListPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [])

  async function loadGroups() {
    try {
      const data = await groupsApi.listGroups()
      setGroups(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'グループの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate(name: string) {
    const group = await groupsApi.createGroup(name)
    setGroups((prev) => [group, ...prev])
    setShowModal(false)
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">グループ一覧</h1>
        <Button onClick={() => setShowModal(true)}>+ グループを作成</Button>
      </div>

      <ErrorMessage message={error} />

      {isLoading ? (
        <p className="text-muted-foreground text-center py-12">読み込み中...</p>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">まだグループがありません</p>
          <Button variant="link" onClick={() => setShowModal(true)}>
            最初のグループを作成する
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {groups.map((group) => (
            <li key={group.id}>
              <Link to={`/groups/${group.id}`}>
                <Card className="hover:ring-primary/30 transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>{group.members.length}人のメンバー</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <GroupFormModal
          onSubmit={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
    </Layout>
  )
}
