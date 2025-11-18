/**
 * Comprehensive Audit Logging System
 * 
 * This module provides functions to log every action across the application
 * including website, admin panel, and database operations.
 */

import { supabase } from '../supabase/client';

export type AuditAction =
  | 'login' | 'logout' | 'failed_login' | 'signup'
  | 'create' | 'update' | 'delete' | 'view' | 'list'
  | 'status_change' | 'role_change' | 'permission_change'
  | 'export' | 'import' | 'bulk_action'
  | 'settings_change' | 'password_change' | 'email_change'
  | 'file_upload' | 'file_delete' | 'api_call'
  | 'payment' | 'refund' | 'order_placed' | 'order_cancelled'
  | 'publish' | 'unpublish' | 'archive';

export type AuditCategory =
  | 'authentication' | 'admin' | 'user' | 'product'
  | 'order' | 'blog' | 'customer' | 'system'
  | 'security' | 'settings' | 'file' | 'api'
  | 'hub' | 'promotion' | 'category' | 'newsletter';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ActorRole = 'super_admin' | 'admin' | 'moderator' | 'customer' | 'system';
export type ActorType = 'admin' | 'customer' | 'system';

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  browserVersion: string;
  screenResolution: string;
  userAgent: string;
}

export interface LocationInfo {
  ip: string;
  country: string;
  city: string;
  region: string;
  timezone: string;
  isp: string;
}

export interface AuditLogData {
  // Actor Information
  actorId?: string;
  actorName: string;
  actorEmail: string;
  actorRole: ActorRole;
  actorType: ActorType;

  // Action Details
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;
  description: string;

  // Target Information (optional)
  targetType?: string;
  targetId?: string;
  targetName?: string;

  // Change Details (optional)
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;

  // Status
  status?: 'success' | 'failed' | 'pending';
  errorMessage?: string;

  // Performance
  duration?: number; // in milliseconds

  // Additional Metadata
  metadata?: Record<string, any>;
}

/**
 * Detect device information from user agent
 */
function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      type: 'desktop',
      os: 'Unknown',
      browser: 'Unknown',
      browserVersion: '',
      screenResolution: '0x0',
      userAgent: 'Server',
    };
  }

  const ua = navigator.userAgent;

  // Detect device type
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
  const type = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'MacOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Detect browser
  let browser = 'Unknown';
  let browserVersion = '';
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || '';
  }

  return {
    type,
    os,
    browser,
    browserVersion,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    userAgent: ua,
  };
}

/**
 * Get location information (simplified version)
 * In production, this would call an IP geolocation API
 */
