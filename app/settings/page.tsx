'use client';

import { useState, useEffect } from 'react';
import { Save, User, Lock, Mail, Phone, Camera, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { logoutAdmin, clearAdminRole, getCurrentAdmin } from '@/lib/auth';
import { getAdminPreferences, updateAdminPreferences, type AdminPreferences } from '@/lib/supabase/settings';
import { supabase } from '@/lib/supabase/client';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'account' | 'security'>('account');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminId, setAdminId] = useState<string>('');

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    avatar_url: '',
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Get current admin
      const admin = await getCurrentAdmin();
      if (!admin) {
        router.push('/login');
        return;
      }

      setAdminId(admin.id);

      // Get admin details from admins table
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('id', admin.id)
        .single();

      if (adminData) {
        setAccountSettings({
          name: adminData.name || '',
          email: adminData.email || '',
          phone: adminData.phone || '',
          role: adminData.role || '',
          avatar_url: adminData.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Security settings
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSaveAccount = async () => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('admins')
        .update({
          name: accountSettings.name,
          phone: accountSettings.phone,
        })
        .eq('id', adminId);

      if (error) throw error;

      toast.success('Account settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving account:', error);
      toast.error('Failed to save account settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logoutAdmin();
      clearAdminRole();
      toast.success('Logged out successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8">
      {/* Header with Logout */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-600 mt-2">Customize your admin experience</p>
        </div>
        <Button 
          onClick={handleLogout}
          variant="outline"
          size="lg"
          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'account', label: 'Account', icon: User },
          { id: 'security', label: 'Security', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all transform ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary to-green-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:scale-105 shadow-md'
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-500">
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-xl">
            <h3 className="text-xl font-bold mb-6 text-blue-900">Profile Picture</h3>
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl transform transition-transform group-hover:scale-110">
                  {accountSettings.name.charAt(0)}
                </div>
                <button className="absolute bottom-0 right-0 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110">
                  <Camera className="h-5 w-5 text-primary" />
                </button>
              </div>
              <p className="mt-4 text-sm text-blue-700">Click to change photo</p>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-8 bg-white shadow-xl">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Account Information
            </h3>
            <div className="space-y-5">
              <div className="transform transition-all hover:scale-105">
                <Label className="text-sm font-semibold text-gray-700">Full Name</Label>
                <Input
                  value={accountSettings.name}
                  onChange={(e) => setAccountSettings({ ...accountSettings, name: e.target.value })}
                  className="mt-2 h-12 text-lg border-2 focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="transform transition-all hover:scale-105">
                  <Label className="text-sm font-semibold text-gray-700">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      value={accountSettings.email}
                      onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
                      className="pl-12 h-12 text-lg border-2 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="transform transition-all hover:scale-105">
                  <Label className="text-sm font-semibold text-gray-700">Phone</Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      value={accountSettings.phone}
                      onChange={(e) => setAccountSettings({ ...accountSettings, phone: e.target.value })}
                      className="pl-12 h-12 text-lg border-2 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSaveAccount} 
                disabled={isSaving || isLoading}
                size="lg"
                className="w-full h-14 text-lg bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Account Changes
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card className="p-8 bg-white shadow-xl animate-in fade-in slide-in-from-bottom duration-500">
          <h3 className="text-2xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Security Settings
          </h3>
          
          <div className="space-y-8 max-w-2xl">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
              <h4 className="font-bold text-xl text-blue-900 mb-6">Change Password</h4>
              
              <div className="space-y-4">
                {[
                  { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                  { key: 'new', label: 'New Password', placeholder: 'Enter new password' },
                  { key: 'confirm', label: 'Confirm Password', placeholder: 'Confirm new password' },
                ].map((field) => (
                  <div key={field.key} className="transform transition-all hover:scale-105">
                    <Label className="text-sm font-semibold text-blue-900">{field.label}</Label>
                    <Input
                      type="password"
                      placeholder={field.placeholder}
                      value={passwords[field.key as keyof typeof passwords]}
                      onChange={(e) => setPasswords({ ...passwords, [field.key]: e.target.value })}
                      className="mt-2 h-12 border-2 border-blue-200 focus:border-blue-500 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl hover:border-purple-400 transition-all shadow-lg">
              <div>
                <div className="font-bold text-lg">Two-Factor Authentication</div>
                <div className="text-sm text-gray-600 mt-1">Add an extra layer of security</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <Button 
              onClick={() => handleSave('Security')} 
              disabled={isSaving}
              size="lg"
              className="w-full h-14 text-lg bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Update Security
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
