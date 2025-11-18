import { supabase } from './client';
import { checkIsSuperAdmin } from '@/lib/auth';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  author_name: string;
  author_avatar?: string;
  category: string;
  tags: string[];
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  created_by_id?: string;
  updated_by_id?: string;
}

/**
 * Get all blog posts (admin - includes drafts)
 */
export async function getAllBlogPosts(): Promise<{ posts: BlogPost[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
      return { posts: [], error: error.message };
    }

    return { posts: data || [] };
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return { posts: [], error: error.message };
  }
}

/**
 * Get blog post by ID
 */
export async function getBlogPostById(id: string): Promise<{ post: BlogPost | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching blog post:', error);
      return { post: null, error: error.message };
    }

    return { post: data };
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    return { post: null, error: error.message };
  }
}

/**
 * Create blog post
 */
export async function createBlogPost(post: Partial<BlogPost>): Promise<{ post: BlogPost | null; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { post: null, error: 'User not authenticated' };
    }

    const postData = {
      ...post,
      created_by_id: user.id,
      updated_by_id: user.id,
    };

    console.log('Creating blog post with data:', postData);

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', {
        error,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
        errorCode: error.code
      });
      return { post: null, error: error.message || 'Failed to create blog post' };
    }

    if (!data) {
      console.error('No data returned after insert');
      return { post: null, error: 'Insert succeeded but no data returned' };
    }

    console.log('Blog post created successfully:', data.id);
    return { post: data };
  } catch (error: any) {
    console.error('Unexpected error creating blog post:', {
      error,
      errorMessage: error?.message,
      errorStack: error?.stack
    });
    return { post: null, error: error?.message || 'An unexpected error occurred' };
  }
}

/**
 * Update blog post
 */
export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<{ post: BlogPost | null; error?: string }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      return { post: null, error: 'Authentication error: ' + authError.message };
    }
    
    if (!user) {
      console.error('No user found - not authenticated');
      return { post: null, error: 'User not authenticated' };
    }

    console.log('Updating blog post:', { 
      id, 
      userId: user.id,
      userEmail: user.email,
      updates 
    });

    // Perform the update directly - don't use .single() to avoid PGRST116
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        ...updates,
        updated_by_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating blog post:', {
        id,
        error,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
        errorCode: error.code
      });
      
      return { post: null, error: error.message || 'Failed to update blog post' };
    }

    // Check if any rows were updated
    if (!data || data.length === 0) {
      console.error('No rows updated - RLS policy blocking or post not found:', { id });
      return { post: null, error: 'Blog post not found or you do not have permission to update it. Please run RUN_THIS_FIX_BLOG_UPDATE.sql in Supabase.' };
    }

    console.log('Blog post updated successfully:', data[0].id);
    return { post: data[0] };
  } catch (error: any) {
    console.error('Unexpected error updating blog post:', {
      id,
      error,
      errorMessage: error?.message,
      errorStack: error?.stack
    });
    return { post: null, error: error?.message || 'An unexpected error occurred' };
  }
}

/**
 * Delete blog post
 */
export async function deleteBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Publish blog post
 */
export async function publishBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Publishing blog post:', id);
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error publishing blog post:', {
        id,
        error,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
        errorCode: error.code
      });
      return { success: false, error: error.message || 'Failed to publish blog post' };
    }

    if (!data || data.length === 0) {
      console.error('No rows updated when publishing:', id);
      return { success: false, error: 'Blog post not found or already published' };
    }

    console.log('Blog post published successfully:', id);
    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error publishing blog post:', {
      id,
      error,
      errorMessage: error?.message,
      errorStack: error?.stack
    });
    return { success: false, error: error?.message || 'An unexpected error occurred' };
  }
}

/**
 * Unpublish blog post
 */
export async function unpublishBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Unpublishing blog post:', id);
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        is_published: false,
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error unpublishing blog post:', {
        id,
        error,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
        errorCode: error.code
      });
      return { success: false, error: error.message || 'Failed to unpublish blog post' };
    }

    if (!data || data.length === 0) {
      console.error('No rows updated when unpublishing:', id);
      return { success: false, error: 'Blog post not found or already unpublished' };
    }

    console.log('Blog post unpublished successfully:', id);
    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error unpublishing blog post:', {
      id,
      error,
      errorMessage: error?.message,
      errorStack: error?.stack
    });
    return { success: false, error: error?.message || 'An unexpected error occurred' };
  }
}

/**
 * Check if current user can edit a blog post
 * Only the creator or super admin can edit
 */
export async function canEditBlogPost(postId: string): Promise<boolean> {
  try {
    // Check if user is super admin
    const isSuperAdmin = await checkIsSuperAdmin();
    if (isSuperAdmin) {
      return true;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return false;
    }

    // Check if user is the creator
    const { data: post } = await supabase
      .from('blog_posts')
      .select('created_by_id')
      .eq('id', postId)
      .single();

    return post?.created_by_id === user.id;
  } catch (error) {
    console.error('Error checking edit permission:', error);
    return false;
  }
}
