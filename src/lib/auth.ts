import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const secret = new TextEncoder().encode(JWT_SECRET)

export interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(user: User): Promise<string> {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret)
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    const user = payload as unknown as User
    return user
  } catch (error) {
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return null
  }

  const isValidPassword = await verifyPassword(password, user.password)
  if (!isValidPassword) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'USER' | 'ADMIN'
  }
}
