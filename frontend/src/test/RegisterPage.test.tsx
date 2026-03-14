import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const mockRegister = vi.fn()

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

import { RegisterPage } from '../pages/RegisterPage'

function renderRegister() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RegisterPage', () => {
  it('名前・メール・パスワードの入力欄と登録ボタンが表示される', () => {
    renderRegister()

    expect(screen.getByLabelText(/名前/)).toBeInTheDocument()
    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
    expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'アカウントを作成' })).toBeInTheDocument()
  })

  it('フォームを送信するとregisterが呼ばれる', async () => {
    mockRegister.mockResolvedValue(undefined)
    renderRegister()

    await userEvent.type(screen.getByLabelText(/名前/), 'Alice')
    await userEvent.type(screen.getByLabelText(/メールアドレス/), 'alice@example.com')
    await userEvent.type(screen.getByLabelText(/パスワード/), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'アカウントを作成' }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('alice@example.com', 'Alice', 'password123')
    })
  })

  it('登録成功後に / へ遷移する', async () => {
    mockRegister.mockResolvedValue(undefined)
    renderRegister()

    await userEvent.type(screen.getByLabelText(/名前/), 'Alice')
    await userEvent.type(screen.getByLabelText(/メールアドレス/), 'alice@example.com')
    await userEvent.type(screen.getByLabelText(/パスワード/), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'アカウントを作成' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('登録失敗時にエラーメッセージが表示される', async () => {
    mockRegister.mockRejectedValue(new Error('Email already registered'))
    renderRegister()

    await userEvent.type(screen.getByLabelText(/名前/), 'Alice')
    await userEvent.type(screen.getByLabelText(/メールアドレス/), 'alice@example.com')
    await userEvent.type(screen.getByLabelText(/パスワード/), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'アカウントを作成' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email already registered')
    })
  })

  it('ログインリンクが表示される', () => {
    renderRegister()
    expect(screen.getByRole('link', { name: 'ログイン' })).toBeInTheDocument()
  })
})
