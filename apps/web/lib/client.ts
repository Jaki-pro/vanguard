import { hc } from 'hono/client'
import type { AppType } from '@repo/api'

// Point this to your backend URL (3001)
const client = hc<AppType>('http://localhost:3001/')

export default client