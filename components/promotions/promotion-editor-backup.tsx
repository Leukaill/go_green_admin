'use client';

import { useState, useEffect } from 'react';
import { X, Save, Calendar, Tag, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ProductSearch } from './product-search';
import {
  createPromotion,
  updatePromotion,
  type Promotion,
} from '@/lib/supabase/promotions';

interface PromotionEditorProps {
  promotion: Promotion | null;
  onClose: () => void;
}

export function PromotionEditor({ promotion, onClose }: PromotionEditorProps) {
  const isEditing = !!promotion;
  
  const [formData, setFormData] = useState({
    title: promotion?.title || '',
    description: promotion?.description || '',
    discount_type: promotion?.discount_type || 'percentage' as 'percentage' | 'fixed_amount' | 'buy_x_get_y',
    discount_value: promotion?.discount_value || 0,
    code: promotion?.code || '',
    min_purchase_amount: promotion?.min_purchase_amount || 0,
    max_discount_amount: promotion?.max_discount_amount || 0,
    usage_limit: promotion?.usage_limit || 0,
    product_id: promotion?.product_id || '',
    start_date: promotion?.start_date ? new Date(promotion.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    end_date: promotion?.end_date ? new Date(promotion.end_date).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    show_on_homepage: promotion?.show_on_homepage ?? true,
    priority: promotion?.priority || 0,
    is_active: promotion?.is_active ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (formData.discount_value <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error('End date must be after start date');
      return;
    }

    setIsSaving(true);

    try {
      const promotionData = {
        title: formData.title,
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        code: formData.code.trim() ? formData.code.toUpperCase() : null,
        min_purchase_amount: Number(formData.min_purchase_amount) || null,
        max_discount_amount: Number(formData.max_discount_amount) || null,
        usage_limit: Number(formData.usage_limit) || null,
        applicable_to: 'all' as const,
        product_id: formData.product_id || null,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date + 'T23:59:59').toISOString(),
        show_on_homepage: formData.show_on_homepage,
        priority: Number(formData.priority),
        is_active: formData.is_active,
      };

      let result;
      if (isEditing && promotion) {
        result = await updatePromotion(promotion.id, promotionData);
      } else {
        result = await createPromotion(promotionData);
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? 'Promotion updated!' : 'Promotion created!');
      
      // Trigger event to refresh promotions list
      window.dispatchEvent(new Event('promotions-updated'));
      
      // Trigger event to clear dismissed banners on website
      if (formData.show_on_homepage) {
        window.dispatchEvent(new Event('new-promotion-published'));
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving promotion:', error);
      toast.error(error?.message || 'Failed to save promotion');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <Card className="max-w-3xl mx-auto bg-white">
          {/* Header */}
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {isEditing ? 'Edit Promotion' : 'Create New Promotion'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Basic Information
              </h3>

              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Summer Sale 2025"
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the promotion"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            {/* Discount Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Discount Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Discount Type */}
                <div>
                  <Label htmlFor="discount_type">Discount Type *</Label>
                  <select
                    id="discount_type"
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (RWF)</option>
                    <option value="buy_x_get_y">Buy X Get Y</option>
                  </select>
                </div>

                {/* Discount Value */}
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
                    placeholder={formData.discount_type === 'percentage' ? '20' : '5000'}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Promo Code */}
              <div>
                <Label htmlFor="code">Promo Code (Optional)</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER50"
                  className="mt-1 font-mono"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for automatic discount. Will be converted to uppercase.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Min Purchase */}
                <div>
                  <Label htmlFor="min_purchase">Min Purchase (RWF)</Label>
                  <Input
                    id="min_purchase"
                    type="number"
                    min="0"
                    value={formData.min_purchase_amount}
                    onChange={(e) => setFormData({ ...formData, min_purchase_amount: Number(e.target.value) })}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>

                {/* Max Discount */}
                {formData.discount_type === 'percentage' && (
                  <div>
                    <Label htmlFor="max_discount">Max Discount (RWF)</Label>
                    <Input
                      id="max_discount"
                      type="number"
                      min="0"
                      value={formData.max_discount_amount}
                      onChange={(e) => setFormData({ ...formData, max_discount_amount: Number(e.target.value) })}
                      placeholder="10000"
                      className="mt-1"
                    />
                  </div>
                )}

                {/* Usage Limit */}
                <div>
                  <Label htmlFor="usage_limit">Usage Limit</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    min="0"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                    placeholder="100"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    0 = unlimited
                  </p>
                </div>
              </div>
            </div>

            {/* Product Link */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Product Link (For Banner)</h3>
              <div>
                <Label>Search & Select Product</Label>
                <div className="mt-1">
                  <ProductSearch
                    selectedProducts={formData.product_id ? [formData.product_id] : []}
                    onProductsChange={(ids) => setFormData({ ...formData, product_id: ids[0] || '' })}
                    maxProducts={1}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  When users click the banner, they'll be taken to this product
                </p>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {/* End Date */}
                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Display Settings</h3>

              <div className="flex items-center gap-4">
                {/* Show on Homepage */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_on_homepage}
                    onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Show on Homepage Banner</span>
                </label>

                {/* Active */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>

              {/* Priority */}
              <div className="w-32">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Higher = shown first
                </p>
              </div>
            </div>
          </CardContent>

          {/* Footer */}
          <div className="border-t p-4 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
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
                  {isEditing ? 'Update' : 'Create'} Promotion
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
