'use client';

import { useState } from 'react';
import { Tag, Palette, Link as LinkIcon, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { IconPicker } from './IconPicker';
import { ProductSearch } from './product-search';

interface SeasonalWizardProps {
  formData: any;
  onChange: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function SeasonalWizard({ formData, onChange, onSave, onCancel, isSaving }: SeasonalWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { number: 1, title: 'Basic Info', icon: Tag },
    { number: 2, title: 'Message & Design', icon: Palette },
    { number: 3, title: 'Call to Action', icon: LinkIcon },
    { number: 4, title: 'Schedule', icon: Calendar },
  ];

  const colors = [
    { name: 'Purple', value: 'from-purple-500 to-purple-600', bg: 'bg-purple-500' },
    { name: 'Blue', value: 'from-blue-500 to-blue-600', bg: 'bg-blue-500' },
    { name: 'Green', value: 'from-green-500 to-green-600', bg: 'bg-green-500' },
    { name: 'Red', value: 'from-red-500 to-red-600', bg: 'bg-red-500' },
    { name: 'Orange', value: 'from-orange-500 to-orange-600', bg: 'bg-orange-500' },
    { name: 'Pink', value: 'from-pink-500 to-pink-600', bg: 'bg-pink-500' },
  ];

  const canGoNext = () => {
    if (currentStep === 1) return formData.title.trim().length > 0;
    if (currentStep === 2) return formData.message.trim().length > 0;
    return true;
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
                Create an engaging seasonal message for your customers
              </p>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => onChange({ ...formData, title: e.target.value })}
                placeholder="e.g., Happy Holidays 2025!"
                className="mt-2"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.title.length}/60 characters
              </p>
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle (Optional)</Label>
              <Input
                id="subtitle"
                value={formData.subtitle || ''}
                onChange={(e) => onChange({ ...formData, subtitle: e.target.value })}
                placeholder="e.g., Wishing you joy and prosperity"
                className="mt-2"
              />
            </div>

            <IconPicker
              value={formData.icon}
              onChange={(icon) => onChange({ ...formData, icon })}
              label="Choose an Icon"
            />
          </div>
        )}

        {/* Step 2: Message & Design */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Message & Design</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Craft your message and choose colors
              </p>
            </div>

            <div>
              <Label htmlFor="message">Main Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => onChange({ ...formData, message: e.target.value })}
                placeholder="Share your seasonal greetings..."
                className="mt-2"
                rows={4}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.message.length}/200 characters
              </p>
            </div>

            <div>
              <Label>Banner Color</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => onChange({ ...formData, background_color: color.value })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.background_color === color.value
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full h-8 rounded ${color.bg}`} />
                    <p className="text-xs mt-2 font-medium">{color.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6">
              <Label>Preview</Label>
              <div className={`mt-2 p-6 rounded-lg bg-gradient-to-r ${formData.background_color || 'from-purple-500 to-purple-600'} text-white`}>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{formData.icon || '🎄'}</span>
                  <div>
                    <h4 className="font-bold text-lg">{formData.title || 'Your Title'}</h4>
                    {formData.subtitle && <p className="text-sm opacity-90">{formData.subtitle}</p>}
                  </div>
                </div>
                <p className="mt-3 text-sm">{formData.message || 'Your message will appear here...'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Call to Action */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Call to Action</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add a button to drive engagement (optional)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="link_text">Button Text</Label>
                <Input
                  id="link_text"
                  value={formData.link_text || ''}
                  onChange={(e) => onChange({ ...formData, link_text: e.target.value })}
                  placeholder="e.g., Shop Holiday Gifts"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                  id="link_url"
                  value={formData.link_url || ''}
                  onChange={(e) => onChange({ ...formData, link_url: e.target.value })}
                  placeholder="/products"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Or Link to a Product</Label>
              <div className="mt-2">
                <ProductSearch
                  selectedProducts={formData.product_id ? [formData.product_id] : []}
                  onProductsChange={(ids) => onChange({ ...formData, product_id: ids[0] || '' })}
                  maxProducts={1}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Linking to a product increases conversions by 40%
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
                Set when this seasonal message will be shown
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
                  checked={formData.dismissible}
                  onChange={(e) => onChange({ ...formData, dismissible: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-medium">Dismissible</p>
                  <p className="text-xs text-muted-foreground">Allow users to close the banner</p>
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
                  <p className="text-xs text-muted-foreground">Make this message live immediately</p>
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
            {isSaving ? 'Saving...' : 'Create Seasonal Message'}
          </Button>
        )}
      </div>
    </div>
  );
}
