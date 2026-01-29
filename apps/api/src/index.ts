import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { telemetrySimulation } from './virtual-simulations/telemetry'

const app = new Hono()
app.use('/*', cors())
telemetrySimulation("device-001"); // mock device
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
  port,
})

export default app
