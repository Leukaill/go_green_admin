'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Percent, Tag, Calendar, TrendingUp, User, Clock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getAllPromotions,
  deletePromotion,
  togglePromotionStatus,
  canEditPromotion,
  type Promotion,
} from '@/lib/supabase/promotions';
import {
  getAllAnnouncements,
  type Announcement,
} from '@/lib/supabase/announcements';
import { PromotionEditor } from '@/components/promotions/promotion-editor';
import { format } from 'date-fns';
import { isSuperAdmin } from '@/lib/auth';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeTab, setActiveTab] = useState<'promotions' | 'announcements'>('promotions');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [editablePromotionIds, setEditablePromotionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPromotions();
    loadAnnouncements();
    setIsSuperAdminUser(isSuperAdmin());

    // Listen for updates
    const handleUpdate = () => {
      loadPromotions();
      loadAnnouncements();
    };
    window.addEventListener('promotions-updated', handleUpdate);
    return () => window.removeEventListener('promotions-updated', handleUpdate);
  }, []);

  const loadPromotions = async () => {
    const { promotions: data } = await getAllPromotions();
    setPromotions(data);

    // Check permissions for each promotion
    const editable = new Set<string>();
    for (const promo of data) {
      const canEdit = await canEditPromotion(promo.id);
      if (canEdit) {
        editable.add(promo.id);
      }
    }
    setEditablePromotionIds(editable);
  };

  const loadAnnouncements = async () => {
    const { announcements: data } = await getAllAnnouncements();
    setAnnouncements(data || []);
  };

  const handleCreateNew = () => {
    setSelectedPromotion(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsEditorOpen(true);
  };

  const handleDelete = async (promotion: Promotion) => {
    if (confirm(`Are you sure you want to delete "${promotion.title}"?`)) {
      const { success } = await deletePromotion(promotion.id);
      if (success) {
        await loadPromotions();
        toast.success('Promotion deleted');
      } else {
        toast.error('Failed to delete promotion');
      }
    }
  };

  const handleToggleStatus = async (promotion: Promotion) => {
    const { success } = await togglePromotionStatus(promotion.id, !promotion.is_active);
    if (success) {
      toast.success(promotion.is_active ? 'Promotion deactivated' : 'Promotion activated');
      await loadPromotions();
    } else {
      toast.error('Failed to update promotion status');
    }
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedPromotion(null);
    loadPromotions();
  };

  // Check if promotion is expired
  const isExpired = (promotion: Promotion) => {
    return new Date(promotion.end_date) < new Date();
  };

  // Check if promotion is upcoming
  const isUpcoming = (promotion: Promotion) => {
    return new Date(promotion.start_date) > new Date();
  };

  // Filter promotions
  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      promo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.code?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && promo.is_active && !isExpired(promo)) ||
      (statusFilter === 'inactive' && !promo.is_active) ||
      (statusFilter === 'expired' && isExpired(promo));

    return matchesSearch && matchesStatus;
  });

  // Get discount display
  const getDiscountDisplay = (promo: Promotion) => {
    if (promo.discount_type === 'percentage') {
      return `${promo.discount_value}% OFF`;
    } else if (promo.discount_type === 'fixed_amount') {
      return `RWF ${promo.discount_value} OFF`;
    } else {
      return 'Buy X Get Y';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Promotions & Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage promotions, seasonal messages, info, and alerts
          </p>
        </div>
        <Button onClick={handleCreateNew} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Create New
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'promotions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('promotions')}
          className="flex items-center gap-2"
        >
          <Percent className="h-4 w-4" />
          Promotions ({promotions.length})
        </Button>
        <Button
          variant={activeTab === 'announcements' ? 'default' : 'outline'}
          onClick={() => setActiveTab('announcements')}
          className="flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          Announcements ({announcements.length})
        </Button>
      </div>

      {/* Stats */}
      {activeTab === 'promotions' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{promotions.length}</p>
                </div>
                <Tag className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {promotions.filter(p => p.is_active && !isExpired(p)).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {promotions.filter(p => !p.is_active).length}
                  </p>
                </div>
                <EyeOff className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-red-600">
                    {promotions.filter(p => isExpired(p)).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters - Only for Promotions */}
      {activeTab === 'promotions' && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search promotions..."
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
                  All ({promotions.length})
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                >
                  Active ({promotions.filter(p => p.is_active && !isExpired(p)).length})
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('inactive')}
                >
                  Inactive ({promotions.filter(p => !p.is_active).length})
                </Button>
                <Button
                  variant={statusFilter === 'expired' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('expired')}
                >
                  Expired ({promotions.filter(p => isExpired(p)).length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promotions Grid */}
      {activeTab === 'promotions' && filteredPromotions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Percent className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <p className="text-lg font-medium mb-2">No promotions found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first promotion to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Promotion
              </Button>
            )}
          </CardContent>
        </Card>
      ) : activeTab === 'promotions' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map((promo) => (
            <Card key={promo.id} className="group hover:shadow-lg transition-all">
              {/* Banner Image or Gradient */}
              <div className="relative h-32 overflow-hidden bg-gradient-to-r from-primary to-primary/60">
                {promo.banner_image_url ? (
                  <img
                    src={promo.banner_image_url}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Percent className="h-16 w-16 text-white opacity-50" />
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {promo.is_active && !isExpired(promo) && (
                    <Badge className="bg-green-500">Active</Badge>
                  )}
                  {!promo.is_active && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  {isExpired(promo) && (
                    <Badge className="bg-red-500">Expired</Badge>
                  )}
                  {isUpcoming(promo) && (
                    <Badge className="bg-blue-500">Upcoming</Badge>
                  )}
                  {promo.show_on_homepage && (
                    <Badge className="bg-purple-500">Homepage</Badge>
                  )}
                </div>

                {/* Discount Display */}
                <div className="absolute top-3 right-3 bg-white text-primary px-3 py-1 rounded-full font-bold text-sm">
                  {getDiscountDisplay(promo)}
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-lg line-clamp-1 mb-1">
                    {promo.title}
                  </h3>
                  {promo.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {promo.description}
                    </p>
                  )}
                </div>

                {/* Code */}
                {promo.code && (
                  <div className="mb-3 p-2 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Code:</span>
                      <code className="font-mono font-bold">{promo.code}</code>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(promo.start_date), 'MMM d')} - {format(new Date(promo.end_date), 'MMM d, yyyy')}
                  </span>
                </div>

                {/* Usage */}
                {promo.usage_limit && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Usage</span>
                      <span className="font-medium">{promo.usage_count} / {promo.usage_limit}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((promo.usage_count / promo.usage_limit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Super Admin Metadata */}
                {isSuperAdminUser && (
                  <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3 w-3 text-emerald-700" />
                      <span className="text-emerald-900 font-semibold">Created by:</span>
                      <span className="text-emerald-700">{promo.created_by_email || 'Unknown'}</span>
                    </div>
                    {promo.updated_by_email && (
                      <div className="flex items-center gap-2 text-xs">
                        <User className="h-3 w-3 text-emerald-700" />
                        <span className="text-emerald-900 font-semibold">Updated by:</span>
                        <span className="text-emerald-700">{promo.updated_by_email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-emerald-700" />
                      <span className="text-emerald-900 font-semibold">Created:</span>
                      <span className="text-emerald-700">{format(new Date(promo.created_at), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  </div>
                )}

                {/* Actions - Only show if user can edit */}
                {editablePromotionIds.has(promo.id) ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(promo)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(promo)}
                      title={promo.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {promo.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(promo)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    View only
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Announcements Display */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-lg font-medium mb-2">No announcements found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first announcement to get started
                </p>
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Announcement
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement: any) => (
                <Card key={announcement.id} className="group hover:shadow-lg transition-all">
                  <div className="relative h-32 overflow-hidden bg-gradient-to-r from-purple-500 to-purple-600">
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">{announcement.icon || '📢'}</span>
                    </div>
                    <div className="absolute top-3 left-3 flex gap-2">
                      {announcement.is_active && (
                        <Badge className="bg-green-500">Active</Badge>
                      )}
                      {!announcement.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      <Badge className="bg-blue-500 capitalize">
                        {announcement.announcement_type}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-bold text-lg line-clamp-1 mb-1">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {announcement.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(announcement.start_date), 'MMM d')} - {format(new Date(announcement.end_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      {announcement.announcement_type} announcement
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Promotion Editor Modal */}
      {isEditorOpen && (
        <PromotionEditor
          promotion={selectedPromotion}
          onClose={handleEditorClose}
        />
      )}
    </div>
  );
}
