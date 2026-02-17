import { auth } from '@repo/db'
import { toNextJsHandler } from 'better-auth/next-js'

// ADD THIS LINE
export const runtime = 'nodejs'

export const { GET, POST } = toNextJsHandler(auth)
