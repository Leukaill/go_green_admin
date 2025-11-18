import { supabase } from './client';
import { checkIsSuperAdmin } from '@/lib/auth';

export interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y';
  discount_value: number;
  code?: string;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  applicable_to?: 'all' | 'specific_products' | 'specific_categories';
  applicable_product_ids?: string[];
  applicable_category_ids?: string[];
  product_id?: string; // Single product to link banner to
  link_text?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  priority: number;
  banner_image_url?: string;
  banner_text?: string;
  show_on_homepage: boolean;
  dismissible: boolean;
  created_at: string;
  updated_at: string;
  created_by_id?: string;
  updated_by_id?: string;
  created_by_email?: string;
  updated_by_email?: string;
}

export interface PromotionUsage {
  id: string;
  promotion_id: string;
  user_id: string;
  order_id?: string;
  discount_amount: number;
  used_at: string;
}

/**
 * Get all promotions (admin - includes inactive)
 */
export async function getAllPromotions(): Promise<{ promotions: Promotion[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching promotions:', error);
      return { promotions: [], error: error.message };
    }

    return { promotions: data || [] };
  } catch (error: any) {
    console.error('Error fetching promotions:', error);
    return { promotions: [], error: error.message };
  }
}

/**
 * Get active promotions (for website)
 */
export async function getActivePromotions(): Promise<{ promotions: Promotion[]; error?: string }> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching active promotions:', error);
      return { promotions: [], error: error.message };
    }

    return { promotions: data || [] };
  } catch (error: any) {
    console.error('Error fetching active promotions:', error);
    return { promotions: [], error: error.message };
  }
}

/**
 * Get homepage promotions
 */
export async function getHomepagePromotions(): Promise<{ promotions: Promotion[]; error?: string }> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .eq('show_on_homepage', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('priority', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching homepage promotions:', error);
      return { promotions: [], error: error.message };
    }

    return { promotions: data || [] };
  } catch (error: any) {
    console.error('Error fetching homepage promotions:', error);
    return { promotions: [], error: error.message };
  }
}

/**
 * Get promotion by ID
 */
export async function getPromotionById(id: string): Promise<{ promotion: Promotion | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching promotion:', error);
      return { promotion: null, error: error.message };
    }

    return { promotion: data };
  } catch (error: any) {
    console.error('Error fetching promotion:', error);
    return { promotion: null, error: error.message };
  }
}

/**
 * Get promotion by code
 */
export async function getPromotionByCode(code: string): Promise<{ promotion: Promotion | null; error?: string }> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { promotion: null, error: 'Invalid or expired promotion code' };
      }
      console.error('Error fetching promotion by code:', error);
      return { promotion: null, error: error.message };
    }

    // Check usage limit
    if (data.usage_limit && data.usage_count >= data.usage_limit) {
      return { promotion: null, error: 'Promotion code has reached its usage limit' };
    }

    return { promotion: data };
  } catch (error: any) {
    console.error('Error fetching promotion by code:', error);
    return { promotion: null, error: error.message };
  }
}

/**
 * Create promotion
 */
export async function createPromotion(promotion: Partial<Promotion>): Promise<{ promotion: Promotion | null; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { promotion: null, error: 'User not authenticated' };
    }

    // Ensure code is uppercase if provided
    const promotionData = {
      ...promotion,
      code: promotion.code ? promotion.code.toUpperCase() : null,
      created_by_id: user.id,
      updated_by_id: user.id,
    };

    console.log('Creating promotion:', promotionData);

    const { data, error } = await supabase
      .from('promotions')
      .insert(promotionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating promotion:', {
        error,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
        errorCode: error.code
      });
      
      if (error.code === '23505') {
        return { promotion: null, error: 'Promotion code already exists' };
      }
      
      return { promotion: null, error: error.message || 'Failed to create promotion' };
    }

    console.log('Promotion created successfully:', data.id);
    return { promotion: data };
  } catch (error: any) {
    console.error('Unexpected error creating promotion:', {
      error,
      errorMessage: error?.message,
      errorStack: error?.stack
    });
    return { promotion: null, error: error?.message || 'An unexpected error occurred' };
  }
}

