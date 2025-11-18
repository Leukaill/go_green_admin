/**
 * Supabase Browser Client
 * 
 * This client is used for client-side operations in the browser.
 * It uses the ANON key which is safe to expose publicly.
 * 
 * Usage:
 * import { supabase } from '@/lib/supabase/client';
 * 
 * const { data, error } = await supabase
 *   .from('products')
 *   .select('*');
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client with SSR support for proper cookie handling
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Helper function to check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Helper function to get current user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Helper function to get current admin
 */
export async function getCurrentAdmin() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching admin:', error);
    return null;
  }

  return admin;
}

/**
 * Helper function to sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}
