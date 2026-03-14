import { apiRequest } from './client'
import type { User, AuthTokens } from '../types'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export async function register(
  email: string,
  name: string,
  password: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, name, password }),
    skipAuth: true,
  })
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  })
}

export async function refreshToken(token: string): Promise<Pick<AuthTokens, 'accessToken'>> {
  return apiRequest<Pick<AuthTokens, 'accessToken'>>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: token }),
    skipAuth: true,
  })
}

export async function logout(token: string): Promise<void> {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: token }),
  })
}
