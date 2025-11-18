'use client';

import { useState } from 'react';
import { Info, FileText, Link as LinkIcon, Eye, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { IconPicker } from './IconPicker';

interface InfoWizardProps {
  formData: any;
  onChange: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function InfoWizard({ formData, onChange, onSave, onCancel, isSaving }: InfoWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { number: 1, title: 'Information', icon: Info },
    { number: 2, title: 'Content', icon: FileText },
    { number: 3, title: 'Actions', icon: LinkIcon },
    { number: 4, title: 'Visibility', icon: Eye },
  ];

  const categories = [
    { value: 'update', label: 'Update', icon: '🔄', color: 'bg-blue-100 text-blue-700' },
    { value: 'news', label: 'News', icon: '📰', color: 'bg-green-100 text-green-700' },
    { value: 'feature', label: 'Feature', icon: '✨', color: 'bg-purple-100 text-purple-700' },
    { value: 'service', label: 'Service', icon: '🛠️', color: 'bg-orange-100 text-orange-700' },
  ];

  const importanceLevels = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' },
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
        {/* Step 1: Information Details */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Information Details</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Provide key details about this announcement
              </p>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => onChange({ ...formData, title: e.target.value })}
                placeholder="e.g., New Delivery Hours"
                className="mt-2"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.title.length}/60 characters
              </p>
            </div>

            <div>
              <Label>Category</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => onChange({ ...formData, category: cat.value })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      formData.category === cat.value
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <p className="font-medium">{cat.label}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Importance Level</Label>
              <div className="flex gap-3 mt-2">
                {importanceLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => onChange({ ...formData, importance: level.value })}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      formData.importance === level.value
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${level.color}`}>
                      {level.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Content */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Content</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Write your announcement message
              </p>
            </div>

            <div>
              <Label htmlFor="message">Main Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => onChange({ ...formData, message: e.target.value })}
                placeholder="Describe the information you want to share..."
                className="mt-2"
                rows={4}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.message.length}/300 characters
              </p>
            </div>

            <div>
              <Label htmlFor="additional_details">Additional Details (Optional)</Label>
              <Textarea
                id="additional_details"
                value={formData.additional_details || ''}
                onChange={(e) => onChange({ ...formData, additional_details: e.target.value })}
                placeholder="Add more context if needed..."
                className="mt-2"
                rows={3}
              />
            </div>

            <IconPicker
              value={formData.icon}
              onChange={(icon: string) => onChange({ ...formData, icon })}
              label="Choose an Icon"
            />
          </div>
        )}

        {/* Step 3: Actions */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Call to Action</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add links or actions (optional)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="link_text">Button Text</Label>
                <Input
                  id="link_text"
                  value={formData.link_text || ''}
                  onChange={(e) => onChange({ ...formData, link_text: e.target.value })}
                  placeholder="e.g., Learn More"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                  id="link_url"
                  value={formData.link_url || ''}
                  onChange={(e) => onChange({ ...formData, link_url: e.target.value })}
                  placeholder="/about"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contact_info">Contact Information (Optional)</Label>
              <Input
                id="contact_info"
                value={formData.contact_info || ''}
                onChange={(e) => onChange({ ...formData, contact_info: e.target.value })}
                placeholder="support@example.com or +250 XXX XXX XXX"
                className="mt-2"
              />
            </div>
          </div>
        )}

        {/* Step 4: Visibility */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Visibility & Schedule</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Control when and where this appears
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
                  <p className="text-xs text-muted-foreground">Allow users to close this announcement</p>
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
                  <p className="text-xs text-muted-foreground">Make this announcement live immediately</p>
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
            {isSaving ? 'Saving...' : 'Create Information'}
          </Button>
        )}
      </div>
    </div>
  );
}
