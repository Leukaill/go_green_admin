'use client';

import { useState } from 'react';
import { X, Save, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  addAnnouncement,
  updateAnnouncement,
  type Announcement,
  type AnnouncementType,
} from '@/lib/data/announcements';

interface PromotionEditorProps {
  announcement: Announcement | null;
  onClose: () => void;
}

// Info Tooltip Component
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-xs hover:bg-blue-600 transition-colors"
      >
        !
      </button>
      {show && (
        <div className="absolute z-50 left-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
          {text}
          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}

export function PromotionEditor({ announcement, onClose }: PromotionEditorProps) {
  const isEditing = !!announcement;
  const [activeTab, setActiveTab] = useState<'english' | 'kinyarwanda' | 'french'>('english');
  
  const [formData, setFormData] = useState({
    type: announcement?.type || 'promotion' as AnnouncementType,
    title: announcement?.title || '',
    titleRw: announcement?.titleRw || '',
    titleFr: announcement?.titleFr || '',
    message: announcement?.message || '',
    messageRw: announcement?.messageRw || '',
    messageFr: announcement?.messageFr || '',
    link: announcement?.link || '',
    linkText: announcement?.linkText || '',
    startDate: announcement?.startDate || new Date().toISOString().split('T')[0],
    endDate: announcement?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: announcement?.priority || 5,
    dismissible: announcement?.dismissible ?? true,
    active: announcement?.active ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSaving(true);

    try {
      const now = new Date().toISOString();
      const currentUser = 'Current User'; // In production, get from auth context
      const announcementData: Announcement = {
        id: announcement?.id || `promo-${Date.now()}`,
        type: formData.type,
        title: formData.title,
        titleRw: formData.titleRw || formData.title,
        titleFr: formData.titleFr || formData.title,
        message: formData.message,
        messageRw: formData.messageRw || formData.message,
        messageFr: formData.messageFr || formData.message,
        link: formData.link,
        linkText: formData.linkText,
        startDate: formData.startDate,
        endDate: formData.endDate,
        priority: formData.priority,
        dismissible: formData.dismissible,
        active: formData.active,
        createdBy: announcement?.createdBy || currentUser,
        createdAt: announcement?.createdAt || now,
        updatedBy: isEditing ? currentUser : undefined,
        updatedAt: isEditing ? now : undefined,
      };

      if (isEditing) {
        updateAnnouncement(announcement.id, announcementData);
        toast.success('Promotion updated!');
      } else {
        addAnnouncement(announcementData);
        toast.success('Promotion created!');
      }

      onClose();
    } catch (error) {
      toast.error('Failed to save promotion');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <Card className="max-w-4xl mx-auto bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">
              {isEditing ? 'Edit Promotion' : 'Create New Promotion'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Language Tabs */}
            <div className="bg-gray-50 p-1 rounded-lg inline-flex gap-1">
              <Button
                variant={activeTab === 'english' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('english')}
              >
                🇬🇧 English
              </Button>
              <Button
                variant={activeTab === 'kinyarwanda' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('kinyarwanda')}
              >
                🇷🇼 Kinyarwanda
              </Button>
              <Button
                variant={activeTab === 'french' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('french')}
              >
                🇫🇷 French
              </Button>
            </div>

            {/* English Content */}
            {activeTab === 'english' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  📢 Promotion Details
                  <InfoTooltip text="TYPE: Choose promotion type (affects banner color). TITLE: Main headline. MESSAGE: Description text. LINK: Optional page to link to. DATES: When to show this promotion. PRIORITY: Higher numbers show first." />
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Type <span className="text-red-500">*</span></Label>
                    <select
                      value={formData.type}
                      onChange={(e) => updateField('type', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="seasonal">🌿 Seasonal (Green)</option>
                      <option value="promotion">🎯 Promotion (Orange/Red)</option>
                      <option value="info">ℹ️ Info (Blue)</option>
                      <option value="warning">⚠️ Warning (Yellow)</option>
                    </select>
                  </div>

                  <div>
                    <Label>Title <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g., 🥑 Avocado Season is Here!"
                      value={formData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Message <span className="text-red-500">*</span></Label>
                    <Textarea
                      placeholder="Brief description..."
                      value={formData.message}
                      onChange={(e) => updateField('message', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Link (Optional)</Label>
                      <Input
                        placeholder="/products"
                        value={formData.link}
                        onChange={(e) => updateField('link', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Link Text (Optional)</Label>
                      <Input
                        placeholder="Shop Now"
                        value={formData.linkText}
                        onChange={(e) => updateField('linkText', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date <span className="text-red-500">*</span></Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => updateField('startDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>End Date <span className="text-red-500">*</span></Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => updateField('endDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Priority (1-10)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.priority}
                        onChange={(e) => updateField('priority', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.dismissible}
                          onChange={(e) => updateField('dismissible', e.target.checked)}
                          className="w-4 h-4"
                        />
                        Can be dismissed
                      </Label>
                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => updateField('active', e.target.checked)}
                          className="w-4 h-4"
                        />
                        Active
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Kinyarwanda Content */}
            {activeTab === 'kinyarwanda' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  🇷🇼 Kinyarwanda Translation
                  <InfoTooltip text="Optional: Translate title and message to Kinyarwanda. If left empty, English content will be shown." />
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Umutwe (Title)</Label>
                    <Input
                      placeholder="Andika umutwe mu Kinyarwanda"
                      value={formData.titleRw}
                      onChange={(e) => updateField('titleRw', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Ubutumwa (Message)</Label>
                    <Textarea
                      placeholder="Andika ubutumwa mu Kinyarwanda"
                      value={formData.messageRw}
                      onChange={(e) => updateField('messageRw', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* French Content */}
            {activeTab === 'french' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  🇫🇷 French Translation
                  <InfoTooltip text="Optional: Translate title and message to French. If left empty, English content will be shown." />
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Titre (Title)</Label>
                    <Input
                      placeholder="Écrivez le titre en français"
                      value={formData.titleFr}
                      onChange={(e) => updateField('titleFr', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Message</Label>
                    <Textarea
                      placeholder="Écrivez le message en français"
                      value={formData.messageFr}
                      onChange={(e) => updateField('messageFr', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update' : 'Create'} Promotion
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
