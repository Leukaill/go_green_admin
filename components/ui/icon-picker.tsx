'use client';

import { useState } from 'react';
import { Card } from './card';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { categoryIcons, getIconComponent, type CategoryIcon } from '@/lib/category-icons';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const SelectedIcon = getIconComponent(value);

  const filteredIcons = categoryIcons.filter(icon => {
    const matchesSearch = icon.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         icon.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Icons' },
    { value: 'produce', label: 'Fresh Produce' },
    { value: 'food', label: 'Food & Bakery' },
    { value: 'drinks', label: 'Beverages' },
    { value: 'special', label: 'Special' },
  ];

  return (
    <div className="space-y-2">
      <Label>Category Icon</Label>
      
      {/* Selected Icon Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors flex items-center justify-between bg-white"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <SelectedIcon className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {categoryIcons.find(i => i.name === value)?.label || 'Select an icon'}
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {/* Icon Picker Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <Card className="w-full max-w-2xl p-4 shadow-2xl border-2 border-green-200 bg-white max-h-[90vh] overflow-hidden flex flex-col">
          {/* Search and Filter */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-6 gap-2 pb-4">
              {filteredIcons.map((icon) => {
                const IconComponent = icon.component;
                const isSelected = icon.name === value;
                
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => {
                      onChange(icon.name);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-110 group ${
                      isSelected
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-400 hover:bg-green-50'
                    }`}
                    title={icon.label}
                  >
                    <IconComponent className={`h-6 w-6 mx-auto ${
                      isSelected ? 'text-green-600' : 'text-gray-600 group-hover:text-green-600'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {filteredIcons.length} icons available
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setSearchQuery('');
              }}
            >
              Close
            </Button>
          </div>
        </Card>
        </div>
      )}
    </div>
  );
}
