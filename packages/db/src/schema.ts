import {
  integer,
  pgTable,
  varchar,
  boolean,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
  id: varchar({ length: 255 }).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: varchar({ length: 500 }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
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
    userId: varchar({ length: 255 })
      .notNull()
      .references(() => usersTable.id),
  },
  (t) => [unique('unique_user_device').on(t.userId, t.deviceId)]
)

export const session = pgTable('session', {
  id: varchar({ length: 255 }).primaryKey(),
  expiresAt: timestamp().notNull(),
  token: varchar({ length: 500 }).notNull().unique(),
  ipAddress: varchar({ length: 45 }),
  userAgent: varchar({ length: 500 }),
  userId: varchar({ length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
})

export const account = pgTable('account', {
  id: varchar({ length: 255 }).primaryKey(),
  accountId: varchar({ length: 255 }).notNull(),
  providerId: varchar({ length: 255 }).notNull(),
  userId: varchar({ length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  accessToken: varchar({ length: 1000 }),
  refreshToken: varchar({ length: 1000 }),
  idToken: varchar({ length: 1000 }),
  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),
  scope: varchar({ length: 500 }),
  password: varchar({ length: 255 }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
})
