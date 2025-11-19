# Enhanced Product Creation Form Guide

## Overview
This guide will help you enhance the product creation form to be more user-friendly with flexible unit/quantity options.

## Changes Needed

### 1. Update Product Interface (app/products/page.tsx)

Add new fields to the Product interface:
```typescript
interface Product {
  // ... existing fields ...
  unit_type: 'weight' | 'piece' | 'bundle' | 'custom'; // Type of unit
  unit_options: string[]; // e.g., ['1kg', '2kg', '5kg'] or ['1 piece', '6 pieces', '12 pieces']
  min_quantity: number; // Minimum order quantity
  max_quantity: number; // Maximum order quantity
  price_per_unit: number; // Base price per unit
}
```

### 2. Enhanced Form Fields

Replace the boring form with these beautiful, organized sections:

#### **Section 1: Basic Information**
```tsx
<div className="space-y-4">
  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
    <Package className="h-5 w-5 text-primary" />
    Basic Information
  </h3>
  
  {/* Product Name */}
  <div>
    <Label>Product Name *</Label>
    <Input 
      placeholder="e.g., Fresh Organic Tomatoes"
      className="mt-1"
    />
  </div>

  {/* Category */}
  <div>
    <Label>Category *</Label>
    <Select>
      {/* Categories dropdown */}
    </Select>
  </div>

  {/* Description */}
  <div>
    <Label>Description</Label>
    <Textarea 
      placeholder="Describe your product..."
      rows={3}
      className="mt-1"
    />
  </div>
</div>
```

#### **Section 2: Pricing & Units (THE IMPORTANT PART)**
```tsx
<div className="space-y-4 bg-green-50 p-4 rounded-lg">
  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
    <DollarSign className="h-5 w-5 text-primary" />
    Pricing & Units
  </h3>

  {/* Unit Type Selection */}
  <div>
    <Label>How do you sell this product? *</Label>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
      <button
        type="button"
        onClick={() => setFormData({...formData, unit_type: 'weight'})}
        className={`p-4 border-2 rounded-xl transition-all ${
          formData.unit_type === 'weight'
            ? 'border-primary bg-primary/10'
            : 'border-gray-200 hover:border-primary/50'
        }`}
      >
        <Scale className="h-6 w-6 mx-auto mb-2" />
        <p className="text-sm font-medium">By Weight</p>
        <p className="text-xs text-gray-500">kg, g, lbs</p>
      </button>

      <button
        type="button"
        onClick={() => setFormData({...formData, unit_type: 'piece'})}
        className={`p-4 border-2 rounded-xl transition-all ${
          formData.unit_type === 'piece'
            ? 'border-primary bg-primary/10'
            : 'border-gray-200 hover:border-primary/50'
        }`}
      >
        <Package className="h-6 w-6 mx-auto mb-2" />
        <p className="text-sm font-medium">By Piece</p>
        <p className="text-xs text-gray-500">1, 2, 3...</p>
      </button>

      <button
        type="button"
        onClick={() => setFormData({...formData, unit_type: 'bundle'})}
        className={`p-4 border-2 rounded-xl transition-all ${
          formData.unit_type === 'bundle'
            ? 'border-primary bg-primary/10'
            : 'border-gray-200 hover:border-primary/50'
        }`}
      >
        <Layers className="h-6 w-6 mx-auto mb-2" />
        <p className="text-sm font-medium">By Bundle</p>
        <p className="text-xs text-gray-500">Packs, boxes</p>
      </button>

      <button
        type="button"
        onClick={() => setFormData({...formData, unit_type: 'custom'})}
        className={`p-4 border-2 rounded-xl transition-all ${
          formData.unit_type === 'custom'
            ? 'border-primary bg-primary/10'
            : 'border-gray-200 hover:border-primary/50'
        }`}
      >
        <Edit className="h-6 w-6 mx-auto mb-2" />
        <p className="text-sm font-medium">Custom</p>
        <p className="text-xs text-gray-500">Your choice</p>
      </button>
    </div>
  </div>

  {/* Unit Options Builder */}
  <div>
    <Label>Available Quantities *</Label>
    <p className="text-xs text-gray-500 mb-2">
      Add the different quantities customers can choose from
    </p>
    
    <div className="space-y-2">
      {formData.unit_options.map((option, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={option}
            onChange={(e) => {
              const newOptions = [...formData.unit_options];
              newOptions[index] = e.target.value;
              setFormData({...formData, unit_options: newOptions});
            }}
            placeholder={
              formData.unit_type === 'weight' ? 'e.g., 1kg' :
              formData.unit_type === 'piece' ? 'e.g., 1 piece' :
              formData.unit_type === 'bundle' ? 'e.g., 1 bundle' :
              'e.g., 1 unit'
            }
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Price"
            className="w-32"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              const newOptions = formData.unit_options.filter((_, i) => i !== index);
              setFormData({...formData, unit_options: newOptions});
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setFormData({
            ...formData,
            unit_options: [...formData.unit_options, '']
          });
        }}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Quantity Option
      </Button>
    </div>
  </div>

  {/* Quick Presets */}
  {formData.unit_type === 'weight' && (
    <div>
      <Label>Quick Presets</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFormData({
            ...formData,
            unit_options: ['500g', '1kg', '2kg', '5kg']
          })}
        >
          Standard Weights
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFormData({
            ...formData,
            unit_options: ['250g', '500g', '1kg']
          })}
        >
          Small Portions
        </Button>
      </div>
    </div>
  )}

  {formData.unit_type === 'piece' && (
    <div>
      <Label>Quick Presets</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFormData({
            ...formData,
            unit_options: ['1 piece', '3 pieces', '6 pieces', '12 pieces']
          })}
        >
          Standard Counts
        </Button>
      </div>
    </div>
  )}
</div>
```

