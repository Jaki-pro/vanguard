import { z } from '@hono/zod-openapi'

export const DeviceSchema = z.object({
  id: z.number().int().openapi({
    example: 1,
    description: 'Unique device identifier',
  }),
  deviceName: z.string().openapi({
    example: 'device-001',
    description: 'Name of the device',
  }),
})

export const UserDeviceSchema = z.object({
  id: z.number().int().openapi({
    example: 1,
    description: 'Unique user-device relation identifier',
  }),
  deviceId: z.number().int().openapi({
    example: 1,
    description: 'Device ID',
  }),
  userId: z.string().openapi({
    example: 'user-123',
    description: 'User ID',
  }),
  deviceName: z.string().openapi({
    example: 'device-001',
    description: 'Name of the device',
  }),
  type: z.string().openapi({
    example: 'car',
    description: 'Type of the device (e.g., car, bike, etc.)',
  }),
})

export const CreateDeviceBodySchema = z.object({
  deviceName: z.string().min(1).openapi({
    example: 'device-001',
    description: 'Name of the device to create',
  }),
})

export const AssignDeviceBodySchema = z.object({
  deviceId: z.number().int().openapi({
    example: 1,
    description: 'ID of the device to assign to the user',
  }),
  userId: z.string().openapi({
    example: 'user-123',
    description: 'ID of the user to assign the device to',
  }),
  type: z.string().openapi({
    example: 'car',
    description: 'Type of the device (e.g., car, bike, etc.)',
  }),
})
export const UnAssignDeviceBodySchema = z.object({
  deviceId: z.number().int().openapi({
    example: 1,
    description: 'ID of the device to unassign from the user',
  }),
  userId: z.string().openapi({
    example: 'user-123',
    description: 'ID of the user to unassign the device from',
  }),
})
export const DeviceIdParamSchema = z.object({
  id: z.string().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: '1',
    description: 'Unique identifier of the device',
  }),
})

export const UserIdParamSchema = z.object({
  user_id: z.string().openapi({
    param: {
      name: 'user_id',
      in: 'path',
    },
    example: 'user-123',
    description: 'Unique identifier of the user',
  }),
})

export const DeviceSuccessResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: DeviceSchema,
})

export const DeviceListSuccessResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  count: z.number().int().openapi({ example: 10 }),
  data: z.array(DeviceSchema),
})

export const UserDeviceSuccessResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: UserDeviceSchema,
})

export const UserDeviceListSuccessResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  count: z.number().int().openapi({ example: 5 }),
  data: z.array(UserDeviceSchema),
})

export const ErrorResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.string().openapi({ example: 'Failed to process request' }),
  message: z.string().optional().openapi({ example: 'Detailed error message' }),
})
