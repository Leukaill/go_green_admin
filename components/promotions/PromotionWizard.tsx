'use client';

import { useState } from 'react';
import { Tag, Percent, Link as LinkIcon, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ProductSearch } from './product-search';

interface PromotionWizardProps {
  formData: any;
  onChange: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function PromotionWizard({ formData, onChange, onSave, onCancel, isSaving }: PromotionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { number: 1, title: 'Basic Info', icon: Tag },
    { number: 2, title: 'Discount', icon: Percent },
    { number: 3, title: 'Product Link', icon: LinkIcon },
    { number: 4, title: 'Schedule', icon: Calendar },
  ];

  const discountTypes = [
    { value: 'percentage', label: 'Percentage', icon: '%', desc: 'e.g., 20% OFF' },
    { value: 'fixed_amount', label: 'Fixed Amount', icon: 'RWF', desc: 'e.g., RWF 5,000 OFF' },
    { value: 'buy_x_get_y', label: 'Buy X Get Y', icon: '🎁', desc: 'e.g., Buy 2 Get 1' },
  ];

  const canGoNext = () => {
    if (currentStep === 1) return formData.title.trim().length > 0;
    if (currentStep === 2) return formData.discount_value > 0;
    return true;
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
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <div key={step.number} className="flex items-center flex-1">
              <button
                onClick={() => setCurrentStep(step.number)}
                className={`flex flex-col items-center gap-2 transition-all ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? '✓' : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card className="p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create an engaging promotion for your customers
              </p>
            </div>

            <div>
              <Label htmlFor="title">Promotion Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => onChange({ ...formData, title: e.target.value })}
                placeholder="e.g., Summer Sale 2025"
                className="mt-2"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.title.length}/60 characters
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onChange({ ...formData, description: e.target.value })}
                placeholder="Brief description of your promotion"
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 2: Discount Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Discount Details</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Set up your discount offer
              </p>
            </div>

            <div>
              <Label>Discount Type *</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {discountTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => onChange({ ...formData, discount_type: type.value })}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      formData.discount_type === type.value
                        ? 'border-primary ring-2 ring-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{type.desc}</p>
                  </button>
                ))}
              </div>
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
                onChange={(e) => onChange({ ...formData, discount_value: Number(e.target.value) })}
                placeholder={formData.discount_type === 'percentage' ? '20' : '5000'}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="code">Promo Code (Optional)</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => onChange({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER50"
                className="mt-2 font-mono uppercase"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty for automatic discount, or add a code for customers to enter
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_purchase">Min Purchase (RWF)</Label>
                <Input
                  id="min_purchase"
                  type="number"
                  min="0"
                  value={formData.min_purchase_amount}
                  onChange={(e) => onChange({ ...formData, min_purchase_amount: Number(e.target.value) })}
                  placeholder="0"
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
                  onChange={(e) => onChange({ ...formData, usage_limit: Number(e.target.value) })}
                  placeholder="0 = unlimited"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6">
              <Label>Preview</Label>
              <div className="mt-2 p-6 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-2xl">{getDiscountPreview()}</h4>
                    <p className="text-sm opacity-90 mt-1">{formData.title || 'Your Promotion'}</p>
                    {formData.code && (
                      <p className="text-xs opacity-75 mt-2 font-mono">Code: {formData.code}</p>
                    )}
                  </div>
                  <div className="text-5xl">🏷️</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Product Link */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Product Link (Optional)</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Link this promotion to a specific product
              </p>
            </div>

            <div>
              <Label>Search & Select Product</Label>
              <div className="mt-2">
                <ProductSearch
                  selectedProducts={formData.product_id ? [formData.product_id] : []}
                  onProductsChange={(ids: string[]) => onChange({ ...formData, product_id: ids[0] || '' })}
                  maxProducts={1}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Tip: Linking to a product increases conversions by 40%
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Schedule */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Schedule & Display</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Set when this promotion will be active
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => onChange({ ...formData, start_date: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => onChange({ ...formData, end_date: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="priority">Priority (0-10)</Label>
              <Input
                id="priority"
                type="number"
                min="0"
                max="10"
                value={formData.priority}
                onChange={(e) => onChange({ ...formData, priority: Number(e.target.value) })}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher priority promotions are shown first
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.show_on_homepage}
                  onChange={(e) => onChange({ ...formData, show_on_homepage: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-medium">Show on Homepage</p>
                  <p className="text-xs text-muted-foreground">Display as a banner on the main page</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => onChange({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Make this promotion live immediately</p>
                </div>
              </label>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onCancel()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canGoNext()}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Create Promotion'}
          </Button>
        )}
      </div>
    </div>
  );
}
