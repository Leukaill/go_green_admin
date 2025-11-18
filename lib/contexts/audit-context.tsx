'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { toast } from 'sonner';

export type AuditAction = 
  | 'login' | 'logout' | 'failed_login'
  | 'create' | 'update' | 'delete' | 'view'
  | 'status_change' | 'role_change' | 'permission_change'
  | 'export' | 'import' | 'bulk_action'
  | 'settings_change' | 'password_change' | 'email_change'
  | 'file_upload' | 'file_delete' | 'api_call';

export type AuditCategory = 
  | 'authentication' | 'admin' | 'user' | 'product' 
  | 'order' | 'blog' | 'customer' | 'system' 
  | 'security' | 'settings' | 'file' | 'api';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

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

export interface AuditLog {
  id: string;
  timestamp: string;
  
  // Actor Information
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: 'super_admin' | 'admin' | 'moderator' | 'user' | 'customer' | 'system';
  actorType: 'admin' | 'customer' | 'system';
  
  // Action Details
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;
  description: string;
  
  // Target Information
  targetType?: string;
  targetId?: string;
  targetName?: string;
  
  // Change Details
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  
  // Device & Location
  device: DeviceInfo;
  location: LocationInfo;
  
  // Additional Context
  metadata?: Record<string, any>;
  sessionId: string;
  requestId?: string;
  
  // Status
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  
  // Duration (for performance tracking)
  duration?: number;
}

interface AuditContextType {
  logs: AuditLog[];
  loading: boolean;
  filters: AuditFilters;
  setFilters: (filters: AuditFilters) => void;
  refreshLogs: () => void;
  exportLogs: (format: 'csv' | 'json') => void;
  getLogsByUser: (userId: string) => AuditLog[];
  getLogsByAction: (action: AuditAction) => AuditLog[];
  getLogsByDateRange: (start: Date, end: Date) => AuditLog[];
  getSecurityAlerts: () => AuditLog[];
}

export interface AuditFilters {
  search?: string;
  category?: AuditCategory;
  action?: AuditAction;
  severity?: AuditSeverity;
  actorType?: 'admin' | 'customer' | 'system';
  dateFrom?: Date;
  dateTo?: Date;
  status?: 'success' | 'failed' | 'pending';
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({});

  useEffect(() => {
    fetchLogs();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('audit-logs-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'audit_logs' 
      }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching audit logs:', error);
        toast.error('Failed to load audit logs');
        return;
      }

      // Transform database records to AuditLog format
      const transformedLogs: AuditLog[] = (data || []).map((record: any) => ({
        id: record.id,
        timestamp: record.created_at,
        
        actorId: record.actor_id || 'unknown',
        actorName: record.actor_name,
        actorEmail: record.actor_email,
        actorRole: record.actor_role,
        actorType: record.actor_type,
        
        action: record.action,
        category: record.category,
        severity: record.severity,
        description: record.description,
        
        targetType: record.target_type,
        targetId: record.target_id,
        targetName: record.target_name,
        
        changes: record.changes ? (typeof record.changes === 'string' ? JSON.parse(record.changes) : record.changes) : undefined,
        
        device: {
          type: record.device_type || 'desktop',
          os: record.device_os || 'Unknown',
          browser: record.device_browser || 'Unknown',
          browserVersion: record.device_browser_version || '',
          screenResolution: record.screen_resolution || '0x0',
          userAgent: record.user_agent || '',
        },
        
        location: {
          ip: record.ip_address || 'Unknown',
          country: record.country || 'Unknown',
          city: record.city || 'Unknown',
          region: record.region || 'Unknown',
          timezone: record.timezone || 'Unknown',
          isp: record.isp || 'Unknown',
        },
        
        sessionId: record.session_id || 'unknown',
        requestId: record.request_id,
        
        status: record.status,
        errorMessage: record.error_message,
        
        duration: record.duration,
        
        metadata: record.metadata ? (typeof record.metadata === 'string' ? JSON.parse(record.metadata) : record.metadata) : undefined,
      }));

      setLogs(transformedLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const refreshLogs = () => {
    fetchLogs();
  };

  const exportLogs = (format: 'csv' | 'json') => {
    try {
      const dataStr = format === 'json' 
        ? JSON.stringify(logs, null, 2)
        : convertToCSV(logs);
      
      const dataBlob = new Blob([dataStr], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success(`Audit logs exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export logs');
    }
  };

  const convertToCSV = (data: AuditLog[]): string => {
    const headers = [
      'ID', 'Timestamp', 'Actor', 'Email', 'Role', 'Action', 
      'Category', 'Severity', 'Description', 'Target', 
      'Device', 'Location', 'IP', 'Status'
    ];
    
    const rows = data.map(log => [
      log.id,
      new Date(log.timestamp).toLocaleString(),
      log.actorName,
      log.actorEmail,
      log.actorRole,
      log.action,
      log.category,
      log.severity,
      log.description,
      log.targetName || 'N/A',
      `${log.device.type} - ${log.device.os} - ${log.device.browser}`,
      `${log.location.city}, ${log.location.country}`,
      log.location.ip,
      log.status,
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const getLogsByUser = (userId: string) => {
    return logs.filter(log => log.actorId === userId);
  };

  const getLogsByAction = (action: AuditAction) => {
    return logs.filter(log => log.action === action);
  };

  const getLogsByDateRange = (start: Date, end: Date) => {
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  };

  const getSecurityAlerts = () => {
    return logs.filter(log => 
      log.severity === 'critical' || 
      log.severity === 'high' ||
      log.action === 'failed_login' ||
      log.status === 'failed'
    );
  };

  return (
    <AuditContext.Provider
      value={{
        logs,
        loading,
        filters,
        setFilters,
        refreshLogs,
        exportLogs,
        getLogsByUser,
        getLogsByAction,
        getLogsByDateRange,
        getSecurityAlerts,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
}
