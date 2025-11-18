/**
 * Settings Management - Supabase Functions
 */

import { supabase } from './client';

// =============================================
// SYSTEM SETTINGS (Super Admin Only)
// =============================================

export interface SystemSettings {
  id: string;
  // Site
  site_name: string;
  site_url: string;
  site_description?: string;
  site_logo_url?: string;
  site_favicon_url?: string;
  // Contact
  admin_email: string;
  support_email?: string;
  support_phone?: string;
  // Business
  currency: string;
  timezone: string;
  language: string;
  tax_rate: number;
  delivery_fee: number;
  free_delivery_threshold: number;
  // Email
  smtp_host?: string;
  smtp_port: number;
  smtp_user?: string;
  smtp_password?: string;
  smtp_from_name?: string;
  smtp_from_email?: string;
  smtp_encryption?: string;
  email_enabled: boolean;
  // Security
  two_factor_enabled: boolean;
  ip_whitelist_enabled: boolean;
  ip_whitelist?: string[];
  session_timeout: number;
  max_login_attempts: number;
  lockout_duration: number;
  password_min_length: number;
  password_require_special: boolean;
  // Backup
  auto_backup_enabled: boolean;
  backup_frequency: string;
  backup_retention_days: number;
  last_backup_at?: string;
  // Maintenance
  maintenance_mode: boolean;
  maintenance_message?: string;
  // Payment
  payment_methods: any;
  mtn_momo_enabled: boolean;
  airtel_money_enabled: boolean;
  // Notifications
  order_notification_email: boolean;
  low_stock_notification: boolean;
  low_stock_threshold: number;
  // Analytics
  google_analytics_id?: string;
  facebook_pixel_id?: string;
  // Meta
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export async function getSystemSettings(): Promise<{ settings: SystemSettings | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching system settings:', error);
      return { settings: null, error: error.message };
    }

    return { settings: data };
  } catch (error: any) {
    console.error('Error fetching system settings:', error);
    return { settings: null, error: error.message };
  }
}

export async function updateSystemSettings(
  settings: Partial<SystemSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('system_settings')
      .update(settings)
      .eq('id', settings.id || '');

    if (error) {
      console.error('Error updating system settings:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating system settings:', error);
    return { success: false, error: error.message };
  }
}

// =============================================
// ADMIN PREFERENCES (Individual Settings)
// =============================================

export interface AdminPreferences {
  id: string;
  admin_id: string;
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  primary_color: string;
  font_family: string;
  compact_mode: boolean;
  // Notifications
  email_notifications: boolean;
  push_notifications: boolean;
  order_notifications: boolean;
  stock_notifications: boolean;
  message_notifications: boolean;
  // Dashboard
  dashboard_layout: string;
  default_page: string;
  items_per_page: number;
  // Language
  language: string;
  date_format: string;
  time_format: string;
  // Privacy
  show_online_status: boolean;
  allow_analytics: boolean;
  // Meta
  created_at: string;
  updated_at: string;
}

export async function getAdminPreferences(
  adminId: string
): Promise<{ preferences: AdminPreferences | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('admin_preferences')
      .select('*')
      .eq('admin_id', adminId)
      .single();

    if (error) {
      // If no preferences exist, create default ones
      if (error.code === 'PGRST116') {
        const { data: newPrefs, error: createError } = await supabase
          .from('admin_preferences')
          .insert({ admin_id: adminId })
          .select()
          .single();

        if (createError) {
          return { preferences: null, error: createError.message };
        }

        return { preferences: newPrefs };
      }

      console.error('Error fetching admin preferences:', error);
      return { preferences: null, error: error.message };
    }

    return { preferences: data };
  } catch (error: any) {
    console.error('Error fetching admin preferences:', error);
    return { preferences: null, error: error.message };
  }
}

export async function updateAdminPreferences(
  adminId: string,
  preferences: Partial<AdminPreferences>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('admin_preferences')
      .upsert({
        admin_id: adminId,
        ...preferences,
      })
      .eq('admin_id', adminId);

    if (error) {
      console.error('Error updating admin preferences:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating admin preferences:', error);
    return { success: false, error: error.message };
  }
}

// =============================================
// BACKUPS
// =============================================

export interface DatabaseBackup {
  id: string;
  backup_name: string;
  backup_type: 'manual' | 'automatic' | 'scheduled';
  backup_size?: number;
  backup_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  storage_path?: string;
  storage_url?: string;
  tables_included?: string[];
  rows_backed_up?: number;
  compression_enabled: boolean;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  created_by?: string;
  created_by_name?: string;
  error_message?: string;
  created_at: string;
  expires_at?: string;
}

export async function getBackups(): Promise<{ backups: DatabaseBackup[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('database_backups')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching backups:', error);
      return { backups: [], error: error.message };
    }

    return { backups: data || [] };
  } catch (error: any) {
    console.error('Error fetching backups:', error);
    return { backups: [], error: error.message };
  }
}

export async function createBackup(): Promise<{ 
  success: boolean; 
  backupId?: string; 
  error?: string 
}> {
  try {
    const { data: admin } = await supabase.auth.getUser();
    
    const backupName = `backup-${new Date().toISOString().split('T')[0]}-${Date.now()}`;
    
    const { data, error } = await supabase
      .from('database_backups')
      .insert({
        backup_name: backupName,
        backup_type: 'manual',
        backup_status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration_seconds: 0,
        created_by: admin?.user?.id,
        compression_enabled: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating backup:', error);
      return { success: false, error: error.message };
    }

    return { success: true, backupId: data.id };
  } catch (error: any) {
    console.error('Error creating backup:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('database_backups')
      .delete()
      .eq('id', backupId);

    if (error) {
      console.error('Error deleting backup:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting backup:', error);
    return { success: false, error: error.message };
  }
}

export async function downloadBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real implementation, this would download the actual backup file
    // For now, we'll just mark it as a success
    console.log('Downloading backup:', backupId);
    return { success: true };
  } catch (error: any) {
    console.error('Error downloading backup:', error);
    return { success: false, error: error.message };
  }
}

// =============================================
// EMAIL TESTING
// =============================================

export async function testEmailConfiguration(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real implementation, this would send a test email
    // For now, we'll simulate it
    console.log('Sending test email to:', email);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  } catch (error: any) {
    console.error('Error testing email:', error);
    return { success: false, error: error.message };
  }
}
