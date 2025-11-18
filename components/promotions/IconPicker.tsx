'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
}

const ICON_CATEGORIES = {
  seasonal: ['🎄', '🎅', '⛄', '🎁', '❄️', '🎉', '🎊', '🌸', '🌺', '🌻', '🍂', '🍁', '🎃', '👻', '💝', '💐'],
  emotions: ['😊', '🎉', '❤️', '⭐', '✨', '💫', '🌟', '💖', '🎈', '🎀', '🌈', '☀️', '🌙'],
  info: ['ℹ️', '📢', '📣', '📌', '📍', '🔔', '💡', '📝', '📋', '📄', '📰', '🗞️'],
  alert: ['⚠️', '🚨', '⛔', '🔴', '❗', '❌', '🛑', '⚡', '🔥', '💥'],
  business: ['💼', '📊', '📈', '💰', '💳', '🏪', '🛍️', '🎯', '📦', '🚚', '✅', '🔖'],
};

export function IconPicker({ value, onChange, label = 'Icon' }: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof ICON_CATEGORIES>('seasonal');

  const allIcons = ICON_CATEGORIES[selectedCategory];
  const filteredIcons = searchQuery
    ? allIcons.filter(icon => icon.includes(searchQuery))
    : allIcons;

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Selected Icon Display */}
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-3xl bg-gray-50">
          {value || '?'}
        </div>
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type emoji or select below"
            className="text-2xl"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.keys(ICON_CATEGORIES).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as keyof typeof ICON_CATEGORIES)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Icon Grid */}
      <div className="border rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-8 gap-2">
          {filteredIcons.map((icon, index) => (
            <button
              key={index}
              onClick={() => onChange(icon)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-all hover:scale-110 ${
                value === icon
                  ? 'bg-primary text-white ring-2 ring-primary'
                  : 'bg-white hover:bg-gray-100'
              }`}
              title={icon}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Tip: You can also type any emoji directly in the input field
      </p>
    </div>
  );
}
