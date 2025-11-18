'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  HelpCircle, 
  Users, 
  Save, 
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface WhatsAppSetting {
  id: string;
  setting_key: string;
  setting_name: string;
  whatsapp_link: string;
  description: string;
  is_active: boolean;
  display_order: number;
}

export default function WhatsAppSettingsPage() {
  const [settings, setSettings] = useState<WhatsAppSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load WhatsApp settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('whatsapp_settings')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;

      setSettings(settings.map(s => 
        s.id === id ? { ...s, [field]: value } : s
      ));

      toast.success('Setting updated successfully');
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      
      for (const setting of settings) {
        const { error } = await supabase
          .from('whatsapp_settings')
          .update({
            whatsapp_link: setting.whatsapp_link,
            description: setting.description,
            is_active: setting.is_active,
          })
          .eq('id', setting.id);

        if (error) throw error;
      }

      toast.success('All settings saved successfully! 🎉');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const getIcon = (settingKey: string) => {
    switch (settingKey) {
      case 'chat_management':
        return MessageSquare;
      case 'ask_question':
        return HelpCircle;
      case 'community':
        return Users;
      default:
        return MessageSquare;
    }
  };

  const getIconColor = (settingKey: string) => {
    switch (settingKey) {
      case 'chat_management':
        return 'bg-blue-500';
      case 'ask_question':
        return 'bg-purple-500';
      case 'community':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const testLink = (link: string) => {
    if (!link || !link.trim()) {
      toast.error('Please enter a WhatsApp link first');
      return;
    }
    window.open(link, '_blank');
    toast.success('Opening link in new tab...');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Chat Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage WhatsApp links for customer chat options
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchSettings}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-[#25D366] hover:bg-[#20BA5A]"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-blue-900 font-medium">
                How to get WhatsApp links:
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li><strong>Chat with Management:</strong> Use format: <code className="bg-blue-100 px-1 rounded">https://wa.me/250XXXXXXXXX</code></li>
                <li><strong>Ask a Question (Group):</strong> Create a WhatsApp group, tap group name → Invite via link</li>
                <li><strong>Ask Community (Channel):</strong> Create a WhatsApp channel, tap channel name → Share link</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Cards */}
      <div className="grid gap-6">
        {settings.map((setting) => {
          const Icon = getIcon(setting.setting_key);
          const iconColor = getIconColor(setting.setting_key);

          return (
            <Card key={setting.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${iconColor} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {setting.setting_name}
                        {setting.is_active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {setting.setting_key}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={setting.is_active}
                    onCheckedChange={(checked) => handleUpdate(setting.id, 'is_active', checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* WhatsApp Link */}
                <div className="space-y-2">
                  <Label htmlFor={`link-${setting.id}`}>WhatsApp Link *</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`link-${setting.id}`}
                      value={setting.whatsapp_link}
                      onChange={(e) => {
                        setSettings(settings.map(s =>
                          s.id === setting.id ? { ...s, whatsapp_link: e.target.value } : s
                        ));
                      }}
                      placeholder="https://wa.me/250XXXXXXXXX or https://chat.whatsapp.com/..."
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => testLink(setting.whatsapp_link)}
                      disabled={!setting.whatsapp_link}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Test
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {setting.setting_key === 'chat_management' && 'Format: https://wa.me/250XXXXXXXXX'}
                    {setting.setting_key === 'ask_question' && 'Format: https://chat.whatsapp.com/XXXXX'}
                    {setting.setting_key === 'community' && 'Format: https://whatsapp.com/channel/XXXXX'}
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor={`desc-${setting.id}`}>Description</Label>
                  <Textarea
                    id={`desc-${setting.id}`}
                    value={setting.description || ''}
                    onChange={(e) => {
                      setSettings(settings.map(s =>
                        s.id === setting.id ? { ...s, description: e.target.value } : s
                      ));
                    }}
                    placeholder="Brief description of this chat option..."
                    rows={2}
                  />
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 text-sm">
                  {setting.whatsapp_link && setting.whatsapp_link.trim() ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-green-700">Link configured</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-700">Link not configured</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveAll}
          disabled={isSaving}
          size="lg"
          className="bg-[#25D366] hover:bg-[#20BA5A]"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving All Changes...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
}
