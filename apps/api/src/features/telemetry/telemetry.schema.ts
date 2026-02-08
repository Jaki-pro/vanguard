import { z } from '@hono/zod-openapi'

// Zod schemas for validation
export const TelemetryDataPointSchema = z.object({
  timestamp: z.string().datetime().openapi({ 
    example: '2026-02-07T17:37:27.482Z',
    description: 'ISO 8601 timestamp of the data point'
  }),
  device_id: z.string().openapi({ 
    example: 'device-001',
    description: 'Unique device identifier'
  }),
  status: z.string().openapi({ 
    example: 'active',
    description: 'Current device status'
  }),
  latitude: z.number().openapi({ 
    example: 23.810331,
    description: 'GPS latitude coordinate'
  }),
  longitude: z.number().openapi({ 
    example: 90.412521,
    description: 'GPS longitude coordinate'
  }),
  altitude: z.number().openapi({ 
    example: 12.5,
    description: 'Altitude in meters'
  }),
  speed: z.number().openapi({ 
    example: 46.54,
    description: 'Speed in km/h'
  }),
  heading: z.number().int().openapi({ 
    example: 180,
    description: 'Direction heading in degrees (0-360)'
  }),
  accuracy: z.number().openapi({ 
    example: 3.5,
    description: 'GPS accuracy in meters'
  }),
  satellites: z.number().int().openapi({ 
    example: 12,
    description: 'Number of GPS satellites connected'
  }),
  battery_level: z.number().int().openapi({ 
    example: 85,
    description: 'Battery level percentage (0-100)'
  }),
  charging: z.boolean().openapi({ 
    example: false,
    description: 'Whether device is currently charging'
  }),
  signal_strength: z.number().int().openapi({ 
    example: -65,
    description: 'Signal strength in dBm'
  }),
  temperature: z.number().openapi({ 
    example: 32.5,
    description: 'Device temperature in Celsius'
  }),
})

export const TelemetrySuccessResponseSchema = z.object({
  success: z.boolean().openapi({ 
    example: true,
    description: 'Indicates if the request was successful'
  }),
  device_id: z.string().openapi({ 
    example: 'device-001',
    description: 'The requested device ID'
  }),
  count: z.number().int().openapi({ 
    example: 100,
    description: 'Number of data points returned'
  }),
  data: z.array(TelemetryDataPointSchema).openapi({
    description: 'Array of telemetry data points'
  }),
})

export const ErrorResponseSchema = z.object({
  success: z.boolean().openapi({ 
    example: false 
  }),
  error: z.string().openapi({ 
    example: 'Failed to fetch telemetry data' 
  }),
  message: z.string().optional().openapi({ 
    example: 'Connection timeout' 
  }),
})

export const DeviceIdParamSchema = z.object({
  device_id: z.string().openapi({
    param: {
      name: 'device_id',
      in: 'path',
    },
    example: 'device-001',
    description: 'Unique identifier for the device (e.g., device-001, device-002)',
  }),
})