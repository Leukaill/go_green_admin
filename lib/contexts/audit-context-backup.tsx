'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  actorRole: 'super_admin' | 'admin' | 'moderator' | 'user';
  actorType: 'admin' | 'customer' | 'system';
  
  // Action Details
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;
  description: string;
  
  // Target Information
  targetType?: string; // e.g., 'product', 'order', 'user'
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
  duration?: number; // in milliseconds
}

interface AuditContextType {
  logs: AuditLog[];
  loading: boolean;
  filters: AuditFilters;
  setFilters: (filters: AuditFilters) => void;
  logAction: (log: Omit<AuditLog, 'id' | 'timestamp' | 'device' | 'location' | 'sessionId'>) => void;
  clearLogs: () => void;
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

// Helper function to detect device info
const getDeviceInfo = (): DeviceInfo => {
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
};

// Helper function to get location info (mock for now, would use IP geolocation API)
const getLocationInfo = (): LocationInfo => {
  return {
    ip: '192.168.1.1', // Would be actual IP from server
    country: 'Rwanda',
    city: 'Kigali',
    region: 'Kigali City',
    timezone: 'Africa/Kigali',
    isp: 'MTN Rwanda',
  };
};

// Generate mock audit logs
const generateMockLogs = (): AuditLog[] => {
  const actions: AuditAction[] = ['login', 'create', 'update', 'delete', 'view', 'status_change'];
  const categories: AuditCategory[] = ['admin', 'product', 'order', 'blog', 'customer', 'system'];
  const severities: AuditSeverity[] = ['low', 'medium', 'high', 'critical'];
  
  const logs: AuditLog[] = [];
  
  for (let i = 0; i < 100; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    logs.push({
      id: `log-${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      
      actorId: `admin-${Math.floor(Math.random() * 3) + 1}`,
      actorName: ['Super Admin', 'John Doe', 'Jane Smith'][Math.floor(Math.random() * 3)],
      actorEmail: ['superadmin@gogreen.rw', 'john@gogreen.rw', 'jane@gogreen.rw'][Math.floor(Math.random() * 3)],
      actorRole: ['super_admin', 'admin', 'moderator'][Math.floor(Math.random() * 3)] as any,
      actorType: 'admin',
      
      action,
      category,
      severity,
      description: `${action.replace('_', ' ')} performed on ${category}`,
      
      targetType: category,
      targetId: `${category}-${Math.floor(Math.random() * 1000)}`,
      targetName: `${category.charAt(0).toUpperCase() + category.slice(1)} Item`,
      
      changes: action === 'update' ? [
        {
          field: 'status',
          oldValue: 'pending',
          newValue: 'active',
        },
        {
          field: 'price',
          oldValue: 10000,
          newValue: 12000,
        },
      ] : undefined,
      
      device: {
        type: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)] as any,
        os: ['Windows', 'MacOS', 'Android', 'iOS'][Math.floor(Math.random() * 4)],
        browser: ['Chrome', 'Safari', 'Firefox', 'Edge'][Math.floor(Math.random() * 4)],
        browserVersion: '120.0.0',
        screenResolution: '1920x1080',
        userAgent: navigator.userAgent,
      },
      
      location: {
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        country: 'Rwanda',
        city: ['Kigali', 'Musanze', 'Rubavu', 'Huye'][Math.floor(Math.random() * 4)],
        region: 'Kigali City',
        timezone: 'Africa/Kigali',
        isp: ['MTN Rwanda', 'Airtel Rwanda', 'Liquid Telecom'][Math.floor(Math.random() * 3)],
      },
      
      sessionId: `session-${Math.floor(Math.random() * 100)}`,
      requestId: `req-${Math.floor(Math.random() * 10000)}`,
      
      status: Math.random() > 0.1 ? 'success' : 'failed',
      errorMessage: Math.random() > 0.9 ? 'Permission denied' : undefined,
      
      duration: Math.floor(Math.random() * 1000),
      
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      },
    });
  }
  
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({});

  useEffect(() => {
    // Load logs from localStorage or generate mock data
    const storedLogs = localStorage.getItem('audit-logs');
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    } else {
      const mockLogs = generateMockLogs();
      setLogs(mockLogs);
      localStorage.setItem('audit-logs', JSON.stringify(mockLogs));
    }
    setLoading(false);
  }, []);

  const logAction = (logData: Omit<AuditLog, 'id' | 'timestamp' | 'device' | 'location' | 'sessionId'>) => {
    const newLog: AuditLog = {
      ...logData,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      device: getDeviceInfo(),
      location: getLocationInfo(),
      sessionId: sessionStorage.getItem('sessionId') || `session-${Date.now()}`,
    };
    
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('audit-logs', JSON.stringify(updatedLogs));
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('audit-logs');
  };

  const exportLogs = (format: 'csv' | 'json') => {
    const dataStr = format === 'json' 
      ? JSON.stringify(logs, null, 2)
      : convertToCSV(logs);
    
    const dataBlob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString()}.${format}`;
    link.click();
  };

  const convertToCSV = (data: AuditLog[]): string => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Action', 'Category', 'Severity', 'Description', 'Device', 'Location', 'Status'];
    const rows = data.map(log => [
      log.id,
      log.timestamp,
      `${log.actorName} (${log.actorEmail})`,
      log.action,
      log.category,
      log.severity,
      log.description,
      `${log.device.type} - ${log.device.os} - ${log.device.browser}`,
      `${log.location.city}, ${log.location.country} (${log.location.ip})`,
      log.status,
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
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
        logAction,
        clearLogs,
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
