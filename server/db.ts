import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { createClient } from "@supabase/supabase-js";
import * as schema from "@shared/schema";

// Supabase configuration
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://spzivhoxouqaehkxhssx.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbHlrbmVhZXFrdXpxZ2F6Y251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODkyODIsImV4cCI6MjA2OTU2NTI4Mn0.gWNPRMp0nU2W_nWDfE9B7h4YNSURbl-38aiOW4q1Biw";
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNweml2aG94b3VxYWVoa3hoc3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3OTQ5MDksImV4cCI6MjA2OTM3MDkwOX0.sV9wby_S0f_qnSd7048ELCRarOyzHLl98WUJ1zXuQc8";

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// PostgreSQL connection for Drizzle ORM
// const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.spzivhoxouqaehkxhssx:PSX0321@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";
const DATABASE_URL =
  "postgresql://postgres.bolykneaeqkuzqgazcnu:PSX0321@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
// "postgresql://postgres.spzivhoxouqaehkxhssx:PSX0321@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10, // Reduced max connections
  min: 2, // Minimum connections
  connectionTimeoutMillis: 230000, // Increased timeout
  idleTimeoutMillis: 260000,
  // acquireTimeoutMillis: 30000, // Property doesn't exist on PoolConfig
  statement_timeout: 145000, // Increased statement timeout (45 seconds)
});
export const db = drizzle({ client: pool, schema });
