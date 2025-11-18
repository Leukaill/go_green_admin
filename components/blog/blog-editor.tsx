'use client';

import { useState, useEffect } from 'react';
import { X, Save, Eye, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { RichTextEditor } from './rich-text-editor';
import { ImageUpload } from './image-upload';
import { VideoUpload } from './video-upload';
import { SocialLinksManager } from './social-links-manager';
import {
  createBlogPost,
  updateBlogPost as updatePost,
  publishBlogPost as publishPost,
  type BlogPost,
} from '@/lib/supabase/blog';

// Keep these types from old blog if they exist
type BlogVideo = {
  url: string;
  thumbnail?: string;
  duration?: string;
};

type SocialMediaLink = {
  platform: string;
  url: string;
};

interface BlogEditorProps {
  post: BlogPost | null;
  onClose: () => void;
}

// Info Tooltip Component
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-xs hover:bg-blue-600 transition-colors"
      >
        !
      </button>
      {show && (
        <div className="absolute z-50 left-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
          {text}
          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}

export function BlogEditor({ post, onClose }: BlogEditorProps) {
  const isEditing = !!post;
  
  // Form state
  const [formData, setFormData] = useState({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    image: post?.image_url || '',
    author: post?.author_name || 'Go Green Team',
    category: post?.category || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (publishNow = false) => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.excerpt.trim()) {
      toast.error('Please enter an excerpt');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Please write some content');
      return;
    }
    if (!formData.image) {
      toast.error('Please add a featured image');
      return;
    }
    if (!formData.category.trim()) {
      toast.error('Please enter a category');
      return;
    }

    setIsSaving(true);

    try {
      const now = new Date().toISOString();
      
      // Generate slug from title
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (publishNow) {
        // PUBLISHING: Save to database
        const blogData = {
          title: formData.title,
          slug: post?.slug || slug,
          excerpt: formData.excerpt,
          content: formData.content,
          image_url: formData.image,
          author_name: formData.author,
          category: formData.category,
          tags: [],
          is_published: true,
          published_at: now,
        };

        const isDraft = post?.id?.toString().startsWith('draft-');
        
        if (isEditing && post && post.id && !isDraft) {
          // Update existing published post in database
          console.log('Updating blog post:', { id: post.id, blogData });
          const { post: updatedPost, error } = await updatePost(post.id, blogData);
          
          if (error) {
            console.error('Update failed:', error);
            toast.error(`Failed to update: ${error}`);
            return;
          }
          
          if (!updatedPost) {
            console.error('No post returned after update');
            toast.error('Update failed: No data returned');
            return;
          }
          
          console.log('Publishing blog post:', post.id);
          const { error: publishError } = await publishPost(post.id);
          
          if (publishError) {
            console.error('Publish failed:', publishError);
            toast.error(`Failed to publish: ${publishError}`);
            return;
          }
        } else {
          // Create new published post (from scratch or from draft)
          const { post: newPost, error } = await createBlogPost(blogData);
          
          if (error) {
            toast.error(error);
            return;
          }
          
          // Remove from localStorage if it was a draft
          if (post?.id && isDraft) {
            const drafts = JSON.parse(localStorage.getItem('blog-drafts') || '[]');
            const filtered = drafts.filter((d: any) => d.id !== post.id);
            localStorage.setItem('blog-drafts', JSON.stringify(filtered));
          }
        }
        
        toast.success('Blog post published!');
      } else {
        // SAVING AS DRAFT: Save to localStorage only
        const draftData = {
          id: post?.id || `draft-${Date.now()}`,
          title: formData.title,
          slug: slug,
          excerpt: formData.excerpt,
          content: formData.content,
          image_url: formData.image,
          author_name: formData.author,
          category: formData.category,
          tags: [],
          is_published: false,
          created_at: post?.created_at || now,
          updated_at: now,
        };

        // Get existing drafts
        const drafts = JSON.parse(localStorage.getItem('blog-drafts') || '[]');
        
        // Update or add draft
        const existingIndex = drafts.findIndex((d: any) => d.id === draftData.id);
        if (existingIndex >= 0) {
          drafts[existingIndex] = draftData;
        } else {
          drafts.push(draftData);
        }
        
        // Save to localStorage
        localStorage.setItem('blog-drafts', JSON.stringify(drafts));
        
        toast.success('Draft saved to your device!');
      }

      // Trigger refresh event
      window.dispatchEvent(new Event('blog-posts-updated'));
      onClose();
    } catch (error) {
      toast.error('Failed to save blog post');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <Card className="max-w-6xl mx-auto bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Write amazing content with our rich editor
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Blog Post Content */}
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    📝 Blog Post Details
                    <InfoTooltip text="TITLE: Main headline readers see (required). SUMMARY: 2-3 sentence preview for listings (required). CATEGORY: Topic area like 'Health & Nutrition' (required). AUTHOR: Who wrote this. CONTENT: Your full article with formatting (required)." />
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Title <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="e.g., 10 Benefits of Eating Fresh Vegetables"
                        value={formData.title}
                        onChange={(e) => updateField('title', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Summary <span className="text-red-500">*</span></Label>
                      <Textarea
                        placeholder="Write a compelling summary..."
                        value={formData.excerpt}
                        onChange={(e) => updateField('excerpt', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="e.g., Health & Nutrition"
                          value={formData.category}
                          onChange={(e) => updateField('category', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Author</Label>
                        <Input
                          placeholder="e.g., Go Green Team"
                          value={formData.author}
                          onChange={(e) => updateField('author', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Content <span className="text-red-500">*</span></Label>
                      <RichTextEditor
                        content={formData.content}
                        onChange={(content) => updateField('content', content)}
                      />
                    </div>
                  </div>
                </div>
              </div>

            {/* Media Section (shown on all tabs) */}
            <div className="border-t pt-6">
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  📸 Media & Social Links
                  <InfoTooltip text="FEATURED IMAGE: Main image for your blog post (required) - appears at top and in listings. VIDEO: Optional video from your computer or YouTube/Instagram/TikTok link. SOCIAL LINKS: Optional links to your Facebook, Twitter, Instagram, etc." />
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="font-semibold mb-2">Featured Image <span className="text-red-500">*</span></Label>
                    <ImageUpload
                      image={formData.image}
                      onChange={(image) => updateField('image', image)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
            <div className="text-sm text-muted-foreground">
              {isEditing ? 'Editing existing post' : 'Creating new post'}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={isSaving}
              >
                <Eye className="h-4 w-4 mr-2" />
                {isEditing ? 'Update & Publish' : 'Publish Now'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
