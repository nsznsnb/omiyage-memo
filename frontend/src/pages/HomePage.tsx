import { useAuth } from '../contexts/AuthContext'

export function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">おみやげメモ</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button
            onClick={() => logout()}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-gray-500 text-center">グループ・リスト機能は実装予定です</p>
      </main>
    </div>
  )
}
