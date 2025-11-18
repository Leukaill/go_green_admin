'use client';

import { useState } from 'react';
import { X, Save, Sparkles, Tag, Percent, Calendar, Info, AlertTriangle, Snowflake, Link as LinkIcon, Eye, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ProductSearch } from './product-search';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createPromotion,
  updatePromotion,
  type Promotion,
} from '@/lib/supabase/promotions';

type AnnouncementType = 'promotion' | 'seasonal' | 'info' | 'alert';

interface PromotionEditorProps {
  promotion: Promotion | null;
  onClose: () => void;
}

export function PromotionEditor({ promotion, onClose }: PromotionEditorProps) {
  const isEditing = !!promotion;
  const [currentStep, setCurrentStep] = useState(isEditing ? 1 : 0); // Start at 0 for type selection
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>('promotion');
  
  const [formData, setFormData] = useState({
    title: promotion?.title || '',
    description: promotion?.description || '',
    message: '', // For non-promotion types
    icon: '', // For announcements
    discount_type: promotion?.discount_type || 'percentage' as 'percentage' | 'fixed_amount' | 'buy_x_get_y',
    discount_value: promotion?.discount_value || 0,
    code: promotion?.code || '',
    min_purchase_amount: promotion?.min_purchase_amount || 0,
    max_discount_amount: promotion?.max_discount_amount || 0,
    usage_limit: promotion?.usage_limit || 0,
    product_id: promotion?.product_id || '',
    link_url: '', // For announcements
    link_text: '', // For announcements
    start_date: promotion?.start_date ? new Date(promotion.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    end_date: promotion?.end_date ? new Date(promotion.end_date).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    show_on_homepage: promotion?.show_on_homepage ?? true,
    dismissible: true,
    priority: promotion?.priority || 0,
    is_active: promotion?.is_active ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const steps = [
    { number: 1, title: 'Basic Info', icon: Tag },
    { number: 2, title: 'Discount', icon: Percent },
    { number: 3, title: 'Product Link', icon: LinkIcon },
    { number: 4, title: 'Schedule', icon: Calendar },
  ];

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a catchy title for your promotion');
      setCurrentStep(1);
      return;
    }
    if (formData.discount_value <= 0) {
      toast.error('Please enter a discount value greater than 0');
      setCurrentStep(2);
      return;
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error('End date must be after start date');
      setCurrentStep(4);
      return;
    }

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

      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span>{isEditing ? 'Promotion updated successfully!' : 'Promotion created successfully!'}</span>
        </div>
      );
      
      window.dispatchEvent(new Event('promotions-updated'));
      
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

  const getDiscountPreview = () => {
    if (formData.discount_type === 'percentage') {
      return `${formData.discount_value}% OFF`;
    } else if (formData.discount_type === 'fixed_amount') {
      return `RWF ${formData.discount_value.toLocaleString()} OFF`;
    } else {
      return 'Special Offer';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-4xl"
        >
          <Card className="bg-white shadow-2xl border-0">
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-r from-primary via-green-600 to-primary p-6 text-white overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
              </div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {isEditing ? 'Edit Promotion' : 'Create Amazing Promotion'}
                    </h2>
                    <p className="text-white/90 text-sm mt-1">
                      Boost your sales with irresistible offers
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Progress Steps */}
              <div className="mt-6 flex items-center justify-between relative">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.number;
                  const isCompleted = currentStep > step.number;
                  
                  return (
                    <div key={step.number} className="flex-1 flex items-center">
                      <button
                        onClick={() => setCurrentStep(step.number)}
                        className={`flex flex-col items-center gap-2 transition-all ${
                          isActive ? 'scale-110' : 'scale-100'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-white text-primary'
                            : isActive
                            ? 'bg-white text-primary shadow-lg'
                            : 'bg-white/20 text-white/60'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`text-xs font-medium ${
                          isActive ? 'text-white' : 'text-white/70'
                        }`}>
                          {step.title}
                        </span>
                      </button>
                      {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 transition-all ${
                          currentStep > step.number ? 'bg-white' : 'bg-white/20'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Tag className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Basic Information</h3>
                        <p className="text-sm text-muted-foreground">Make it catchy and memorable</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-base font-medium">
                          Promotion Title *
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g., Summer Mega Sale 🌞"
                          className="mt-2 h-12 text-base"
                          maxLength={60}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {formData.title.length}/60 characters
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-base font-medium">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Tell customers what makes this promotion special..."
                          className="mt-2 min-h-[100px] text-base"
                          maxLength={200}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {formData.description.length}/200 characters
                        </p>
                      </div>

                      {/* Preview Card */}
                      {formData.title && (
                        <Card className="bg-gradient-to-r from-primary/5 to-green-50 border-primary/20">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Eye className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-primary">Preview</span>
                            </div>
                            <h4 className="font-bold text-lg">{formData.title}</h4>
                            {formData.description && (
                              <p className="text-sm text-muted-foreground mt-1">{formData.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Discount */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Percent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Discount Configuration</h3>
                        <p className="text-sm text-muted-foreground">Set up your irresistible offer</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Discount Type Cards */}
                      <div className="md:col-span-2">
                        <Label className="text-base font-medium mb-3 block">Discount Type *</Label>
                        <div className="grid md:grid-cols-3 gap-3">
                          {[
                            { value: 'percentage', label: 'Percentage', icon: Percent, desc: 'e.g., 20% OFF' },
                            { value: 'fixed_amount', label: 'Fixed Amount', icon: Tag, desc: 'e.g., RWF 5,000 OFF' },
                            { value: 'buy_x_get_y', label: 'Buy X Get Y', icon: Zap, desc: 'e.g., Buy 2 Get 1' },
                          ].map((type) => {
                            const Icon = type.icon;
                            const isSelected = formData.discount_type === type.value;
                            return (
                              <button
                                key={type.value}
                                onClick={() => setFormData({ ...formData, discount_type: type.value as any })}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                  isSelected
                                    ? 'border-primary bg-primary/5 shadow-md'
                                    : 'border-gray-200 hover:border-primary/50'
                                }`}
                              >
                                <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                <div className="font-semibold">{type.label}</div>
                                <div className="text-xs text-muted-foreground mt-1">{type.desc}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Discount Value */}
                      <div>
                        <Label htmlFor="discount_value" className="text-base font-medium">
                          {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount (RWF)'} *
                        </Label>
                        <Input
                          id="discount_value"
                          type="number"
                          min="0"
                          value={formData.discount_value}
                          onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                          placeholder={formData.discount_type === 'percentage' ? '20' : '5000'}
                          className="mt-2 h-12 text-base"
                        />
                      </div>

                      {/* Promo Code */}
                      <div>
                        <Label htmlFor="code" className="text-base font-medium">
                          Promo Code (Optional)
                        </Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          placeholder="SUMMER50"
                          className="mt-2 h-12 text-base font-mono"
                          maxLength={20}
                        />
                      </div>

                      {/* Min Purchase */}
                      <div>
                        <Label htmlFor="min_purchase" className="text-base font-medium">
                          Minimum Purchase (RWF)
                        </Label>
                        <Input
                          id="min_purchase"
                          type="number"
                          min="0"
                          value={formData.min_purchase_amount}
                          onChange={(e) => setFormData({ ...formData, min_purchase_amount: Number(e.target.value) })}
                          placeholder="0"
                          className="mt-2 h-12 text-base"
                        />
                      </div>

                      {/* Usage Limit */}
                      <div>
                        <Label htmlFor="usage_limit" className="text-base font-medium">
                          Usage Limit
                        </Label>
                        <Input
                          id="usage_limit"
                          type="number"
                          min="0"
                          value={formData.usage_limit}
                          onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                          placeholder="100"
                          className="mt-2 h-12 text-base"
                        />
                        <p className="text-xs text-muted-foreground mt-1">0 = unlimited uses</p>
                      </div>
                    </div>

                    {/* Big Preview Badge */}
                    {formData.discount_value > 0 && (
                      <Card className="bg-gradient-to-br from-primary to-green-600 text-white border-0">
                        <CardContent className="p-6 text-center">
                          <div className="text-sm opacity-90 mb-2">Your customers will see:</div>
                          <div className="text-4xl font-bold">{getDiscountPreview()}</div>
                          {formData.code && (
                            <div className="mt-3 inline-block px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                              <span className="text-sm">Code: </span>
                              <span className="font-mono font-bold">{formData.code}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Product Link */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <LinkIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Link to Product</h3>
                        <p className="text-sm text-muted-foreground">Direct customers to a specific product</p>
                      </div>
                    </div>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-900">
                            <strong>Pro Tip:</strong> Linking to a specific product increases conversion rates by up to 40%!
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div>
                      <Label className="text-base font-medium mb-3 block">
                        Search & Select Product
                      </Label>
                      <ProductSearch
                        selectedProducts={formData.product_id ? [formData.product_id] : []}
                        onProductsChange={(ids) => setFormData({ ...formData, product_id: ids[0] || '' })}
                        maxProducts={1}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        When users click your promotion banner, they'll be taken directly to this product
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Schedule */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Schedule & Display</h3>
                        <p className="text-sm text-muted-foreground">When and where to show your promotion</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="start_date" className="text-base font-medium">
                          Start Date *
                        </Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="mt-2 h-12 text-base"
                        />
                      </div>

                      <div>
                        <Label htmlFor="end_date" className="text-base font-medium">
                          End Date *
                        </Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="mt-2 h-12 text-base"
                        />
                      </div>
                    </div>

                    {/* Display Options */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Display Options</Label>
                      
                      <Card className={`cursor-pointer transition-all ${
                        formData.show_on_homepage ? 'border-primary bg-primary/5' : 'border-gray-200'
                      }`}>
                        <CardContent className="p-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.show_on_homepage}
                              onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                              className="mt-1 w-5 h-5 rounded border-gray-300"
                            />
                            <div className="flex-1">
                              <div className="font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Show on Homepage Banner
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Display this promotion in a prominent banner at the top of your website
                              </p>
                            </div>
                          </label>
                        </CardContent>
                      </Card>

                      <Card className={`cursor-pointer transition-all ${
                        formData.is_active ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}>
                        <CardContent className="p-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.is_active}
                              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                              className="mt-1 w-5 h-5 rounded border-gray-300"
                            />
                            <div className="flex-1">
                              <div className="font-semibold flex items-center gap-2">
                                <Zap className="h-4 w-4 text-green-600" />
                                Active Immediately
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Make this promotion active as soon as you save it
                              </p>
                            </div>
                          </label>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Priority */}
                    <div>
                      <Label htmlFor="priority" className="text-base font-medium">
                        Priority Level
                      </Label>
                      <Input
                        id="priority"
                        type="number"
                        min="0"
                        max="10"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                        className="mt-2 h-12 text-base"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Higher priority promotions are shown first (0-10)
                      </p>
                    </div>

                    {/* Final Summary */}
                    <Card className="bg-gradient-to-r from-primary/10 to-green-50 border-primary/20">
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Eye className="h-5 w-5 text-primary" />
                          Promotion Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Title:</span>
                            <span className="font-medium">{formData.title || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Discount:</span>
                            <Badge variant="secondary">{getDiscountPreview()}</Badge>
                          </div>
                          {formData.code && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Code:</span>
                              <code className="font-mono font-bold">{formData.code}</code>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">
                              {new Date(formData.start_date).toLocaleDateString()} - {new Date(formData.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Homepage Banner:</span>
                            <span className="font-medium">{formData.show_on_homepage ? '✅ Yes' : '❌ No'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            {/* Footer */}
            <div className="border-t p-6 bg-gray-50 flex justify-between items-center">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    ← Previous
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                
                {currentStep < 4 ? (
                  <Button onClick={() => setCurrentStep(currentStep + 1)}>
                    Next →
                  </Button>
                ) : (
                  <Button onClick={handleSave} disabled={isSaving} className="min-w-[140px]">
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
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
