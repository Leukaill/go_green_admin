/**
 * Supabase Server Client
 * 
 * This client is used for server-side operations (API routes, server components).
 * It uses the SERVICE ROLE key which should NEVER be exposed to the client.
 * 
 * Usage:
 * import { createServerClient } from '@/lib/supabase/server';
 * 
 * const supabase = createServerClient();
 * const { data, error } = await supabase
 *   .from('products')
 *   .select('*');
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

/**
 * Create a Supabase client with service role key
 * WARNING: This bypasses Row Level Security (RLS)
 * Only use this for admin operations that require elevated permissions
 */
export function createServerClient() {
  return createClient<Database>(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Create a Supabase client for server-side auth operations
 * This respects RLS policies
 */
export function createServerAuthClient() {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }

  return createClient<Database>(supabaseUrl!, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
