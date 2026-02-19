import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import {
  CreateDeviceBodySchema,
  AssignDeviceBodySchema,
  DeviceIdParamSchema,
  UserIdParamSchema,
  DeviceSuccessResponseSchema,
  DeviceListSuccessResponseSchema,
  UserDeviceSuccessResponseSchema,
  UserDeviceListSuccessResponseSchema,
  ErrorResponseSchema,
  UnAssignDeviceBodySchema,
} from './device.schema'
import {
  createDevice,
  getAllDevices,
  unassignDeviceFromUser,
  getDeviceById,
  getDevicesByUserId,
  assignDeviceToUser,
} from './device.handler'

export const deviceRoute = new OpenAPIHono()

export const getAllDevicesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Devices'],
  summary: 'Get all devices',
  description: 'Retrieve all registered devices',
  responses: {
    200: {
      content: {
        'application/json': { schema: DeviceListSuccessResponseSchema },
      },
      description: 'Successfully retrieved all devices',
    },
    500: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Internal server error',
    },
  },
})

export const getDeviceByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Devices'],
  summary: 'Get device by ID',
  description: 'Retrieve a specific device by its ID',
  request: { params: DeviceIdParamSchema },
  responses: {
    200: {
      content: { 'application/json': { schema: DeviceSuccessResponseSchema } },
      description: 'Successfully retrieved device',
    },
    404: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Device not found',
    },
    500: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Internal server error',
    },
  },
})

export const createDeviceRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Devices'],
  summary: 'Create a device',
  description: 'Register a new device',
  request: {
    body: {
      content: { 'application/json': { schema: CreateDeviceBodySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: DeviceSuccessResponseSchema } },
      description: 'Device successfully created',
    },
    500: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Internal server error',
    },
  },
})

export const assignDeviceRoute = createRoute({
  method: 'post',
  path: '/assign',
  tags: ['Devices'],
  summary: 'Assign device to user',
  description: 'Assign an existing device to a user',
  request: {
    body: {
      content: { 'application/json': { schema: AssignDeviceBodySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        'application/json': { schema: UserDeviceSuccessResponseSchema },
      },
      description: 'Device successfully assigned to user',
    },
    409: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Device already assigned to this user',
    },
    500: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Internal server error',
    },
  },
})

export const getDevicesByUserIdRoute = createRoute({
  method: 'get',
  path: '/user/{user_id}',
  tags: ['Devices'],
  summary: 'Get devices by user',
  description: 'Retrieve all devices assigned to a specific user',
  request: { params: UserIdParamSchema },
  responses: {
    200: {
      content: {
        'application/json': { schema: UserDeviceListSuccessResponseSchema },
      },
      description: 'Successfully retrieved user devices',
    },
    500: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Internal server error',
    },
  },
})

export const unassignDeviceRoute = createRoute({
  method: 'delete',
  path: '/assign',
  tags: ['Devices'],
  summary: 'Unassign device from user',
  description: 'Remove the assignment of a device from a user',
  request: {
    body: {
      content: { 'application/json': { schema: UnAssignDeviceBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: UserDeviceSuccessResponseSchema },
      },
      description: 'Device successfully unassigned',
    },
    404: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Assignment not found',
    },
    500: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Internal server error',
    },
  },
})

deviceRoute.openapi(getAllDevicesRoute, getAllDevices)
deviceRoute.openapi(getDeviceByIdRoute, getDeviceById)
deviceRoute.openapi(createDeviceRoute, createDevice)
deviceRoute.openapi(assignDeviceRoute, assignDeviceToUser)
deviceRoute.openapi(getDevicesByUserIdRoute, getDevicesByUserId)
deviceRoute.openapi(unassignDeviceRoute, unassignDeviceFromUser)