/**
 * Update promotion
 */
export async function updatePromotion(id: string, updates: Partial<Promotion>): Promise<{ promotion: Promotion | null; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { promotion: null, error: 'User not authenticated' };
    }

    // Ensure code is uppercase if provided
    const updateData = {
      ...updates,
      code: updates.code ? updates.code.toUpperCase() : undefined,
      updated_by_id: user.id,
      updated_at: new Date().toISOString(),
    };

    console.log('Updating promotion:', { id, updates: updateData });

    const { data, error } = await supabase
      .from('promotions')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating promotion:', {
        id,
        error,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
        errorCode: error.code
      });
      
      if (error.code === '23505') {
        return { promotion: null, error: 'Promotion code already exists' };
      }
      
      return { promotion: null, error: error.message || 'Failed to update promotion' };
    }

    if (!data || data.length === 0) {
      console.error('No rows updated - permission denied or promotion not found:', { id });
      return { promotion: null, error: 'Promotion not found or you do not have permission to update it' };
    }

    console.log('Promotion updated successfully:', data[0].id);
    return { promotion: data[0] };
  } catch (error: any) {
    console.error('Unexpected error updating promotion:', {
      id,
      error,
      errorMessage: error?.message,
      errorStack: error?.stack
    });
    return { promotion: null, error: error?.message || 'An unexpected error occurred' };
  }
}

/**
 * Delete promotion
 */
export async function deletePromotion(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting promotion:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting promotion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle promotion active status
 */
export async function togglePromotionStatus(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .update({ is_active: isActive })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error toggling promotion status:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Promotion not found or permission denied' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error toggling promotion status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if user can edit a promotion
 * Only the creator or super admin can edit
 */
export async function canEditPromotion(promotionId: string): Promise<boolean> {
  try {
    // Check if user is super admin
    const isSuperAdmin = await checkIsSuperAdmin();
    if (isSuperAdmin) {
      return true;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return false;
    }

    // Check if user is the creator
    const { data: promotion } = await supabase
      .from('promotions')
      .select('created_by_id')
      .eq('id', promotionId)
      .single();

    return promotion?.created_by_id === user.id;
  } catch (error) {
    console.error('Error checking edit permission:', error);
    return false;
  }
}

/**
 * Get promotion usage statistics
 */
export async function getPromotionUsage(promotionId: string): Promise<{ usage: PromotionUsage[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('promotion_usage')
      .select('*')
      .eq('promotion_id', promotionId)
      .order('used_at', { ascending: false });

    if (error) {
      console.error('Error fetching promotion usage:', error);
      return { usage: [], error: error.message };
    }

    return { usage: data || [] };
  } catch (error: any) {
    console.error('Error fetching promotion usage:', error);
    return { usage: [], error: error.message };
  }
}

/**
 * Record promotion usage
 */
export async function recordPromotionUsage(
  promotionId: string,
  discountAmount: number,
  orderId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Insert usage record
    const { error: insertError } = await supabase
      .from('promotion_usage')
      .insert({
        promotion_id: promotionId,
        user_id: user.id,
        order_id: orderId,
        discount_amount: discountAmount,
      });

    if (insertError) {
      console.error('Error recording promotion usage:', insertError);
      return { success: false, error: insertError.message };
    }

    // Increment usage count
    const { error: updateError } = await supabase.rpc('increment_promotion_usage', {
      promotion_id: promotionId
    });

    if (updateError) {
      console.error('Error incrementing usage count:', updateError);
      // Don't fail the whole operation if this fails
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error recording promotion usage:', error);
    return { success: false, error: error.message };
  }
}
