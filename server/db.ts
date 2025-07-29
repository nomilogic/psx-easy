import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { createClient } from "@supabase/supabase-js";
import * as schema from "@shared/schema";

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://spzivhoxouqaehkxhssx.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNweml2aG94b3VxYWVoa3hoc3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3OTQ5MDksImV4cCI6MjA2OTM3MDkwOX0.sV9wby_S0f_qnSd7048ELCRarOyzHLl98WUJ1zXuQc8";

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// PostgreSQL connection for Drizzle ORM
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.spzivhoxouqaehkxhssx:PSX0321@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

if (!DATABASE_URL) {
  console.log("DATABASE_URL", DATABASE_URL);
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
});
export const db = drizzle({ client: pool, schema });
