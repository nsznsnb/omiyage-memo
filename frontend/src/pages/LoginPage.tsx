import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FormField } from '../components/FormField'
import { ErrorMessage } from '../components/ErrorMessage'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm bg-background rounded-2xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold mb-1">ログイン</h1>
        <p className="text-sm text-muted-foreground mb-6">おみやげメモにログイン</p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <ErrorMessage message={error} />

          <FormField
            label="メールアドレス"
            id="email"
            type="email"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
          />
          <FormField
            label="パスワード"
            id="password"
            type="password"
            value={password}
            onChange={setPassword}
            required
            autoComplete="current-password"
          />

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full" size="lg">
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          アカウントをお持ちでない方は{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary/80">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
