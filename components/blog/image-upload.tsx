'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

interface ImageUploadProps {
  image?: string;
  onChange: (image: string) => void;
  label?: string;
}

export function ImageUpload({ image, onChange, label = 'Featured Image' }: ImageUploadProps) {
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image file is too large. Maximum size is 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
      onChange(imageUrl);
      setImageUrl('');
      toast.success('Image URL added successfully!');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const removeImage = () => {
    onChange('');
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Image removed');
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {/* Upload Type Toggle */}
      {!image && (
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={uploadType === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadType('file')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
          <Button
            type="button"
            variant={uploadType === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadType('url')}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Image URL
          </Button>
        </div>
      )}

      {/* Image Preview */}
      {image && (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img
            src={image}
            alt="Preview"
            className="w-full h-64 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Interface */}
      {!image && uploadType === 'file' && (
        <div
          className={`border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors ${
            isUploading ? 'cursor-not-allowed opacity-50' : 'hover:border-primary cursor-pointer'
          }`}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-sm font-medium mb-1">Uploading image...</p>
              <p className="text-xs text-muted-foreground">Please wait</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Click to upload image</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF, or WebP (max 5MB)</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      )}

      {/* URL Input */}
      {!image && uploadType === 'url' && (
        <div className="flex gap-2">
          <Input
            placeholder="Paste image URL (e.g., https://example.com/image.jpg)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <Button type="button" onClick={handleUrlSubmit}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
