import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiresAt,
} from '../lib/jwt.js'
import type { AuthRequest } from '../types/index.js'

export async function register(req: Request, res: Response): Promise<void> {
  const { email, name, password } = req.body as {
    email?: string
    name?: string
    password?: string
  }

  if (!email || !name || !password) {
    res.status(400).json({ error: 'email, name, password are required' })
    return
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: 'Email already registered' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  })

  const payload = { userId: user.id, email: user.email }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiresAt(),
    },
  })

  res.status(201).json({
    data: {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name },
    },
  })
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const payload = { userId: user.id, email: user.email }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiresAt(),
    },
  })

  res.json({
    data: {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name },
    },
  })
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string }

  if (!refreshToken) {
    res.status(400).json({ error: 'refreshToken is required' })
    return
  }

  let payload
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' })
    return
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
  if (!stored || stored.expiresAt < new Date()) {
    res.status(401).json({ error: 'Refresh token not found or expired' })
    return
  }

  const newAccessToken = generateAccessToken({ userId: payload.userId, email: payload.email })

  res.json({ data: { accessToken: newAccessToken } })
}

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string }

  if (!refreshToken) {
    res.status(400).json({ error: 'refreshToken is required' })
    return
  }

  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })

  res.json({ data: { message: 'Logged out successfully' } })
}
