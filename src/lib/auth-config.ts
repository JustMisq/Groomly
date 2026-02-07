import { getServerSession } from "next-auth/next"
import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { logger } from "@/lib/logger"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    isAdmin?: boolean
  }
  interface Session {
    user: User & {
      id: string
      isAdmin?: boolean
    }
  }
}

export const authConfig: NextAuthOptions = {
  // ✅ SÉCURITÉ: Secret requis pour JWT
  secret: process.env.NEXTAUTH_SECRET,
  
  // ✅ SÉCURITÉ: JWT strategy pour les APIs
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60,   // Refresh token après 1 jour d'inactivité
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.warn("AUTH", "Tentative login sans credentials")
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          logger.warn("AUTH", `User not found: ${credentials.email}`)
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) {
          logger.warn("AUTH", `Invalid password for: ${credentials.email}`)
          return null
        }

        logger.info("AUTH", `User logged in: ${user.id}`)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin || false
      }
      return token
    },
    session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  // ✅ SÉCURITÉ: Configuration des cookies
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
  // ✅ DEBUG en development uniquement
  debug: process.env.NODE_ENV === 'development',
}

export const handler = NextAuth(authConfig)
export const { GET, POST } = handler
