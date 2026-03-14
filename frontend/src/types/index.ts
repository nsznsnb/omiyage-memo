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

export interface GiftItem {
  id: string
  name: string
  price: number | null
  memo: string | null
  url: string | null
  giftListId: string
  createdAt: string
  updatedAt: string
}

export interface GiftList {
  id: string
  name: string
  groupId: string | null
  userId: string | null
  createdAt: string
  updatedAt: string
  items: GiftItem[]
}
