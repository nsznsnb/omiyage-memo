import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FormField } from '../components/FormField'
import { ErrorMessage } from '../components/ErrorMessage'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">ログイン</h1>
        <p className="text-sm text-gray-500 mb-6">おみやげメモにログイン</p>

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

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold
              text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          アカウントをお持ちでない方は{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