#### **Section 3: Image Upload (Enhanced)**
```tsx
<div className="space-y-4">
  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
    <ImageIcon className="h-5 w-5 text-primary" />
    Product Image
  </h3>

  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors">
    {imagePreview ? (
      <div className="relative">
        <img src={imagePreview} className="max-h-64 mx-auto rounded-lg" />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={() => {
            setImageFile(null);
            setImagePreview(null);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    ) : (
      <div>
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500">
          PNG, JPG up to 10MB
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button type="button" variant="outline" className="mt-4">
            Choose File
          </Button>
        </label>
      </div>
    )}
  </div>
</div>
```

#### **Section 4: Additional Details (Collapsible)**
```tsx
<Collapsible>
  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <span className="font-semibold">Additional Details (Optional)</span>
    <ChevronDown className="h-5 w-5" />
  </CollapsibleTrigger>
  <CollapsibleContent className="mt-4 space-y-4">
    {/* Health Benefits */}
    <div>
      <Label>Health Benefits</Label>
      <Textarea
        placeholder="One benefit per line..."
        rows={3}
      />
    </div>

    {/* Nutrition Facts */}
    <div>
      <Label>Nutrition Facts</Label>
      <Textarea
        placeholder="Format: Label: Value (one per line)&#10;e.g., Calories: 100&#10;Protein: 5g"
        rows={3}
      />
    </div>

    {/* Featured Product */}
    <div className="flex items-center gap-2">
      <Switch />
      <Label>Feature this product on homepage</Label>
    </div>
  </CollapsibleContent>
</Collapsible>
```

### 3. Database Schema Update

Run this SQL in Supabase:
```sql
-- Add new columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'weight',
ADD COLUMN IF NOT EXISTS unit_options JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS min_quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_quantity INTEGER DEFAULT 100;

-- Update existing products to have default unit options
UPDATE products
SET unit_options = '["1kg", "2kg", "5kg"]'::jsonb
WHERE unit_options = '[]'::jsonb OR unit_options IS NULL;
```

### 4. Customer-Side Product Selection

On the website product page, show quantity selector based on unit_options:
```tsx
<div className="space-y-2">
  <Label>Select Quantity</Label>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
    {product.unit_options.map((option) => (
      <button
        key={option}
        onClick={() => setSelectedUnit(option)}
        className={`p-3 border-2 rounded-lg transition-all ${
          selectedUnit === option
            ? 'border-primary bg-primary/10'
            : 'border-gray-200 hover:border-primary/50'
        }`}
      >
        <p className="font-semibold">{option}</p>
        <p className="text-sm text-gray-600">{formatPrice(getPriceForUnit(option))}</p>
      </button>
    ))}
  </div>
</div>
```

## Benefits

1. **Admin Flexibility**: Admins can create any unit type they want
2. **Customer Choice**: Customers can choose from predefined quantities
3. **Better UX**: Visual selection instead of typing
4. **Pricing Clarity**: Each quantity shows its price
5. **Scalable**: Easy to add new unit types

## Icons Needed

Import these from lucide-react:
```typescript
import { 
  Package, DollarSign, Scale, Layers, Edit, Plus, 
  Trash2, Upload, X, ImageIcon, ChevronDown 
} from 'lucide-react';
```

## Implementation Steps

1. Update the Product interface
2. Add the new form sections
3. Run the SQL migration
4. Update the customer product page
5. Test with different unit types

This will make your product creation much more flexible and user-friendly!
