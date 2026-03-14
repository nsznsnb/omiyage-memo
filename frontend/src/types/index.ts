export interface User {
  id: string
  email: string
  name: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface ApiError {
  error: string
}
