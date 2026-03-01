import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const isDev = process.env.NODE_ENV !== 'production'
const JWT_SECRET = process.env.JWT_SECRET || (isDev ? 'dev-secret-change-in-production' : null)

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables')
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}