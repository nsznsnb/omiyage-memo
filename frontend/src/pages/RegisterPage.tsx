import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FormField } from '../components/FormField'
import { ErrorMessage } from '../components/ErrorMessage'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">新規登録</h1>
        <p className="text-sm text-gray-500 mb-6">おみやげメモのアカウントを作成</p>

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

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold
              text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            {isSubmitting ? '登録中...' : 'アカウントを作成'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          すでにアカウントをお持ちの方は{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
