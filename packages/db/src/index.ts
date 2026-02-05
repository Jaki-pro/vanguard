import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from "dotenv" 
export const db = drizzle(process.env.DATABASE_URL!);
