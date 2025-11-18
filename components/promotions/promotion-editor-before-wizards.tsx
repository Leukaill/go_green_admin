'use client';

import { useState } from 'react';
import { X, Save, Sparkles, Tag, Percent, Calendar, Info, AlertTriangle, Snowflake, Link as LinkIcon, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ProductSearch } from './product-search';
import { createPromotion, updatePromotion, type Promotion } from '@/lib/supabase/promotions';

type AnnouncementType = 'promotion' | 'seasonal' | 'info' | 'alert';

interface PromotionEditorProps {
  promotion: Promotion | null;
  onClose: () => void;
}

export function PromotionEditor({ promotion, onClose }: PromotionEditorProps) {
  const isEditing = !!promotion;
  const [selectedType, setSelectedType] = useState<AnnouncementType | null>(isEditing ? 'promotion' : null);
  
  const [formData, setFormData] = useState({
    title: promotion?.title || '',
    description: promotion?.description || '',
    message: '',
    icon: '',
    discount_type: promotion?.discount_type || 'percentage' as 'percentage' | 'fixed_amount' | 'buy_x_get_y',
    discount_value: promotion?.discount_value || 0,
    code: promotion?.code || '',
    min_purchase_amount: promotion?.min_purchase_amount || 0,
    max_discount_amount: promotion?.max_discount_amount || 0,
    usage_limit: promotion?.usage_limit || 0,
    product_id: promotion?.product_id || '',
    link_url: '',
    link_text: '',
    start_date: promotion?.start_date ? new Date(promotion.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    end_date: promotion?.end_date ? new Date(promotion.end_date).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    show_on_homepage: promotion?.show_on_homepage ?? true,
    dismissible: true,
    priority: promotion?.priority || 0,
    is_active: promotion?.is_active ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const types = [
    { value: 'promotion', label: 'Promotion', icon: Percent, color: 'from-blue-500 to-blue-600', desc: 'Discount codes & sales' },
    { value: 'seasonal', label: 'Seasonal', icon: Snowflake, color: 'from-purple-500 to-purple-600', desc: 'Holiday messages' },
    { value: 'info', label: 'Information', icon: Info, color: 'from-green-500 to-green-600', desc: 'General updates' },
    { value: 'alert', label: 'Alert', icon: AlertTriangle, color: 'from-orange-500 to-red-600', desc: 'Important notices' },
  ];

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (selectedType === 'promotion' && formData.discount_value <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }

    if (selectedType !== 'promotion' && !formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error('End date must be after start date');
      return;
    }

    setIsSaving(true);

    try {
      if (selectedType === 'promotion') {
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
      } else {
        // TODO: Save to announcements table
        toast.info('Announcements system coming soon! Run SETUP_ANNOUNCEMENTS_CLEAN.sql first.');
      }

      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save');
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
  const isPromotion = selectedType === 'promotion';

  // Main Form
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-3xl bg-white">
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

          {/* Form Content */}
          <CardContent className="p-6 space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={isPromotion ? "e.g., Summer Sale 2025" : "e.g., Happy Holidays!"}
                className="mt-2"
              />
            </div>

            {/* Description / Message */}
            {isPromotion ? (
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the promotion"
                  className="mt-2"
                  rows={3}
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Your announcement message"
                  className="mt-2"
                  rows={4}
                />
              </div>
            )}

            {/* Promotion-specific fields */}
            {isPromotion && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount_type">Discount Type *</Label>
                    <select
                      id="discount_type"
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                      className="mt-2 w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed_amount">Fixed Amount (RWF)</option>
                      <option value="buy_x_get_y">Buy X Get Y</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="discount_value">
                      {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount (RWF)'} *
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      min="0"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="code">Promo Code (Optional)</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER50"
                    className="mt-2 font-mono"
                    maxLength={20}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_purchase">Min Purchase (RWF)</Label>
                    <Input
                      id="min_purchase"
                      type="number"
                      min="0"
                      value={formData.min_purchase_amount}
                      onChange={(e) => setFormData({ ...formData, min_purchase_amount: Number(e.target.value) })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="usage_limit">Usage Limit</Label>
                    <Input
                      id="usage_limit"
                      type="number"
                      min="0"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                      placeholder="0 = unlimited"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label>Product Link (Optional)</Label>
                  <div className="mt-2">
                    <ProductSearch
                      selectedProducts={formData.product_id ? [formData.product_id] : []}
                      onProductsChange={(ids) => setFormData({ ...formData, product_id: ids[0] || '' })}
                      maxProducts={1}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Announcement-specific fields */}
            {!isPromotion && (
              <>
                <div>
                  <Label htmlFor="icon">Icon (Optional)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🎄 or emoji"
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="link_url">Link URL (Optional)</Label>
                    <Input
                      id="link_url"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      placeholder="/products"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="link_text">Link Text</Label>
                    <Input
                      id="link_text"
                      value={formData.link_text}
                      onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                      placeholder="Learn More"
                      className="mt-2"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Display Settings */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.show_on_homepage}
                  onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Show on Homepage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Active</span>
              </label>

              {!isPromotion && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dismissible}
                    onChange={(e) => setFormData({ ...formData, dismissible: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Dismissible</span>
                </label>
              )}
            </div>
          </CardContent>

          {/* Footer */}
          <div className="border-t p-4 flex justify-between items-center">
            <Button variant="outline" onClick={() => setSelectedType(null)}>
              ← Change Type
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