async function getLocationInfo(): Promise<LocationInfo> {
  // Default to Rwanda for now
  // In production, you would call an API like ipapi.co or ip-api.com
  return {
    ip: 'Unknown', // Would be fetched from server
    country: 'Rwanda',
    city: 'Kigali',
    region: 'Kigali City',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isp: 'Unknown',
  };
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  
  let sessionId = sessionStorage.getItem('audit_session_id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('audit_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Main function to log an audit event
 */
export async function logAudit(data: AuditLogData): Promise<{ success: boolean; error?: string }> {
  try {
    const device = getDeviceInfo();
    const location = await getLocationInfo();
    const sessionId = getSessionId();
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare the audit log entry
    const auditLog = {
      created_at: new Date().toISOString(),
      
      // Actor
      actor_id: data.actorId || null,
      actor_name: data.actorName,
      actor_email: data.actorEmail,
      actor_role: data.actorRole,
      actor_type: data.actorType,
      
      // Action
      action: data.action,
      category: data.category,
      severity: data.severity,
      description: data.description,
      
      // Target
      target_type: data.targetType || null,
      target_id: data.targetId || null,
      target_name: data.targetName || null,
      
      // Changes
      changes: data.changes ? JSON.stringify(data.changes) : null,
      
      // Device
      device_type: device.type,
      device_os: device.os,
      device_browser: device.browser,
      device_browser_version: device.browserVersion,
      screen_resolution: device.screenResolution,
      user_agent: device.userAgent,
      
      // Location
      ip_address: location.ip,
      country: location.country,
      city: location.city,
      region: location.region,
      timezone: location.timezone,
      isp: location.isp,
      
      // Session
      session_id: sessionId,
      request_id: requestId,
      
      // Status
      status: data.status || 'success',
      error_message: data.errorMessage || null,
      
      // Performance
      duration: data.duration || null,
      
      // Metadata
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    };

    // Insert into Supabase
    const { error } = await supabase
      .from('audit_logs')
      .insert([auditLog]);

    if (error) {
      console.error('Failed to log audit event:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error logging audit event:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Convenience functions for common audit actions
 */

export async function logLogin(actorId: string, actorName: string, actorEmail: string, actorRole: ActorRole) {
  return logAudit({
    actorId,
    actorName,
    actorEmail,
    actorRole,
    actorType: actorRole === 'customer' ? 'customer' : 'admin',
    action: 'login',
    category: 'authentication',
    severity: 'low',
    description: `${actorName} logged in successfully`,
  });
}

export async function logFailedLogin(email: string, reason: string) {
  return logAudit({
    actorName: 'Unknown',
    actorEmail: email,
    actorRole: 'customer',
    actorType: 'customer',
    action: 'failed_login',
    category: 'authentication',
    severity: 'high',
    description: `Failed login attempt for ${email}: ${reason}`,
    status: 'failed',
    errorMessage: reason,
  });
}

export async function logLogout(actorId: string, actorName: string, actorEmail: string, actorRole: ActorRole) {
  return logAudit({
    actorId,
    actorName,
    actorEmail,
    actorRole,
    actorType: actorRole === 'customer' ? 'customer' : 'admin',
    action: 'logout',
    category: 'authentication',
    severity: 'low',
    description: `${actorName} logged out`,
  });
}

export async function logCreate(
  actorId: string,
  actorName: string,
  actorEmail: string,
  actorRole: ActorRole,
  category: AuditCategory,
  targetType: string,
  targetId: string,
  targetName: string,
  metadata?: Record<string, any>
) {
  return logAudit({
    actorId,
    actorName,
    actorEmail,
    actorRole,
    actorType: actorRole === 'customer' ? 'customer' : 'admin',
    action: 'create',
    category,
    severity: 'medium',
    description: `Created ${targetType}: ${targetName}`,
    targetType,
    targetId,
    targetName,
    metadata,
  });
}

export async function logUpdate(
  actorId: string,
  actorName: string,
  actorEmail: string,
  actorRole: ActorRole,
  category: AuditCategory,
  targetType: string,
  targetId: string,
  targetName: string,
  changes: Array<{ field: string; oldValue: any; newValue: any }>,
  metadata?: Record<string, any>
) {
  return logAudit({
    actorId,
    actorName,
    actorEmail,
    actorRole,
    actorType: actorRole === 'customer' ? 'customer' : 'admin',
    action: 'update',
    category,
    severity: 'medium',
    description: `Updated ${targetType}: ${targetName}`,
    targetType,
    targetId,
    targetName,
    changes,
    metadata,
  });
}

export async function logDelete(
  actorId: string,
  actorName: string,
  actorEmail: string,
  actorRole: ActorRole,
  category: AuditCategory,
  targetType: string,
  targetId: string,
  targetName: string,
  metadata?: Record<string, any>
) {
  return logAudit({
    actorId,
    actorName,
    actorEmail,
    actorRole,
    actorType: actorRole === 'customer' ? 'customer' : 'admin',
    action: 'delete',
    category,
    severity: 'high',
    description: `Deleted ${targetType}: ${targetName}`,
    targetType,
    targetId,
    targetName,
    metadata,
  });
}

export async function logView(
  actorId: string,
  actorName: string,
  actorEmail: string,
  actorRole: ActorRole,
  category: AuditCategory,
  targetType: string,
  targetId: string,
  targetName: string
) {
  return logAudit({
    actorId,
    actorName,
    actorEmail,
    actorRole,
    actorType: actorRole === 'customer' ? 'customer' : 'admin',
    action: 'view',
    category,
    severity: 'low',
    description: `Viewed ${targetType}: ${targetName}`,
    targetType,
    targetId,
    targetName,
  });
}

export async function logExport(
  actorId: string,
  actorName: string,
  actorEmail: string,
  actorRole: ActorRole,
  category: AuditCategory,
  description: string,
  metadata?: Record<string, any>
) {
  return logAudit({
    actorId,
    actorName,
    actorEmail,
    actorRole,
    actorType: 'admin',
    action: 'export',
    category,
    severity: 'medium',
    description,
    metadata,
  });
}

export async function logSystemEvent(
  action: AuditAction,
  category: AuditCategory,
  severity: AuditSeverity,
  description: string,
  metadata?: Record<string, any>
) {
  return logAudit({
    actorName: 'System',
    actorEmail: 'system@gogreen.rw',
    actorRole: 'system',
    actorType: 'system',
    action,
    category,
    severity,
    description,
    metadata,
  });
}
