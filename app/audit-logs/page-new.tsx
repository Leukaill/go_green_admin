'use client';

import { useState, useMemo } from 'react';
import { 
  Activity, Search, Filter, Download, Eye, AlertTriangle,
  Monitor, Smartphone, Tablet, MapPin, Clock, User,
  Shield, FileText, Settings, Database, RefreshCw,
  ChevronDown, ChevronUp, X, Calendar, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAudit, type AuditLog, type AuditFilters, type AuditCategory, type AuditSeverity } from '@/lib/contexts/audit-context-new';

export default function AuditLogsPage() {
  const { logs, loading, exportLogs, refreshLogs } = useAudit();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AuditCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<AuditSeverity | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'success' | 'failed' | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          log.actorName.toLowerCase().includes(query) ||
          log.actorEmail.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.description.toLowerCase().includes(query) ||
          log.category.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && log.category !== selectedCategory) {
        return false;
      }

      // Severity filter
      if (selectedSeverity !== 'all' && log.severity !== selectedSeverity) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && log.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [logs, searchQuery, selectedCategory, selectedSeverity, selectedStatus]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: filteredLogs.length,
      successful: filteredLogs.filter(l => l.status === 'success').length,
      failed: filteredLogs.filter(l => l.status === 'failed').length,
      uniqueUsers: new Set(filteredLogs.map(l => l.actorId)).size,
      critical: filteredLogs.filter(l => l.severity === 'critical').length,
      high: filteredLogs.filter(l => l.severity === 'high').length,
    };
  }, [filteredLogs]);

  const categories: (AuditCategory | 'all')[] = [
    'all', 'authentication', 'admin', 'user', 'product', 
    'order', 'blog', 'customer', 'system', 'security', 
    'settings', 'file', 'api'
  ];

  const severities: (AuditSeverity | 'all')[] = ['all', 'low', 'medium', 'high', 'critical'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <Shield className="h-4 w-4" />;
      case 'product': return <Package className="h-4 w-4" />;
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'blog': return <FileText className="h-4 w-4" />;
      case 'system': return <Database className="h-4 w-4" />;
      case 'settings': return <Settings className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'success'
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="p-8 bg-gradient-to-br from-emerald-50 via-white to-green-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-8 w-8 text-emerald-800" />
            <h1 className="text-3xl font-bold text-emerald-900">Audit Logs</h1>
            <Badge className="bg-emerald-100 text-emerald-700">Real-Time</Badge>
          </div>
          <p className="text-gray-600">Comprehensive tracking of all system activities</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshLogs}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="bg-emerald-800 hover:bg-emerald-900" 
            onClick={() => exportLogs('json')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <Card className="p-6 bg-white border-emerald-200 hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-emerald-800">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Events</div>
        </Card>
        <Card className="p-6 bg-white border-emerald-200 hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-green-600">{stats.successful}</div>
          <div className="text-sm text-gray-600">Successful</div>
        </Card>
        <Card className="p-6 bg-white border-emerald-200 hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </Card>
        <Card className="p-6 bg-white border-emerald-200 hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-emerald-900">{stats.uniqueUsers}</div>
          <div className="text-sm text-gray-600">Unique Users</div>
        </Card>
        <Card className="p-6 bg-white border-emerald-200 hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-sm text-gray-600">Critical</div>
        </Card>
        <Card className="p-6 bg-white border-emerald-200 hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-orange-600">{stats.high}</div>
          <div className="text-sm text-gray-600">High Severity</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6 bg-white border-emerald-200">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by actor, action, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Severity</label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {severities.map(sev => (
                    <option key={sev} value={sev}>
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="bg-white border-emerald-200">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
            <p className="text-gray-600">Loading audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-50 border-b border-emerald-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-emerald-900">Timestamp</th>
                  <th className="text-left p-4 text-sm font-semibold text-emerald-900">Actor</th>
                  <th className="text-left p-4 text-sm font-semibold text-emerald-900">Action</th>
                  <th className="text-left p-4 text-sm font-semibold text-emerald-900">Category</th>
                  <th className="text-left p-4 text-sm font-semibold text-emerald-900">Device</th>
                  <th className="text-left p-4 text-sm font-semibold text-emerald-900">Location</th>
                  <th className="text-left p-4 text-sm font-semibold text-emerald-900">Severity</th>
                  <th className="text-left p-4 text-sm font-semibold text-emerald-900">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-emerald-900">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="border-b border-gray-100 hover:bg-emerald-50/50 transition-colors">
                      <td className="p-4">
                        <div className="text-sm font-mono text-gray-900">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{log.actorName}</div>
                        <div className="text-xs text-gray-600">{log.actorEmail}</div>
                        <Badge className="mt-1 text-xs">{log.actorRole}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{log.action}</div>
                        <div className="text-xs text-gray-600 max-w-xs truncate">{log.description}</div>
                      </td>
                      <td className="p-4">
                        <Badge className="bg-emerald-100 text-emerald-700 flex items-center gap-1 w-fit">
                          {getCategoryIcon(log.category)}
                          {log.category}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm flex items-center gap-1">
                          {log.device.type === 'mobile' && <Smartphone className="h-3 w-3" />}
                          {log.device.type === 'tablet' && <Tablet className="h-3 w-3" />}
                          {log.device.type === 'desktop' && <Monitor className="h-3 w-3" />}
                          {log.device.type}
                        </div>
                        <div className="text-xs text-gray-600">{log.device.os} - {log.device.browser}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {log.location.city}, {log.location.country}
                        </div>
                        <div className="text-xs text-gray-600 font-mono">{log.location.ip}</div>
                      </td>
                      <td className="p-4">
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                    {expandedLog === log.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={9} className="p-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Session Information</h4>
                              <div className="text-sm space-y-1">
                                <div><span className="font-medium">Session ID:</span> {log.sessionId}</div>
                                <div><span className="font-medium">Request ID:</span> {log.requestId || 'N/A'}</div>
                                <div><span className="font-medium">Duration:</span> {log.duration ? `${log.duration}ms` : 'N/A'}</div>
                              </div>
                            </div>
                            {log.targetType && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Target Information</h4>
                                <div className="text-sm space-y-1">
                                  <div><span className="font-medium">Type:</span> {log.targetType}</div>
                                  <div><span className="font-medium">ID:</span> {log.targetId}</div>
                                  <div><span className="font-medium">Name:</span> {log.targetName}</div>
                                </div>
                              </div>
                            )}
                            {log.changes && log.changes.length > 0 && (
                              <div className="col-span-2">
                                <h4 className="font-semibold text-sm mb-2">Changes</h4>
                                <div className="bg-white p-3 rounded border text-xs font-mono">
                                  {log.changes.map((change, idx) => (
                                    <div key={idx} className="mb-2">
                                      <span className="font-semibold">{change.field}:</span>{' '}
                                      <span className="text-red-600">{JSON.stringify(change.oldValue)}</span> →{' '}
                                      <span className="text-green-600">{JSON.stringify(change.newValue)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {log.errorMessage && (
                              <div className="col-span-2">
                                <h4 className="font-semibold text-sm mb-2 text-red-600">Error Message</h4>
                                <div className="bg-red-50 p-3 rounded border border-red-200 text-sm text-red-700">
                                  {log.errorMessage}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// Missing imports
import { Package, ShoppingCart } from 'lucide-react';
import React from 'react';
