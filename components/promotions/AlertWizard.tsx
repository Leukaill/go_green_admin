'use client';

import { useState } from 'react';
import { AlertTriangle, MessageSquare, Zap, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface AlertWizardProps {
  formData: any;
  onChange: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function AlertWizard({ formData, onChange, onSave, onCancel, isSaving }: AlertWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { number: 1, title: 'Alert Type', icon: AlertTriangle },
    { number: 2, title: 'Message', icon: MessageSquare },
    { number: 3, title: 'Action Required', icon: Zap },
    { number: 4, title: 'Duration', icon: Clock },
  ];

  const urgencyLevels = [
    { value: 'info', label: 'Info', icon: 'ℹ️', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-100 text-blue-700' },
    { value: 'warning', label: 'Warning', icon: '⚠️', color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-100 text-yellow-700' },
    { value: 'critical', label: 'Critical', icon: '🚨', color: 'from-red-500 to-red-600', bg: 'bg-red-100 text-red-700' },
  ];

  const alertCategories = [
    { value: 'service', label: 'Service', desc: 'Service interruptions' },
    { value: 'security', label: 'Security', desc: 'Security notices' },
    { value: 'maintenance', label: 'Maintenance', desc: 'Scheduled maintenance' },
    { value: 'policy', label: 'Policy', desc: 'Policy updates' },
  ];

  const canGoNext = () => {
    if (currentStep === 1) return formData.urgency && formData.alert_category;
    if (currentStep === 2) return formData.title.trim().length > 0 && formData.message.trim().length > 0;
    return true;
  };

  const selectedUrgency = urgencyLevels.find(u => u.value === formData.urgency) || urgencyLevels[0];

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
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? '✓' : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-red-500' : 'text-gray-500'}`}>
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
        {/* Step 1: Alert Type */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Alert Type</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Select the urgency level and category
              </p>
            </div>

            <div>
              <Label>Urgency Level *</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {urgencyLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => onChange({ ...formData, urgency: level.value, icon: level.icon })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.urgency === level.value
                        ? 'border-red-500 ring-2 ring-red-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{level.icon}</div>
                    <p className="font-medium">{level.label}</p>
                    <div className={`mt-2 px-2 py-1 rounded text-xs ${level.bg}`}>
                      {level.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Alert Category *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {alertCategories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => onChange({ ...formData, alert_category: cat.value })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      formData.alert_category === cat.value
                        ? 'border-red-500 ring-2 ring-red-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium">{cat.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Alert Message */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Alert Message</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Write a clear and concise alert message
              </p>
            </div>

            <div>
              <Label htmlFor="title">Headline *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => onChange({ ...formData, title: e.target.value })}
                placeholder="e.g., Service Temporarily Unavailable"
                className="mt-2"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.title.length}/60 characters - Keep it short and impactful
              </p>
            </div>

            <div>
              <Label htmlFor="message">Detailed Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => onChange({ ...formData, message: e.target.value })}
                placeholder="Explain what's happening and why..."
                className="mt-2"
                rows={4}
                maxLength={250}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.message.length}/250 characters
              </p>
            </div>

            <div>
              <Label htmlFor="affected_areas">Affected Services/Areas (Optional)</Label>
              <Input
                id="affected_areas"
                value={formData.affected_areas || ''}
                onChange={(e) => onChange({ ...formData, affected_areas: e.target.value })}
                placeholder="e.g., Payment processing, Order tracking"
                className="mt-2"
              />
            </div>

            {/* Preview */}
            <div className="mt-6">
              <Label>Preview</Label>
              <div className={`mt-2 p-4 rounded-lg bg-gradient-to-r ${selectedUrgency.color} text-white`}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{formData.icon || selectedUrgency.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{formData.title || 'Alert Headline'}</h4>
                    <p className="mt-2 text-sm opacity-90">{formData.message || 'Your message will appear here...'}</p>
                    {formData.affected_areas && (
                      <p className="mt-2 text-xs opacity-75">Affected: {formData.affected_areas}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Action Required */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Action Required</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Tell users what they should do
              </p>
            </div>

            <div>
              <Label htmlFor="action_required">What should users do? (Optional)</Label>
              <Textarea
                id="action_required"
                value={formData.action_required || ''}
                onChange={(e) => onChange({ ...formData, action_required: e.target.value })}
                placeholder="e.g., Please try again later or contact support"
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_info">Contact/Support</Label>
                <Input
                  id="contact_info"
                  value={formData.contact_info || ''}
                  onChange={(e) => onChange({ ...formData, contact_info: e.target.value })}
                  placeholder="support@example.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="link_url">Help Link</Label>
                <Input
                  id="link_url"
                  value={formData.link_url || ''}
                  onChange={(e) => onChange({ ...formData, link_url: e.target.value })}
                  placeholder="/help"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="alternative_options">Alternative Options (Optional)</Label>
              <Textarea
                id="alternative_options"
                value={formData.alternative_options || ''}
                onChange={(e) => onChange({ ...formData, alternative_options: e.target.value })}
                placeholder="Suggest alternatives if available..."
                className="mt-2"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Step 4: Duration & Display */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Duration & Display</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Set how long this alert will be shown
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
                  <p className="text-xs text-muted-foreground">Display prominently on the main page</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={!formData.dismissible}
                  onChange={(e) => onChange({ ...formData, dismissible: !e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-medium">Force Display (Non-dismissible)</p>
                  <p className="text-xs text-muted-foreground">
                    {formData.urgency === 'critical' ? 'Recommended for critical alerts' : 'Users cannot close this alert'}
                  </p>
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
                  <p className="text-xs text-muted-foreground">Make this alert live immediately</p>
                </div>
              </label>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Important:</strong> {formData.urgency === 'critical' ? 'Critical alerts will be shown prominently and cannot be dismissed by default.' : 'Make sure your alert message is clear and actionable.'}
              </p>
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
            className="bg-red-500 hover:bg-red-600"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={onSave} disabled={isSaving} className="bg-red-500 hover:bg-red-600">
            {isSaving ? 'Saving...' : 'Create Alert'}
          </Button>
        )}
      </div>
    </div>
  );
}
