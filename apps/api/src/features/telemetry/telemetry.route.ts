import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import {
  TelemetrySuccessResponseSchema,
  ErrorResponseSchema,
  DeviceIdParamSchema,
} from './telemetry.schema'
import { getTelemetryByDeviceId } from './telemetry.handler'

export const telemetryRoute = new OpenAPIHono()

const getTelemetryRoute = createRoute({
  method: 'get',
  path: '/{device_id}',
  tags: ['Telemetry'],
  summary: 'Get device telemetry',
  description:
    'Retrieve the last 100 telemetry data points for a specific device, sorted by timestamp (newest first)',
  request: {
    params: DeviceIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TelemetrySuccessResponseSchema,
        },
      },
      description: 'Successfully retrieved telemetry data',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Internal server error',
    },
  },
})

telemetryRoute.openapi(getTelemetryRoute, getTelemetryByDeviceId)
