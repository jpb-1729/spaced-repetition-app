import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [Google({ allowDangerousEmailAccountLinking: true })],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
    async authorized({ request, auth }) {
      const { pathname } = request.nextUrl

      if (pathname.startsWith('/admin')) {
        return auth?.user?.role === 'ADMIN'
      }

      return true
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(NextAuthConfig)
