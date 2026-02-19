import { type RouteHandler } from '@hono/zod-openapi'
import { eq, and } from 'drizzle-orm'
import { db } from '@repo/db' // adjust to your db instance path
import { devicesTable, userDevicesTable } from '@repo/db' // adjust to your schema path
import type {
  getAllDevicesRoute,
  getDeviceByIdRoute,
  createDeviceRoute,
  assignDeviceRoute,
  getDevicesByUserIdRoute,
  unassignDeviceRoute,
} from './device.route'

export const getAllDevices: RouteHandler<typeof getAllDevicesRoute> = async (
  c
) => {
  try {
    const devices = await db.select().from(devicesTable)

    return c.json(
      {
        success: true,
        count: devices.length,
        data: devices,
      },
      200
    )
  } catch (error) {
    console.error('Error fetching devices:', error)
    return c.json(
      {
        success: false,
        error: 'Failed to fetch devices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}

export const getDeviceById: RouteHandler<typeof getDeviceByIdRoute> = async (
  c
) => {
  const { id } = c.req.valid('param')

  try {
    const [device] = await db
      .select()
      .from(devicesTable)
      .where(eq(devicesTable.id, Number(id)))

    if (!device) {
      return c.json(
        {
          success: false,
          error: 'Device not found',
          message: `No device found with id ${id}`,
        },
        404
      )
    }

    return c.json({ success: true, data: device }, 200)
  } catch (error) {
    console.error('Error fetching device:', error)
    return c.json(
      {
        success: false,
        error: 'Failed to fetch device',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}

export const createDevice: RouteHandler<typeof createDeviceRoute> = async (
  c
) => {
  const { deviceName } = c.req.valid('json')

  try {
    const [device] = await db
      .insert(devicesTable)
      .values({ deviceName })
      .returning()

    return c.json({ success: true, data: device }, 201)
  } catch (error) {
    console.error('Error creating device:', error)
    return c.json(
      {
        success: false,
        error: 'Failed to create device',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}

export const assignDeviceToUser: RouteHandler<
  typeof assignDeviceRoute
> = async (c) => {
  const { deviceId, userId, type } = c.req.valid('json')

  try {
    // Check if device is already assigned to any user
    const [device] = await db
      .select()
      .from(devicesTable)
      .where(eq(devicesTable.id, deviceId))

    const [existingAssignment] = await db
      .select({
        userId: userDevicesTable.userId,
      })
      .from(userDevicesTable)
      .where(eq(userDevicesTable.deviceId, deviceId))

    if (existingAssignment) {
      const isSameUser = existingAssignment.userId === userId
      return c.json(
        {
          success: false,
          error: 'Device already assigned',
          message: isSameUser
            ? `Device ${deviceId} is already assigned to you`
            : `Device ${deviceId} is already assigned to another user and cannot be reassigned`,
        },
        409
      )
    }

    const [assignment] = await db
      .insert(userDevicesTable)
      .values({ deviceId, userId, type })
      .returning()

    return c.json(
      { success: true, data: { ...assignment, deviceName: device.deviceName } },
      201
    )
  } catch (error: any) {
    console.error('Error assigning device:', error)
    return c.json(
      {
        success: false,
        error: 'Failed to assign device to user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}
export const getDevicesByUserId: RouteHandler<
  typeof getDevicesByUserIdRoute
> = async (c) => {
  const { user_id } = c.req.valid('param')

  try {
    const devices = await db
      .select({
        id: userDevicesTable.id,
        deviceId: userDevicesTable.deviceId,
        type: userDevicesTable.type,
        userId: userDevicesTable.userId,
        deviceName: devicesTable.deviceName,
      })
      .from(userDevicesTable)
      .innerJoin(devicesTable, eq(userDevicesTable.deviceId, devicesTable.id))
      .where(eq(userDevicesTable.userId, user_id))

    return c.json(
      {
        success: true,
        count: devices.length,
        data: devices,
      },
      200
    )
  } catch (error) {
    console.error('Error fetching user devices:', error)
    return c.json(
      {
        success: false,
        error: 'Failed to fetch user devices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}

export const unassignDeviceFromUser: RouteHandler<
  typeof unassignDeviceRoute
> = async (c) => {
  const { deviceId, userId } = c.req.valid('json')

  try {
    const [device] = await db
      .select()
      .from(devicesTable)
      .where(eq(devicesTable.id, deviceId))

    const [deleted] = await db
      .delete(userDevicesTable)
      .where(
        and(
          eq(userDevicesTable.deviceId, deviceId),
          eq(userDevicesTable.userId, userId)
        )
      )
      .returning()

    if (!deleted) {
      return c.json(
        {
          success: false,
          error: 'Assignment not found',
          message: `No assignment found for device ${deviceId} and user ${userId}`,
        },
        404
      )
    }

    return c.json(
      { success: true, data: { ...deleted, deviceName: device.deviceName } },
      200
    )
  } catch (error) {
    console.error('Error unassigning device:', error)
    return c.json(
      {
        success: false,
        error: 'Failed to unassign device from user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}
