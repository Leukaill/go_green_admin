import { supabase } from './client';

export type UserStatus = 'active' | 'banned' | 'suspended';
export type UserRole = 'customer' | 'vip' | 'admin';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: UserRole;
  status: UserStatus;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  joinedDate: string;
  avatar?: string;
  notes?: string;
  bannedReason?: string;
  bannedUntil?: string;
}

/**
 * Get all customers with their order statistics
 */
export async function getCustomers(): Promise<{ customers: Customer[]; error?: string }> {
  try {
    console.log('🔍 Fetching customers from database...');

    // Get customer profiles
    const { data: customerProfiles, error: profileError } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (profileError) {
      console.error('❌ Error fetching customer profiles:', {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code
      });
      return { customers: [], error: profileError.message };
    }

    console.log(`✅ Found ${customerProfiles?.length || 0} customer profiles`);

    // Get order statistics for all users
    const { data: orderStats, error: orderError } = await supabase
      .from('orders')
      .select('user_id, total, created_at, order_status');

    if (orderError) {
      console.error('❌ Error fetching order stats:', orderError);
    }

    console.log(`✅ Found ${orderStats?.length || 0} orders`);

    // Combine data
    const customers: Customer[] = (customerProfiles || []).map(profile => {
      const userOrders = orderStats?.filter(o => o.user_id === profile.id) || [];
      
      // Calculate statistics
      const totalOrders = userOrders.length;
      const totalSpent = userOrders
        .filter(o => o.order_status === 'delivered')
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      
      // Get last order date
      const lastOrderDate = userOrders.length > 0
        ? new Date(Math.max(...userOrders.map(o => new Date(o.created_at).getTime())))
        : null;

      // Determine role from profile or default to customer
      const role: UserRole = (profile.role as UserRole) || 'customer';

      // Map database status to our status type
      let status: UserStatus = 'active';
      if (profile.status === 'blocked') {
        status = 'banned';
      } else if (profile.status === 'inactive') {
        status = 'suspended';
      }

      return {
        id: profile.id,
        name: profile.name || 'Unknown',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        role,
        status,
        totalOrders,
        totalSpent,
        lastOrder: lastOrderDate ? lastOrderDate.toISOString().split('T')[0] : 'Never',
        joinedDate: new Date(profile.created_at).toISOString().split('T')[0],
        avatar: profile.avatar_url,
        notes: profile.notes,
      };
    });

    console.log(`✅ Processed ${customers.length} customers`);
    return { customers };

  } catch (error: any) {
    console.error('❌ Exception in getCustomers:', {
      message: error.message,
      stack: error.stack,
      error: error
    });
    return { customers: [], error: error.message || 'Failed to fetch customers' };
  }
}

/**
 * Update customer status
 */
export async function updateCustomerStatus(
  userId: string,
  status: UserStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🔄 Updating customer ${userId} status to ${status}`);

    // Map our status to database status
    let dbStatus = 'active';
    if (status === 'banned') {
      dbStatus = 'blocked';
    } else if (status === 'suspended') {
      dbStatus = 'inactive';
    }

    // Update customer profile
    const { error } = await supabase
      .from('customers')
      .update({
        status: dbStatus,
        notes: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error updating customer status:', error);
      throw error;
    }

    console.log('✅ Customer status updated');
    return { success: true };

  } catch (error: any) {
    console.error('❌ Error updating customer status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update customer notes
 */
export async function updateCustomerNotes(
  userId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🔄 Updating customer ${userId} notes`);

    const { error } = await supabase
      .from('customers')
      .update({
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    console.log('✅ Customer notes updated');
    return { success: true };

  } catch (error: any) {
    console.error('❌ Error updating customer notes:', error);
    return { success: false, error: error.message };
  }
}
