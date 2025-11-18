import { supabase } from './client';

export type AnnouncementType = 'seasonal' | 'info' | 'alert';

export interface Announcement {
  id: string;
  announcement_type: AnnouncementType;
  title: string;
  message: string;
  icon?: string;
  link_url?: string;
  link_text?: string;
  start_date: string;
  end_date: string;
  show_on_homepage: boolean;
  priority: number;
  dismissible: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by_id?: string;
  updated_by_id?: string;
}

/**
 * Get all announcements (admin)
 */
export async function getAllAnnouncements(): Promise<{ announcements: Announcement[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      return { announcements: [], error: error.message };
    }

    return { announcements: data || [] };
  } catch (error: any) {
    console.error('Error fetching announcements:', error);
    return { announcements: [], error: error.message };
  }
}

/**
 * Get active announcements (website)
 */
export async function getActiveAnnouncements(): Promise<{ announcements: Announcement[]; error?: string }> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching active announcements:', error);
      return { announcements: [], error: error.message };
    }

    return { announcements: data || [] };
  } catch (error: any) {
    console.error('Error fetching active announcements:', error);
    return { announcements: [], error: error.message };
  }
}

/**
 * Create announcement
 */
export async function createAnnouncement(announcement: Partial<Announcement>): Promise<{ announcement: Announcement | null; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { announcement: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert({
        ...announcement,
        created_by_id: user.id,
        updated_by_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      return { announcement: null, error: error.message };
    }

    return { announcement: data };
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return { announcement: null, error: error.message };
  }
}

/**
 * Update announcement
 */
export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<{ announcement: Announcement | null; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { announcement: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('announcements')
      .update({
        ...updates,
        updated_by_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating announcement:', error);
      return { announcement: null, error: error.message };
    }

    return { announcement: data };
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return { announcement: null, error: error.message };
  }
}

/**
 * Delete announcement
 */
export async function deleteAnnouncement(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting announcement:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle announcement active status
 */
export async function toggleAnnouncementActive(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('announcements')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      console.error('Error toggling announcement:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error toggling announcement:', error);
    return { success: false, error: error.message };
  }
}
