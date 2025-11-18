'use client';

import { useState, useEffect } from 'react';
import { Save, Database, Mail, Key, Shield, Download, Trash2, RefreshCw, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  getSystemSettings, 
  updateSystemSettings, 
  createBackup, 
  getBackups, 
  downloadBackup, 
  deleteBackup,
  type SystemSettings 
} from '@/lib/supabase/system-settings';
import { format } from 'date-fns';

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<'database' | 'email' | 'security' | 'backups'>('database');
  const [settings, setSettings] = useState<Partial<SystemSettings>>({
    site_name: 'Go Green Rwanda',
    site_url: 'https://gogreen.rw',
    admin_email: 'admin@gogreen.rw',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    backup_frequency: 'weekly',
    auto_backup_enabled: true,
    two_factor_enabled: false,
    ip_whitelist_enabled: false,
    session_timeout: 30,
    maintenance_mode: false,
  });
  const [backups, setBackups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    if (activeTab === 'backups') {
      loadBackups();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    setIsLoading(true);
    const { settings: data, error } = await getSystemSettings();
    if (error) {
      console.error('Settings error:', error);
      setSetupError(error);
      toast.error('Failed to load settings: ' + error);
    } else if (data) {
      setSettings(data);
      setSetupError(null);
    }
    setIsLoading(false);
  };

  const loadBackups = async () => {
    setLoadingBackups(true);
    const { backups: data, error } = await getBackups();
    if (error) {
      toast.error('Failed to load backups: ' + error);
    } else {
      setBackups(data);
    }
    setLoadingBackups(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { success, error } = await updateSystemSettings(settings);
    if (success) {
      toast.success('Settings saved successfully!');
    } else {
      toast.error('Failed to save settings: ' + error);
    }
    setIsSaving(false);
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    const { success, backupId, error } = await createBackup();
    if (success) {
      toast.success('Backup created successfully!');
      loadBackups();
    } else {
      toast.error('Failed to create backup: ' + error);
    }
    setIsCreatingBackup(false);
  };

  const handleDownloadBackup = async (backupId: string, createdAt: string) => {
    const { success, data, error } = await downloadBackup(backupId);
    if (success && data) {
      // Create downloadable file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${format(new Date(createdAt), 'yyyy-MM-dd-HHmmss')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Backup downloaded!');
    } else {
      toast.error('Failed to download backup: ' + error);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) return;
    
    const { success, error } = await deleteBackup(backupId);
    if (success) {
      toast.success('Backup deleted');
      loadBackups();
    } else {
      toast.error('Failed to delete backup: ' + error);
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-8 bg-gradient-to-br from-emerald-50 via-white to-green-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Database className="h-8 w-8 text-emerald-800" />
          <h1 className="text-3xl font-bold text-emerald-900">System Settings</h1>
        </div>
        <p className="text-gray-600">Configure advanced system settings and integrations</p>
      </div>

      {/* Setup Error Alert */}
      {setupError && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">Database Setup Required</h3>
              <p className="text-red-800 mb-3">{setupError}</p>
              <div className="bg-red-100 p-3 rounded border border-red-300">
                <p className="font-semibold text-red-900 mb-2">Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-red-800">
                  <li>Open Supabase Dashboard → SQL Editor</li>
                  <li>Copy contents of <code className="bg-red-200 px-1 rounded">supabase/SETUP_SYSTEM_SETTINGS.sql</code></li>
                  <li>Paste and run the SQL</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-emerald-200 overflow-x-auto">
        {[
          { id: 'database', label: 'Database & Backups', icon: Database },
          { id: 'email', label: 'Email', icon: Mail },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'backups', label: 'Backups', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-emerald-800 border-b-2 border-emerald-800'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Database Tab */}
      {activeTab === 'database' && (
        <Card className="p-8 bg-white border-emerald-200">
          <h2 className="text-2xl font-bold text-emerald-900 mb-6">Database & Backup Configuration</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-800">
                  <strong>Note:</strong> Database is managed by Supabase. Configure backup settings below.
                </p>
              </div>

              <div>
                <Label>Backup Frequency</Label>
                <select 
                  className="w-full h-10 px-3 border border-gray-200 rounded-md mt-2"
                  value={settings.backup_frequency}
                  onChange={(e) => updateSetting('backup_frequency', e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 border border-emerald-200 rounded-lg">
                <div>
                  <div className="font-semibold">Auto Backup</div>
                  <div className="text-sm text-gray-600">Automatically create backups</div>
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-emerald-800"
                  checked={settings.auto_backup_enabled}
                  onChange={(e) => updateSetting('auto_backup_enabled', e.target.checked)}
                />
              </div>

              {settings.last_backup_at && (
                <div className="text-sm text-gray-600">
                  Last backup: {format(new Date(settings.last_backup_at), 'MMM d, yyyy h:mm a')}
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-emerald-800 hover:bg-emerald-900"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Settings
                </Button>
                <Button 
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup}
                  variant="outline"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  {isCreatingBackup ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
                  Create Backup Now
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <Card className="p-8 bg-white border-emerald-200">
          <h2 className="text-2xl font-bold text-emerald-900 mb-6">Email Configuration</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl">
              <div>
                <Label>SMTP Host</Label>
                <Input 
                  value={settings.smtp_host || ''}
                  onChange={(e) => updateSetting('smtp_host', e.target.value)}
                  className="mt-2" 
                />
              </div>
              <div>
                <Label>SMTP Port</Label>
                <Input 
                  type="number"
                  value={settings.smtp_port || 587}
                  onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                  className="mt-2" 
                />
              </div>
              <div>
                <Label>SMTP User (Email)</Label>
                <Input 
                  type="email"
                  value={settings.smtp_user || ''}
                  onChange={(e) => updateSetting('smtp_user', e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="mt-2" 
                />
              </div>
              <div>
                <Label>SMTP Password</Label>
                <Input 
                  type="password" 
                  value={settings.smtp_password || ''}
                  onChange={(e) => updateSetting('smtp_password', e.target.value)}
                  placeholder="••••••••" 
                  className="mt-2" 
                />
              </div>
              <div>
                <Label>Admin Email</Label>
                <Input 
                  type="email"
                  value={settings.admin_email || ''}
                  onChange={(e) => updateSetting('admin_email', e.target.value)}
                  className="mt-2" 
                />
              </div>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-emerald-800 hover:bg-emerald-900"
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Email Settings
              </Button>
            </div>
          )}
        </Card>
      )}


      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card className="p-8 bg-white border-emerald-200">
          <h2 className="text-2xl font-bold text-emerald-900 mb-6">Security Settings</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between p-4 border border-emerald-200 rounded-lg">
                <div>
                  <div className="font-semibold">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-600">Require 2FA for all admins</div>
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-emerald-800"
                  checked={settings.two_factor_enabled}
                  onChange={(e) => updateSetting('two_factor_enabled', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-emerald-200 rounded-lg">
                <div>
                  <div className="font-semibold">IP Whitelist</div>
                  <div className="text-sm text-gray-600">Restrict access to specific IPs</div>
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-emerald-800"
                  checked={settings.ip_whitelist_enabled}
                  onChange={(e) => updateSetting('ip_whitelist_enabled', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-emerald-200 rounded-lg">
                <div>
                  <div className="font-semibold">Session Timeout</div>
                  <div className="text-sm text-gray-600">Auto logout after inactivity</div>
                </div>
                <select 
                  className="h-10 px-3 border border-gray-200 rounded-md"
                  value={settings.session_timeout}
                  onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={0}>Never</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-4 border border-emerald-200 rounded-lg">
                <div>
                  <div className="font-semibold">Maintenance Mode</div>
                  <div className="text-sm text-gray-600">Put site in maintenance mode</div>
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-emerald-800"
                  checked={settings.maintenance_mode}
                  onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                />
              </div>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-emerald-800 hover:bg-emerald-900"
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Security Settings
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <Card className="p-8 bg-white border-emerald-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-emerald-900">Database Backups</h2>
            <Button 
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="bg-emerald-800 hover:bg-emerald-900"
            >
              {isCreatingBackup ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
              Create New Backup
            </Button>
          </div>

          {loadingBackups ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Database className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold mb-2">No backups yet</p>
              <p className="text-sm">Create your first backup to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div 
                  key={backup.id}
                  className="flex items-center justify-between p-4 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      backup.status === 'completed' ? 'bg-green-100' : 
                      backup.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {backup.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : backup.status === 'failed' ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {format(new Date(backup.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {backup.tables_count} tables • {backup.total_records.toLocaleString()} records
                        {backup.size_mb && ` • ${backup.size_mb} MB`}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadBackup(backup.id, backup.created_at)}
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteBackup(backup.id)}
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2 text-blue-800">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Backup Information</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Backups include all tables: customers, orders, products, hub accounts, etc.</li>
                  <li>Download backups as JSON files for safekeeping</li>
                  <li>Backups are automatically cleaned up (keeping last 30)</li>
                  <li>For restore operations, contact system administrator</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
