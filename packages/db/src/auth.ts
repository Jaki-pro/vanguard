import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import { usersTable, session, account } from './schema' // Use your custom name

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: usersTable,
      session: session, // Map 'session' to your custom table name
      account: account,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
})

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user
