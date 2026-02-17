import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
console.log('db string => ', process.env.DATABASE_URL!)
export const db = drizzle(
  'postgresql://postgres:password@localhost:5432/vanguard_db'
)
