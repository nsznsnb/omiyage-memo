import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import * as authApi from '../api/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
}

type AuthAction =
  | { type: 'LOGIN'; user: User; accessToken: string; refreshToken: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; isLoading: boolean }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.user, accessToken: action.accessToken, isLoading: false }
    case 'LOGOUT':
      return { user: null, accessToken: null, isLoading: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
  }
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    accessToken: null,
    isLoading: true,
  })

  // 起動時: localStorage からトークンを復元
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    const userJson = localStorage.getItem('user')
    if (accessToken && userJson) {
      try {
        const user = JSON.parse(userJson) as User
        dispatch({ type: 'LOGIN', user, accessToken, refreshToken: '' })
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        dispatch({ type: 'SET_LOADING', isLoading: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', isLoading: false })
    }
  }, [])

  // 401エラー時に自動ログアウト
  useEffect(() => {
    function handleUnauthorized() {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      dispatch({ type: 'LOGOUT' })
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    localStorage.setItem('accessToken', res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)
    localStorage.setItem('user', JSON.stringify(res.user))
    dispatch({ type: 'LOGIN', user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken })
  }, [])

  const register = useCallback(async (email: string, name: string, password: string) => {
    const res = await authApi.register(email, name, password)
    localStorage.setItem('accessToken', res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)
    localStorage.setItem('user', JSON.stringify(res.user))
    dispatch({ type: 'LOGIN', user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken })
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => {})
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isLoading: state.isLoading,
        isAuthenticated: !!state.user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
