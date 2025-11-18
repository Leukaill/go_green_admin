'use client';

import { useState } from 'react';
import { X, Percent, Info, AlertTriangle, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { createPromotion, updatePromotion, type Promotion } from '@/lib/supabase/promotions';
import { createAnnouncement } from '@/lib/supabase/announcements';
import { PromotionWizard } from './PromotionWizard';
import { SeasonalWizard } from './SeasonalWizard';
import { InfoWizard } from './InfoWizard';
import { AlertWizard } from './AlertWizard';

type AnnouncementType = 'promotion' | 'seasonal' | 'info' | 'alert';

interface PromotionEditorProps {
  promotion: Promotion | null;
  onClose: () => void;
}

export function PromotionEditor({ promotion, onClose }: PromotionEditorProps) {
  const isEditing = !!promotion;
  const [selectedType, setSelectedType] = useState<AnnouncementType | null>(isEditing ? 'promotion' : null);
  
  const [formData, setFormData] = useState({
    // Common fields
    title: promotion?.title || '',
    description: promotion?.description || '',
    start_date: promotion?.start_date ? new Date(promotion.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    end_date: promotion?.end_date ? new Date(promotion.end_date).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    show_on_homepage: promotion?.show_on_homepage ?? true,
    priority: promotion?.priority || 0,
    is_active: promotion?.is_active ?? true,
    
    // Promotion-specific
    discount_type: promotion?.discount_type || 'percentage' as 'percentage' | 'fixed_amount' | 'buy_x_get_y',
    discount_value: promotion?.discount_value || 0,
    code: promotion?.code || '',
    min_purchase_amount: promotion?.min_purchase_amount || 0,
    max_discount_amount: promotion?.max_discount_amount || 0,
    usage_limit: promotion?.usage_limit || 0,
    product_id: promotion?.product_id || '',
    
    // Announcement-specific
    message: '',
    icon: '',
    subtitle: '',
    background_color: 'from-purple-500 to-purple-600',
    link_url: '',
    link_text: '',
    dismissible: true,
    category: '',
    importance: '',
    additional_details: '',
    contact_info: '',
    urgency: '',
    alert_category: '',
    action_required: '',
    affected_areas: '',
    alternative_options: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const types = [
    { value: 'promotion', label: 'Promotion', icon: Percent, color: 'from-blue-500 to-blue-600', desc: 'Discount codes & sales' },
    { value: 'seasonal', label: 'Seasonal', icon: Snowflake, color: 'from-purple-500 to-purple-600', desc: 'Holiday messages' },
    { value: 'info', label: 'Information', icon: Info, color: 'from-green-500 to-green-600', desc: 'General updates' },
    { value: 'alert', label: 'Alert', icon: AlertTriangle, color: 'from-orange-500 to-red-600', desc: 'Important notices' },
  ];

  const handleSavePromotion = async () => {
    setIsSaving(true);
    try {
      const promotionData = {
        title: formData.title,
        description: formData.description || undefined,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        code: formData.code.trim() ? formData.code.toUpperCase() : undefined,
        min_purchase_amount: Number(formData.min_purchase_amount) || undefined,
        max_discount_amount: Number(formData.max_discount_amount) || undefined,
        usage_limit: Number(formData.usage_limit) || undefined,
        applicable_to: 'all' as const,
        product_id: formData.product_id || undefined,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date + 'T23:59:59').toISOString(),
        show_on_homepage: formData.show_on_homepage,
        priority: Number(formData.priority),
        is_active: formData.is_active,
      };

      const result = isEditing && promotion
        ? await updatePromotion(promotion.id, promotionData)
        : await createPromotion(promotionData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? 'Promotion updated!' : 'Promotion created!');
      window.dispatchEvent(new Event('promotions-updated'));
      if (formData.show_on_homepage) {
        window.dispatchEvent(new Event('new-promotion-published'));
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save promotion');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAnnouncement = async () => {
    setIsSaving(true);
    try {
      const announcementData = {
        announcement_type: selectedType as 'seasonal' | 'info' | 'alert',
        title: formData.title,
        message: formData.message,
        icon: formData.icon || undefined,
        link_url: formData.link_url || undefined,
        link_text: formData.link_text || undefined,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date + 'T23:59:59').toISOString(),
        show_on_homepage: formData.show_on_homepage,
        dismissible: formData.dismissible,
        priority: Number(formData.priority),
        is_active: formData.is_active,
      };

      const result = await createAnnouncement(announcementData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`${selectedType?.charAt(0).toUpperCase()}${selectedType?.slice(1)} created!`);
      window.dispatchEvent(new Event('promotions-updated'));
      if (formData.show_on_homepage) {
        window.dispatchEvent(new Event('new-promotion-published'));
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save announcement');
    } finally {
      setIsSaving(false);
    }
  };

  // Type Selection Screen
  if (!selectedType) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl bg-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">What would you like to create?</h2>
                <p className="text-muted-foreground mt-1">Choose the type of content</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0 rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {types.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value as AnnouncementType)}
                    className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-primary transition-all p-6 text-left hover:shadow-lg"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-1">{type.label}</h3>
                      <p className="text-sm text-muted-foreground">{type.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedTypeInfo = types.find(t => t.value === selectedType)!;
  const Icon = selectedTypeInfo.icon;

  // Wizard Display
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-4xl bg-white">
          {/* Header */}
          <div className={`relative bg-gradient-to-r ${selectedTypeInfo.color} p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {isEditing ? `Edit ${selectedTypeInfo.label}` : `Create ${selectedTypeInfo.label}`}
                  </h2>
                  <p className="text-white/90 text-sm mt-1">{selectedTypeInfo.desc}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Wizard Content */}
          <CardContent className="p-6">
            {selectedType === 'promotion' && (
              <PromotionWizard
                formData={formData}
                onChange={setFormData}
                onSave={handleSavePromotion}
                onCancel={() => setSelectedType(null)}
                isSaving={isSaving}
              />
            )}

            {selectedType === 'seasonal' && (
              <SeasonalWizard
                formData={formData}
                onChange={setFormData}
                onSave={handleSaveAnnouncement}
                onCancel={() => setSelectedType(null)}
                isSaving={isSaving}
              />
            )}

            {selectedType === 'info' && (
              <InfoWizard
                formData={formData}
                onChange={setFormData}
                onSave={handleSaveAnnouncement}
                onCancel={() => setSelectedType(null)}
                isSaving={isSaving}
              />
            )}

            {selectedType === 'alert' && (
              <AlertWizard
                formData={formData}
                onChange={setFormData}
                onSave={handleSaveAnnouncement}
                onCancel={() => setSelectedType(null)}
                isSaving={isSaving}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
