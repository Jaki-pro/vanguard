import { integer, pgTable, varchar, unique } from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
})
export const devicesTable = pgTable('devices', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deviceName: varchar({ length: 255 }).notNull(),
})
export const userDevicesTable = pgTable(
  'userDevices',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    deviceId: integer()
      .notNull()
      .references(() => devicesTable.id),
    userId: integer()
      .notNull()
      .references(() => usersTable.id),
  },
  (t) => [unique('unique_user_device').on(t.userId, t.deviceId)]
)