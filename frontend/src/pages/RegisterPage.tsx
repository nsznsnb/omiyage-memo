import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FormField } from '../components/FormField'
import { ErrorMessage } from '../components/ErrorMessage'
import { Button } from '@/components/ui/button'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await register(email, name, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm bg-background rounded-2xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold mb-1">新規登録</h1>
        <p className="text-sm text-muted-foreground mb-6">おみやげメモのアカウントを作成</p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <ErrorMessage message={error} />

          <FormField
            label="名前"
            id="name"
            value={name}
            onChange={setName}
            required
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full" size="lg">
            {isSubmitting ? '登録中...' : 'アカウントを作成'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          すでにアカウントをお持ちの方は{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary/80">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
