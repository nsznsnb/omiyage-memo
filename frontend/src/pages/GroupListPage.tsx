import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ErrorMessage } from '../components/ErrorMessage'
import { GroupFormModal } from '../components/GroupFormModal'
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
        <h1 className="text-xl font-bold text-gray-900">グループ一覧</h1>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white
            hover:bg-indigo-700 transition-colors"
        >
          + グループを作成
        </button>
      </div>

      <ErrorMessage message={error} />

      {isLoading ? (
        <p className="text-gray-400 text-center py-12">読み込み中...</p>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">まだグループがありません</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            最初のグループを作成する
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                to={`/groups/${group.id}`}
                className="flex items-center justify-between rounded-xl bg-white border
                  border-gray-200 px-5 py-4 hover:border-indigo-300 hover:shadow-sm transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">{group.name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {group.members.length}人のメンバー
                  </p>
                </div>
                <span className="text-gray-300 text-lg">›</span>
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
