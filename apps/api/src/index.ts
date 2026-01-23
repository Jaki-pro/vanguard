import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const app = new Hono()

// 1. Enable CORS for the frontend
app.use('/*', cors())

// 2. Define Routes
const route = app
  .get('/', (c) => {
    return c.json({ message: 'Hello Hono!' })
  })
  .post(
    '/hello',
    zValidator(
      'json',
      z.object({
        name: z.string(),
      })
    ),
    (c) => {
      const { name } = c.req.valid('json')
      return c.json({
        message: `Hello ${name}!`,
      })
    }
  )

// 3. Export the Type for the Client
export type AppType = typeof route

// 4. Start Server
const port = 3001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})

export default app