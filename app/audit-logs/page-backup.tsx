'use client';

import { useState } from 'react';
import { 
  Activity, Search, Filter, Download, Eye, AlertTriangle,
  Monitor, Smartphone, Tablet, MapPin, Clock, User,
  Shield, FileText, Settings, Database, RefreshCw,
  ChevronDown, ChevronUp, X, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAudit, type AuditLog, type AuditFilters } from '@/lib/contexts/audit-context';

const oldMockLogs = [
  {
    id: '1',
    user: 'Super Admin',
    action: 'Created admin user',
    resource: 'Admin Management',
    timestamp: '2025-11-07 04:30:15',
    ip: '192.168.1.100',
    status: 'success',
  },
  {
    id: '2',
    user: 'Admin User',
    action: 'Updated product',
    resource: 'Products',
    timestamp: '2025-11-07 04:15:22',
    ip: '192.168.1.101',
    status: 'success',
  },
  {
    id: '3',
    user: 'Admin User',
    action: 'Deleted order',
    resource: 'Orders',
    timestamp: '2025-11-07 03:45:10',
    ip: '192.168.1.101',
    status: 'success',
  },
  {
    id: '4',
    user: 'John Doe',
    action: 'Failed login attempt',
    resource: 'Authentication',
    timestamp: '2025-11-07 03:30:05',
    ip: '192.168.1.150',
    status: 'failed',
  },
  {
    id: '5',
    user: 'Super Admin',
    action: 'Changed system settings',
    resource: 'System Settings',
    timestamp: '2025-11-07 02:20:33',
    ip: '192.168.1.100',
    status: 'success',
  },
];

export default function AuditLogsPage() {
  const { logs, loading, exportLogs } = useAudit();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(log =>
    log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 bg-gradient-to-br from-emerald-50 via-white to-green-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-8 w-8 text-emerald-800" />
            <h1 className="text-3xl font-bold text-emerald-900">Audit Logs</h1>
          </div>
          <p className="text-gray-600">Track all system activities and changes</p>
        </div>
        <Button className="bg-emerald-800 hover:bg-emerald-900" onClick={() => exportLogs('json')}>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6 bg-white border-emerald-200">
          <div className="text-3xl font-bold text-emerald-800">{logs.length}</div>
          <div className="text-sm text-gray-600">Total Events</div>
        </Card>
        <Card className="p-6 bg-white border-emerald-200">
          <div className="text-3xl font-bold text-green-600">
            {logs.filter(l => l.status === 'success').length}
          </div>
          <div className="text-sm text-gray-600">Successful</div>
        </Card>
        <Card className="p-6 bg-white border-emerald-200">
          <div className="text-3xl font-bold text-red-600">
            {logs.filter(l => l.status === 'failed').length}
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </Card>
        <Card className="p-6 bg-white border-emerald-200">
          <div className="text-3xl font-bold text-emerald-900">
            {new Set(logs.map(l => l.actorId)).size}
          </div>
          <div className="text-sm text-gray-600">Unique Users</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6 bg-white border-emerald-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="bg-white border-emerald-200">
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
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-emerald-50/50 transition-colors">
                  <td className="p-4">
                    <div className="text-sm font-mono text-gray-900">{new Date(log.timestamp).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{log.actorName}</div>
                    <div className="text-xs text-gray-600">{log.actorEmail}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{log.action}</div>
                    <div className="text-xs text-gray-600">{log.description}</div>
                  </td>
                  <td className="p-4">
                    <Badge className="bg-emerald-100 text-emerald-700">
                      {log.category}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">{log.device.type}</div>
                    <div className="text-xs text-gray-600">{log.device.os} - {log.device.browser}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">{log.location.city}, {log.location.country}</div>
                    <div className="text-xs text-gray-600 font-mono">{log.location.ip}</div>
                  </td>
                  <td className="p-4">
                    <Badge className={
                      log.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      log.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      log.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {log.severity}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge className={
                      log.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }>
                      {log.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
