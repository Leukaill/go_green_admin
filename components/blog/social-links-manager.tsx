'use client';

import { useState } from 'react';
import { Plus, X, Youtube, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type { SocialMediaLink } from '@/lib/data/blog';

interface SocialLinksManagerProps {
  links: SocialMediaLink[];
  onChange: (links: SocialMediaLink[]) => void;
}

export function SocialLinksManager({ links, onChange }: SocialLinksManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState<SocialMediaLink>({
    platform: 'facebook',
    url: '',
    label: '',
  });

  const platforms: Array<{ value: SocialMediaLink['platform']; label: string; icon: any; color: string }> = [
    { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-500' },
    { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-500' },
    { value: 'twitter', label: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
  ];

  const getPlatformInfo = (platform: SocialMediaLink['platform']) => {
    return platforms.find(p => p.value === platform) || platforms[0];
  };

  const addLink = () => {
    if (!newLink.url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(newLink.url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    onChange([...links, newLink]);
    setNewLink({ platform: 'facebook', url: '', label: '' });
    setShowAddForm(false);
    toast.success('Social link added!');
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
    toast.success('Social link removed');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Social Media Links (Optional)</Label>
        {!showAddForm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        )}
      </div>

      {/* Existing Links */}
      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link, index) => {
            const platformInfo = getPlatformInfo(link.platform);
            const Icon = platformInfo.icon;
            
            return (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${platformInfo.color}`} />
                    <div>
                      <p className="font-medium text-sm">{platformInfo.label}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {link.url}
                      </p>
                      {link.label && (
                        <p className="text-xs text-muted-foreground italic">
                          {link.label}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLink(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <Card className="p-4 space-y-3">
          <div>
            <Label className="text-sm mb-2">Platform</Label>
            <div className="grid grid-cols-5 gap-2">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <Button
                    key={platform.value}
                    type="button"
                    variant={newLink.platform === platform.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewLink({ ...newLink, platform: platform.value })}
                    className="flex flex-col h-auto py-2"
                  >
                    <Icon className={`h-5 w-5 mb-1 ${newLink.platform === platform.value ? '' : platform.color}`} />
                    <span className="text-xs">{platform.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-sm">URL</Label>
            <Input
              placeholder={`https://${newLink.platform}.com/your-profile`}
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && addLink()}
            />
          </div>

          <div>
            <Label className="text-sm">Label (Optional)</Label>
            <Input
              placeholder="e.g., Follow us on Facebook"
              value={newLink.label}
              onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && addLink()}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={addLink} className="flex-1">
              Add Link
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewLink({ platform: 'facebook', url: '', label: '' });
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {links.length === 0 && !showAddForm && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No social media links added yet
        </p>
      )}
    </div>
  );
}
