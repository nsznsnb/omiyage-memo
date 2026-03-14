import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ErrorMessage } from '../components/ErrorMessage'
import { GroupFormModal } from '../components/GroupFormModal'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as groupsApi from '../api/groups'
import type { Group } from '../types'

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [group, setGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const [memberError, setMemberError] = useState<string | null>(null)
  const [isAddingMember, setIsAddingMember] = useState(false)

  const isOwner = group?.members.some((m) => m.userId === user?.id && m.role === 'owner')

  useEffect(() => {
    if (id) loadGroup(id)
  }, [id])

  async function loadGroup(groupId: string) {
    try {
      const data = await groupsApi.getGroup(groupId)
      setGroup(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'グループの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdate(name: string) {
    if (!id) return
    const updated = await groupsApi.updateGroup(id, name)
    setGroup(updated)
    setShowEditModal(false)
  }

  async function handleDelete() {
    if (!id || !confirm(`「${group?.name}」を削除しますか？`)) return
    try {
      await groupsApi.deleteGroup(id)
      navigate('/groups')
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !memberEmail.trim()) return
    setMemberError(null)
    setIsAddingMember(true)
    try {
      await groupsApi.addMember(id, memberEmail.trim())
      await loadGroup(id)
      setMemberEmail('')
    } catch (err) {
      setMemberError(err instanceof Error ? err.message : 'メンバーの追加に失敗しました')
    } finally {
      setIsAddingMember(false)
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!id || !confirm('このメンバーを削除しますか？')) return
    try {
      await groupsApi.removeMember(id, memberId)
      setGroup((prev) =>
        prev ? { ...prev, members: prev.members.filter((m) => m.userId !== memberId) } : prev,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メンバーの削除に失敗しました')
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <p className="text-muted-foreground text-center py-12">読み込み中...</p>
      </Layout>
    )
  }

  if (!group) {
    return (
      <Layout>
        <ErrorMessage message={error ?? 'グループが見つかりません'} />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/groups')}
            className="mb-1 -ml-2 text-muted-foreground"
          >
            ← グループ一覧
          </Button>
          <h1 className="text-xl font-bold">{group.name}</h1>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
              編集
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              削除
            </Button>
          </div>
        )}
      </div>

      <ErrorMessage message={error} />

      {/* メンバー一覧 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>メンバー ({group.members.length}人)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ul className="flex flex-col gap-3">
            {group.members.map((member) => (
              <li key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{member.user.name}</span>
                  <span className="text-xs text-muted-foreground">{member.user.email}</span>
                  {member.role === 'owner' && (
                    <Badge variant="secondary">オーナー</Badge>
                  )}
                </div>
                {isOwner && member.userId !== user?.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.userId)}
                    className="text-destructive hover:text-destructive"
                  >
                    削除
                  </Button>
                )}
              </li>
            ))}
          </ul>

          {/* メンバー追加フォーム（ownerのみ） */}
          {isOwner && (
            <form onSubmit={handleAddMember} className="mt-2 pt-4 border-t">
              <p className="text-sm font-medium mb-2">メンバーを追加</p>
              <ErrorMessage message={memberError} />
              <div className="flex gap-2 mt-2">
                <Input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="メールアドレスを入力"
                  aria-label="追加するユーザーのメールアドレス"
                  className="flex-1"
                />
                <Button type="submit" disabled={isAddingMember}>
                  追加
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {showEditModal && (
        <GroupFormModal
          initialName={group.name}
          onSubmit={handleUpdate}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </Layout>
  )
}
