import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection for Supabase
const connectionString = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';

if (!connectionString) {
  throw new Error('Database connection string is missing');
}

// Create postgres client with proper configuration for Supabase
const client = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});

export const db = drizzle(client, { schema }); // Drizzle instance
export const sql = client; // Export the raw postgres client as 'sql'

export * from './schema';
