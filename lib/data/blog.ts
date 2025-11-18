export type VideoPlatform = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'local';
export type BlogStatus = 'draft' | 'published';

export interface SocialMediaLink {
  platform: 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'linkedin';
  url: string;
  label?: string;
}

export interface BlogVideo {
  url: string; // Full URL to the video on the platform or local path
  embedUrl?: string; // Embed URL for the video player (for external platforms)
  platform: VideoPlatform;
  thumbnail?: string; // Optional custom thumbnail
  duration?: number; // Full video duration in seconds (optional)
  fileName?: string; // Original file name for local videos
  fileSize?: number; // File size in bytes
}

export interface BlogPost {
  id: string;
  title: string;
  titleRw: string;
  titleFr: string;
  excerpt: string;
  excerptRw: string;
  excerptFr: string;
  content: string; // Rich HTML content from TipTap editor
  contentRw: string;
  contentFr: string;
  image: string;
  author: string;
  date: string;
  category: string;
  categoryRw: string;
  categoryFr: string;
  video?: BlogVideo; // Optional video
  socialLinks?: SocialMediaLink[]; // Social media links for the blog post
  status: BlogStatus; // Draft or Published
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// This will be synced with the main website's blog data
export let blogPosts: BlogPost[] = [];

// Load from localStorage on initialization
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('blog-posts');
  if (stored) {
    try {
      blogPosts = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse blog posts from localStorage', e);
    }
  }
}

// Save to localStorage
export function saveBlogPosts(posts: BlogPost[]) {
  blogPosts = posts;
  if (typeof window !== 'undefined') {
    localStorage.setItem('blog-posts', JSON.stringify(posts));
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new Event('blog-posts-updated'));
  }
}

// Get all posts
export function getBlogPosts(): BlogPost[] {
  return blogPosts;
}

// Get single post
export function getBlogPost(id: string): BlogPost | undefined {
  return blogPosts.find(post => post.id === id);
}

// Add new post
export function addBlogPost(post: BlogPost) {
  const newPosts = [...blogPosts, post];
  saveBlogPosts(newPosts);
}

// Update post
export function updateBlogPost(id: string, updates: Partial<BlogPost>) {
  const newPosts = blogPosts.map(post =>
    post.id === id ? { ...post, ...updates, updatedAt: new Date().toISOString() } : post
  );
  saveBlogPosts(newPosts);
}

// Delete post
export function deleteBlogPost(id: string) {
  const newPosts = blogPosts.filter(post => post.id !== id);
  saveBlogPosts(newPosts);
}

// Publish post
export function publishBlogPost(id: string) {
  updateBlogPost(id, {
    status: 'published',
    publishedAt: new Date().toISOString(),
  });
}

// Unpublish post
export function unpublishBlogPost(id: string) {
  updateBlogPost(id, {
    status: 'draft',
  });
}
