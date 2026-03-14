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

export interface GroupMember {
  id: string
  userId: string
  groupId: string
  role: 'owner' | 'member'
  createdAt: string
  user: Pick<User, 'id' | 'name' | 'email'>
}

export interface Group {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  members: GroupMember[]
}
