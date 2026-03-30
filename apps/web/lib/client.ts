import { hc } from 'hono/client'
import type { AppType } from '@repo/api'

const client = hc<AppType>(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/')

export default client
