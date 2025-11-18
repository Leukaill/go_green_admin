import { supabase } from './client';

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  admin_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

/**
 * Get all audit logs (super admin only)
 */
export async function getAllAuditLogs(): Promise<{ logs: AuditLog[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Error fetching audit logs:', error);
      return { logs: [], error: error.message };
    }

    return { logs: data || [] };
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return { logs: [], error: error.message };
  }
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId?: string
): Promise<{ logs: AuditLog[]; error?: string }> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_type', resourceType)
      .order('created_at', { ascending: false });

    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching resource audit logs:', error);
      return { logs: [], error: error.message };
    }

    return { logs: data || [] };
  } catch (error: any) {
    console.error('Error fetching resource audit logs:', error);
    return { logs: [], error: error.message };
  }
}

/**
 * Get audit logs for blog posts
 */
export async function getBlogAuditLogs(): Promise<{ logs: AuditLog[]; error?: string }> {
  return getResourceAuditLogs('blog_post');
}

/**
 * Get audit logs for a specific blog post
 */
export async function getBlogPostAuditLogs(postId: string): Promise<{ logs: AuditLog[]; error?: string }> {
  return getResourceAuditLogs('blog_post', postId);
}

/**
 * Get audit logs by admin
 */
export async function getAdminAuditLogs(adminId: string): Promise<{ logs: AuditLog[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching admin audit logs:', error);
      return { logs: [], error: error.message };
    }

    return { logs: data || [] };
  } catch (error: any) {
    console.error('Error fetching admin audit logs:', error);
    return { logs: [], error: error.message };
  }
}

/**
 * Get audit log statistics
 */
export async function getAuditLogStats(): Promise<{
  total: number;
  byAction: Record<string, number>;
  byAdmin: Record<string, number>;
  error?: string;
}> {
  try {
    const { logs } = await getAllAuditLogs();

    const byAction: Record<string, number> = {};
    const byAdmin: Record<string, number> = {};

    logs.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byAdmin[log.admin_email] = (byAdmin[log.admin_email] || 0) + 1;
    });

    return {
      total: logs.length,
      byAction,
      byAdmin,
    };
  } catch (error: any) {
    console.error('Error fetching audit log stats:', error);
    return {
      total: 0,
      byAction: {},
      byAdmin: {},
      error: error.message,
    };
  }
}
