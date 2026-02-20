import 'dotenv/config'
import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { swaggerUI } from '@hono/swagger-ui'
import { telemetrySimulation } from './virtual-simulations/telemetry'
import { brokerSubscribe } from './mqtt/mqtt-client'
import { telemetryRoute } from './features/telemetry/telemetry.route'
import { apiReference } from '@scalar/hono-api-reference'
import { deviceRoute } from './features/device/device.route'

const app = new OpenAPIHono()

// Apply CORS middleware
app.use('/*', cors())

// Start mock devices and broker
telemetrySimulation('1')
telemetrySimulation('2')
telemetrySimulation('3')
telemetrySimulation('4')
telemetrySimulation('5')
brokerSubscribe()

// Mount telemetry routes
app.route('/telemetry', telemetryRoute)
app.route('/devices', deviceRoute)
// OpenAPI JSON endpoint
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'Vehicle Telemetry API',
    version: '1.0.0',
    description:
      'API for retrieving vehicle telemetry data from InfluxDB via MQTT broker',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'General',
      description: 'General API endpoints',
    },
    {
      name: 'Telemetry',
      description: 'Vehicle telemetry data endpoints',
    },
  ],
})

// Swagger UI documentation
// app.get('/docs', swaggerUI({ url: '/openapi.json' }))

// Scalar UI documentation
app.get(
  '/docs',
  apiReference({
    spec: {
      url: '/openapi.json',
    },
    theme: 'purple',
  })
)
// Export type for client
export type AppType = typeof app

// Start Server
const port = 3001

serve({
  fetch: app.fetch,
  port,
})

export default app
