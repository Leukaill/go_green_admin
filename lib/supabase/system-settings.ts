import { supabase } from './client';

export interface SystemSettings {
  id: string;
  site_name: string;
  site_url: string;
  admin_email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  auto_backup_enabled: boolean;
  last_backup_at?: string;
  two_factor_enabled: boolean;
  ip_whitelist_enabled: boolean;
  session_timeout: number; // in minutes
  maintenance_mode: boolean;
  updated_at: string;
}

/**
 * Get system settings
 */
export async function getSystemSettings(): Promise<{ settings: SystemSettings | null; error?: string }> {
  try {
    console.log('🔍 Fetching system settings...');

    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error fetching settings:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // If no settings exist, return default
      if (error.code === 'PGRST116') {
        console.log('No settings found, returning defaults');
        return { settings: null };
      }
      
      // If table doesn't exist
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return { 
          settings: null, 
          error: 'System settings table not set up. Please run SETUP_SYSTEM_SETTINGS.sql in Supabase.' 
        };
      }
      
      return { settings: null, error: error.message || 'Failed to fetch settings' };
    }

    console.log('✅ Settings loaded');
    return { settings: data };

  } catch (error: any) {
    console.error('❌ Exception in getSystemSettings:', error);
    return { settings: null, error: error.message };
  }
}

/**
 * Update system settings
 */
export async function updateSystemSettings(
  settings: Partial<SystemSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔄 Updating system settings...');

    // Check if settings exist
    const { data: existing } = await supabase
      .from('system_settings')
      .select('id')
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('system_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from('system_settings')
        .insert({
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    }

    console.log('✅ Settings updated');
    return { success: true };

  } catch (error: any) {
    console.error('❌ Error updating settings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create database backup
 */
export async function createBackup(): Promise<{ success: boolean; backupId?: string; error?: string }> {
  try {
    console.log('💾 Creating database backup...');

    // Get all tables data
    const tables = ['customers', 'orders', 'order_items', 'products', 'categories', 'hub_accounts', 'hub_transactions'];
    const backupData: any = {
      timestamp: new Date().toISOString(),
      tables: {},
    };

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) {
        console.warn(`⚠️ Could not backup ${table}:`, error.message);
        backupData.tables[table] = { error: error.message, data: [] };
      } else {
        backupData.tables[table] = { data: data || [], count: data?.length || 0 };
      }
    }

    // Store backup record
    const { data: backup, error: backupError } = await supabase
      .from('backups')
      .insert({
        backup_data: backupData,
        tables_count: Object.keys(backupData.tables).length,
        total_records: Object.values(backupData.tables).reduce((sum: number, t: any) => sum + (t.count || 0), 0),
        status: 'completed',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (backupError) throw backupError;

    // Update last backup time in settings
    await supabase
      .from('system_settings')
      .update({ last_backup_at: new Date().toISOString() })
      .eq('id', (await supabase.from('system_settings').select('id').single()).data?.id);

    console.log('✅ Backup created successfully');
    return { success: true, backupId: backup.id };

  } catch (error: any) {
    console.error('❌ Error creating backup:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all backups
 */
export async function getBackups(): Promise<{ backups: any[]; error?: string }> {
  try {
    console.log('🔍 Fetching backups...');

    const { data, error } = await supabase
      .from('backups')
      .select('id, created_at, tables_count, total_records, status, size_mb')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    console.log(`✅ Found ${data?.length || 0} backups`);
    return { backups: data || [] };

  } catch (error: any) {
    console.error('❌ Error fetching backups:', error);
    return { backups: [], error: error.message };
  }
}

/**
 * Download backup as JSON
 */
export async function downloadBackup(backupId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('📥 Downloading backup:', backupId);

    const { data, error } = await supabase
      .from('backups')
      .select('backup_data, created_at')
      .eq('id', backupId)
      .single();

    if (error) throw error;

    console.log('✅ Backup downloaded');
    return { success: true, data };

  } catch (error: any) {
    console.error('❌ Error downloading backup:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete backup
 */
export async function deleteBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ Deleting backup:', backupId);

    const { error } = await supabase
      .from('backups')
      .delete()
      .eq('id', backupId);

    if (error) throw error;

    console.log('✅ Backup deleted');
    return { success: true };

  } catch (error: any) {
    console.error('❌ Error deleting backup:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Restore from backup
 */
export async function restoreBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('♻️ Restoring from backup:', backupId);

    const { data: backup, error: fetchError } = await supabase
      .from('backups')
      .select('backup_data')
      .eq('id', backupId)
      .single();

    if (fetchError) throw fetchError;

    // This is a simplified restore - in production you'd want more sophisticated logic
    toast.info('Restore functionality requires careful implementation to avoid data loss');
    
    console.log('⚠️ Restore not fully implemented');
    return { success: false, error: 'Restore requires manual intervention for safety' };

  } catch (error: any) {
    console.error('❌ Error restoring backup:', error);
    return { success: false, error: error.message };
  }
}
