import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-base sm:text-lg font-bold text-indigo-600 hover:text-indigo-700 shrink-0">
          おみやげメモ
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link to="/groups" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            グループ
          </Link>
          <Link to="/gift-lists" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            リスト
          </Link>
          <span className="hidden sm:inline text-sm text-gray-400">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ログアウト
          </button>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">{children}</main>
    </div>
  )
}
