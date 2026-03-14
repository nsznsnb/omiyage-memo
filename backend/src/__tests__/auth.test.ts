import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'

// Prismaクライアントをモック
vi.mock('../lib/prisma.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

import prisma from '../lib/prisma.js'
import { register, login, refresh, logout } from '../controllers/auth.js'

// テスト用のモックユーザー
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: await bcrypt.hash('password123', 10),
  createdAt: new Date(),
  updatedAt: new Date(),
}

function mockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  return res as unknown as Response
}

function mockReq(body: Record<string, unknown> = {}, headers: Record<string, string> = {}): Request {
  return { body, headers } as unknown as Request
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.JWT_SECRET = 'test-secret'
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
})

describe('POST /api/v1/auth/register', () => {
  it('必須フィールドが不足している場合は400を返す', async () => {
    const req = mockReq({ email: 'test@example.com' })
    const res = mockRes()

    await register(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'email, name, password are required' })
  })

  it('すでに登録済みのメールアドレスは409を返す', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)

    const req = mockReq({ email: 'test@example.com', name: 'Test', password: 'pass123' })
    const res = mockRes()

    await register(req, res)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({ error: 'Email already registered' })
  })

  it('正常登録時はアクセストークンとリフレッシュトークンを返す', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser)
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({
      id: 'rt-1',
      token: 'refresh-token',
      userId: mockUser.id,
      expiresAt: new Date(),
      createdAt: new Date(),
    })

    const req = mockReq({ email: 'new@example.com', name: 'New User', password: 'password123' })
    const res = mockRes()

    await register(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    const jsonArg = vi.mocked(res.json).mock.calls[0][0] as { data: { accessToken: string; refreshToken: string } }
    expect(jsonArg.data.accessToken).toBeDefined()
    expect(jsonArg.data.refreshToken).toBeDefined()
  })
})

describe('POST /api/v1/auth/login', () => {
  it('必須フィールドが不足している場合は400を返す', async () => {
    const req = mockReq({ email: 'test@example.com' })
    const res = mockRes()

    await login(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('存在しないメールアドレスは401を返す', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const req = mockReq({ email: 'notfound@example.com', password: 'password123' })
    const res = mockRes()

    await login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' })
  })

  it('パスワードが間違っている場合は401を返す', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)

    const req = mockReq({ email: 'test@example.com', password: 'wrongpassword' })
    const res = mockRes()

    await login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' })
  })

  it('正常ログイン時はトークンを返す', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({
      id: 'rt-1',
      token: 'refresh-token',
      userId: mockUser.id,
      expiresAt: new Date(),
      createdAt: new Date(),
    })

    const req = mockReq({ email: 'test@example.com', password: 'password123' })
    const res = mockRes()

    await login(req, res)

    expect(res.status).not.toHaveBeenCalledWith(401)
    const jsonArg = vi.mocked(res.json).mock.calls[0][0] as { data: { accessToken: string } }
    expect(jsonArg.data.accessToken).toBeDefined()
  })
})

describe('POST /api/v1/auth/refresh', () => {
  it('refreshTokenが未指定の場合は400を返す', async () => {
    const req = mockReq({})
    const res = mockRes()

    await refresh(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('無効なトークンは401を返す', async () => {
    const req = mockReq({ refreshToken: 'invalid-token' })
    const res = mockRes()

    await refresh(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
  })
})

describe('POST /api/v1/auth/logout', () => {
  it('refreshTokenが未指定の場合は400を返す', async () => {
    const req = mockReq({})
    const res = mockRes()

    await logout(req as never, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('正常ログアウト時はリフレッシュトークンを削除する', async () => {
    vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 1 })

    const req = mockReq({ refreshToken: 'some-refresh-token' })
    const res = mockRes()

    await logout(req as never, res)

    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { token: 'some-refresh-token' },
    })
    expect(res.json).toHaveBeenCalledWith({
      data: { message: 'Logged out successfully' },
    })
  })
})
