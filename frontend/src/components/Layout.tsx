import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-base sm:text-lg font-bold text-primary hover:text-primary/80 shrink-0">
          おみやげメモ
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/groups">グループ</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/gift-lists">リスト</Link>
          </Button>
          <span className="hidden sm:inline text-sm text-muted-foreground px-2">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            ログアウト
          </Button>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">{children}</main>
    </div>
  )
}
