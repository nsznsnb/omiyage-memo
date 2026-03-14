import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ErrorMessage } from '../components/ErrorMessage'
import { GroupFormModal } from '../components/GroupFormModal'
import { useAuth } from '../contexts/AuthContext'
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
        <p className="text-gray-400 text-center py-12">読み込み中...</p>
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
          <button
            onClick={() => navigate('/groups')}
            className="text-sm text-gray-400 hover:text-gray-600 mb-1"
          >
            ← グループ一覧
          </button>
          <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600
                hover:bg-gray-50 transition-colors"
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-500
                hover:bg-red-50 transition-colors"
            >
              削除
            </button>
          </div>
        )}
      </div>

      <ErrorMessage message={error} />

      {/* メンバー一覧 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          メンバー ({group.members.length}人)
        </h2>
        <ul className="flex flex-col gap-3">
          {group.members.map((member) => (
            <li key={member.id} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-800">{member.user.name}</span>
                <span className="text-xs text-gray-400 ml-2">{member.user.email}</span>
                {member.role === 'owner' && (
                  <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 rounded px-1.5 py-0.5">
                    オーナー
                  </span>
                )}
              </div>
              {isOwner && member.userId !== user?.id && (
                <button
                  onClick={() => handleRemoveMember(member.userId)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  削除
                </button>
              )}
            </li>
          ))}
        </ul>

        {/* メンバー追加フォーム（ownerのみ） */}
        {isOwner && (
          <form onSubmit={handleAddMember} className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">メンバーを追加</p>
            <ErrorMessage message={memberError} />
            <div className="flex gap-2 mt-2">
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="メールアドレスを入力"
                aria-label="追加するユーザーのメールアドレス"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm
                  outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                disabled={isAddingMember}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white
                  hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                追加
              </button>
            </div>
          </form>
        )}
      </section>

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
