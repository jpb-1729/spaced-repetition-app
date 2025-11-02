import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { JWT } from 'next-auth/jwt'
import { User, Session } from 'next-auth'

export const NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' as const },
  providers: [Google({ allowDangerousEmailAccountLinking: true })],
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
