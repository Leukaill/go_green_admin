'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, User, Clock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BlogEditor } from '@/components/blog/blog-editor';
import { BlogAuditLogs } from '@/components/blog/blog-audit-logs';
import {
  getAllBlogPosts,
  deleteBlogPost as deletePost,
  publishBlogPost as publishPost,
  unpublishBlogPost as unpublishPost,
  canEditBlogPost,
  type BlogPost,
} from '@/lib/supabase/blog';
import { format } from 'date-fns';
import { isSuperAdmin } from '@/lib/auth';

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  // Load posts
  useEffect(() => {
    loadPosts();
    setIsSuperAdminUser(isSuperAdmin());

    // Listen for updates
    const handleUpdate = () => loadPosts();
    window.addEventListener('blog-posts-updated', handleUpdate);
    return () => window.removeEventListener('blog-posts-updated', handleUpdate);
  }, []);

  const loadPosts = async () => {
    // Load published posts from database
    const { posts: publishedPosts } = await getAllBlogPosts();
    
    // Load drafts from localStorage
    const drafts = JSON.parse(localStorage.getItem('blog-drafts') || '[]');
    
    // Combine both, removing duplicates (prefer drafts over published)
    const draftIds = new Set(drafts.map((d: any) => d.id));
    const uniquePublished = publishedPosts.filter(p => !draftIds.has(p.id));
    const allPosts = [...drafts, ...uniquePublished];
    
    setPosts(allPosts);
  };

  const handleCreateNew = () => {
    setSelectedPost(null);
    setIsEditorOpen(true);
  };

  const handleEdit = async (post: BlogPost) => {
    // Check if user has permission to edit
    const canEdit = await canEditBlogPost(post.id);
    if (!canEdit) {
      toast.error('You do not have permission to edit this post. Only the creator or super admin can edit.');
      return;
    }
    
    setSelectedPost(post);
    setIsEditorOpen(true);
  };

  const handleDelete = async (post: BlogPost) => {
    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
      // Check if it's a draft (localStorage) or published (database)
      if (post.id.startsWith('draft-')) {
        // Delete from localStorage
        const drafts = JSON.parse(localStorage.getItem('blog-drafts') || '[]');
        const filtered = drafts.filter((d: any) => d.id !== post.id);
        localStorage.setItem('blog-drafts', JSON.stringify(filtered));
        await loadPosts();
        toast.success('Draft deleted');
      } else {
        // Delete from database
        const { success } = await deletePost(post.id);
        if (success) {
          await loadPosts();
          toast.success('Blog post deleted');
        } else {
          toast.error('Failed to delete blog post');
        }
      }
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    if (post.is_published) {
      const { success } = await unpublishPost(post.id);
      if (success) {
        toast.success('Blog post unpublished');
        await loadPosts();
      }
    } else {
      const { success } = await publishPost(post.id);
      if (success) {
        toast.success('Blog post published');
        await loadPosts();
      }
    }
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedPost(null);
    loadPosts();
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || 
      (statusFilter === 'published' && post.is_published) ||
      (statusFilter === 'draft' && !post.is_published);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage blog posts with rich content
          </p>
        </div>
        <div className="flex gap-3">
          {isSuperAdminUser && (
            <Button onClick={() => setShowAuditLogs(true)} size="lg" variant="outline">
              <Activity className="h-5 w-5 mr-2" />
              Audit Logs
            </Button>
          )}
          <Button onClick={handleCreateNew} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create New Post
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All ({posts.length})
              </Button>
              <Button
                variant={statusFilter === 'published' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('published')}
              >
                Published ({posts.filter(p => p.is_published).length})
              </Button>
              <Button
                variant={statusFilter === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('draft')}
              >
                Drafts ({posts.filter(p => !p.is_published).length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' ? (
                <>
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No posts found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </>
              ) : (
                <>
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No blog posts yet</p>
                  <p className="text-sm mb-4">Create your first blog post to get started</p>
                  <Button onClick={handleCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Post
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-all">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={post.is_published ? 'default' : 'secondary'}>
                    {post.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="mb-3">
                  <Badge variant="outline" className="mb-2">
                    {post.category}
                  </Badge>
                  <h3 className="font-bold text-lg line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>{post.author_name || 'Go Green Team'}</span>
                  <span>{format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}</span>
                </div>

                {/* Super Admin Metadata */}
                {isSuperAdminUser && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3 w-3 text-emerald-700" />
                      <span className="text-emerald-900 font-semibold">Created by:</span>
                      <span className="text-emerald-700">{(post as any).created_by_email || 'Unknown'}</span>
                    </div>
                    {(post as any).updated_by_email && (
                      <div className="flex items-center gap-2 text-xs">
                        <User className="h-3 w-3 text-emerald-700" />
                        <span className="text-emerald-900 font-semibold">Updated by:</span>
                        <span className="text-emerald-700">{(post as any).updated_by_email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-emerald-700" />
                      <span className="text-emerald-900 font-semibold">Created:</span>
                      <span className="text-emerald-700">{format(new Date(post.created_at), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(post)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(post)}
                    title={post.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {post.is_published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(post)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Blog Editor Modal */}
      {isEditorOpen && (
        <BlogEditor
          post={selectedPost}
          onClose={handleEditorClose}
        />
      )}

      {/* Audit Logs Modal */}
      {showAuditLogs && (
        <BlogAuditLogs onClose={() => setShowAuditLogs(false)} />
      )}
    </div>
  );
}
