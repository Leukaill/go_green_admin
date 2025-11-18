'use client';

import { supabase } from './supabase/client';

export type UserRole = 'super_admin' | 'admin' | 'moderator';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: string;
}

/**
 * Login admin user with email and password
 * Verifies against admins table after Supabase auth
 */
export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Authentication failed' };
    }

    // Verify user is an admin
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (adminError) {
      console.error('Admin fetch error:', adminError);
      await supabase.auth.signOut();
      return { 
        success: false, 
        error: 'Database error. Please contact support with error code: RLS_ERROR' 
      };
    }

    if (!admin) {
      await supabase.auth.signOut();
      return { 
        success: false, 
        error: 'Access denied. This account is not registered as an admin. Please contact the super administrator.' 
      };
    }

    // Type assertion for admin data
    const adminData = admin as any;

    // Check if admin is active
    if (adminData.status !== 'active') {
      await supabase.auth.signOut();
      return { success: false, error: `Account is ${adminData.status}. Please contact super admin.` };
    }

    // Update last login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() } as any)
      .eq('id', adminData.id);

    return {
      success: true,
      user: {
        id: adminData.id,
        email: adminData.email,
        name: adminData.name,
        role: adminData.role,
        status: adminData.status,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Login failed' };
  }
}

/**
 * Sign up super admin (first time setup)
 * Creates both auth user and admin record automatically
 */
export async function signupSuperAdmin(
  email: string, 
  password: string, 
  name: string, 
  phone?: string
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'super_admin',
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create account' };
    }

    // Admin record is created automatically by database trigger
    // No need to insert manually

    return {
      success: true,
      user: {
        id: authData.user.id,
        email,
        name,
        role: 'super_admin',
        status: 'active',
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Signup failed' };
  }
}

/**
 * Logout current admin user
 */
export async function logoutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Get current admin user
 */
export async function getCurrentAdmin(): Promise<AuthUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!admin) return null;

    const adminData = admin as any;

    return {
      id: adminData.id,
      email: adminData.email,
      name: adminData.name,
      role: adminData.role,
      status: adminData.status,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get user role
 */
export async function getUserRole(): Promise<UserRole | null> {
  const admin = await getCurrentAdmin();
  return admin?.role || null;
}

/**
 * Check if current user is super admin (async version)
 */
export async function checkIsSuperAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'super_admin';
}

/**
 * Legacy function for compatibility - use getCurrentAdmin instead
 */
export async function getUser(): Promise<{ name: string; email: string } | null> {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  return { name: admin.name, email: admin.email };
}

/**
 * Synchronous check for super admin (for client components)
 * This checks localStorage for cached role
 */
export function isSuperAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  const role = localStorage.getItem('admin-role');
  return role === 'super_admin';
}

/**
 * Store admin role in localStorage for synchronous access
 */
export function cacheAdminRole(role: UserRole): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin-role', role);
  }
}

/**
 * Clear cached admin role
 */
export function clearAdminRole(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin-role');
  }
}
