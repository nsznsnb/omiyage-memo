import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// AuthContextをモック
const mockLogin = vi.fn()
const mockRegister = vi.fn()

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    user: null,
    isLoading: false,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// react-router-domのnavigateをモック
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

import { LoginPage } from '../pages/LoginPage'

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('メールとパスワードの入力欄とログインボタンが表示される', () => {
    renderLogin()

    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
    expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
  })

  it('フォームを送信するとloginが呼ばれる', async () => {
    mockLogin.mockResolvedValue(undefined)
    renderLogin()

    await userEvent.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/パスワード/), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('ログイン成功後に / へ遷移する', async () => {
    mockLogin.mockResolvedValue(undefined)
    renderLogin()

    await userEvent.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/パスワード/), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('ログイン失敗時にエラーメッセージが表示される', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'))
    renderLogin()

    await userEvent.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/パスワード/), 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
    })
  })

  it('新規登録リンクが表示される', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: '新規登録' })).toBeInTheDocument()
  })
})
