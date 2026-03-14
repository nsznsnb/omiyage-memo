import jwt from 'jsonwebtoken'
import type { AuthPayload } from '../types/index.js'

const ACCESS_TOKEN_EXPIRES_IN = '15m'
const REFRESH_TOKEN_EXPIRES_IN = '7d'
const REFRESH_TOKEN_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000

function getSecret(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Environment variable ${key} is not set`)
  return value
}

export function generateAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, getSecret('JWT_SECRET'), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  })
}

export function generateRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, getSecret('JWT_REFRESH_SECRET'), {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  })
}

export function verifyAccessToken(token: string): AuthPayload {
  return jwt.verify(token, getSecret('JWT_SECRET')) as AuthPayload
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, getSecret('JWT_REFRESH_SECRET')) as AuthPayload
}

export function getRefreshTokenExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS)
}
