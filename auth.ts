import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { JWT } from 'next-auth/jwt'
import { User, Session } from 'next-auth'
import { UserRole } from '@prisma/client'

// Local-dev escape hatch: sign in as any email, no password, no Google client.
// Gated on NODE_ENV so it is never registered in a production build.
export const devLoginEnabled = process.env.NODE_ENV === 'development'

const devProviders = devLoginEnabled
  ? [
      Credentials({
        id: 'dev-login',
        name: 'Dev login',
        credentials: { email: { label: 'Email', type: 'email' } },
        async authorize(credentials) {
          const email = credentials?.email
          if (typeof email !== 'string' || !email.includes('@')) return null

          const role = email === process.env.ADMIN_EMAIL ? UserRole.ADMIN : UserRole.STUDENT

          return prisma.user.upsert({
            where: { email },
            update: {},
            create: { email, role, name: 'Dev User', emailVerified: new Date() },
          })
        },
      }),
    ]
  : []

export const NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' as const },
  providers: [Google({ allowDangerousEmailAccountLinking: true }), ...devProviders],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
    async authorized({ request, auth }: { request: NextRequest; auth: Session | null }) {
      const { pathname } = request.nextUrl

      if (pathname.startsWith('/admin')) {
        return auth?.user?.role === 'ADMIN'
      }

      return true
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(NextAuthConfig)
