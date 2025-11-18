'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Sparkles, Megaphone, Info as InfoIcon, AlertCircle, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getAnnouncements,
  deleteAnnouncement,
  toggleAnnouncementActive,
  type Announcement,
  type AnnouncementType,
} from '@/lib/data/announcements';
import { PromotionEditor } from '@/components/promotions/promotion-editor';
import { format } from 'date-fns';
import { isSuperAdmin } from '@/lib/auth';

export default function PromotionsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | AnnouncementType>('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);

  useEffect(() => {
    loadAnnouncements();
    setIsSuperAdminUser(isSuperAdmin());

    // Listen for updates
    const handleUpdate = () => loadAnnouncements();
    window.addEventListener('announcements-updated', handleUpdate);
    return () => window.removeEventListener('announcements-updated', handleUpdate);
  }, []);

  const loadAnnouncements = () => {
    setAnnouncements(getAnnouncements());
  };

  const handleCreateNew = () => {
    setSelectedAnnouncement(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsEditorOpen(true);
  };

  const handleDelete = (announcement: Announcement) => {
    if (confirm(`Delete "${announcement.title}"?`)) {
      deleteAnnouncement(announcement.id);
      loadAnnouncements();
      toast.success('Promotion deleted');
    }
  };

  const handleToggleActive = (announcement: Announcement) => {
    toggleAnnouncementActive(announcement.id);
    loadAnnouncements();
    toast.success(announcement.active ? 'Promotion deactivated' : 'Promotion activated');
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedAnnouncement(null);
    loadAnnouncements();
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || announcement.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: AnnouncementType) => {
    switch (type) {
      case 'seasonal':
        return <Sparkles className="h-4 w-4" />;
      case 'promotion':
        return <Megaphone className="h-4 w-4" />;
      case 'info':
        return <InfoIcon className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: AnnouncementType) => {
    switch (type) {
      case 'seasonal':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'promotion':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'info':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const isActive = (announcement: Announcement) => {
    if (!announcement.active) return false;
    const now = new Date();
    const start = new Date(announcement.startDate);
    const end = new Date(announcement.endDate);
    return now >= start && now <= end;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Promotions & Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Manage banners that appear on your website
          </p>
        </div>
        <Button onClick={handleCreateNew} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Create Promotion
        </Button>
      </div>

      {/* Filters */}
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

            {/* Type Filter */}
            <div className="flex gap-2">
              <Button
                variant={typeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('all')}
              >
                All ({announcements.length})
              </Button>
              <Button
                variant={typeFilter === 'seasonal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('seasonal')}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Seasonal
              </Button>
              <Button
                variant={typeFilter === 'promotion' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('promotion')}
              >
                <Megaphone className="h-4 w-4 mr-1" />
                Promo
              </Button>
              <Button
                variant={typeFilter === 'info' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('info')}
              >
                <InfoIcon className="h-4 w-4 mr-1" />
                Info
              </Button>
              <Button
                variant={typeFilter === 'warning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('warning')}
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                Warning
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotions Grid */}
      {filteredAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No promotions found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first promotion to get started'}
            </p>
            {!searchQuery && typeFilter === 'all' && (
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Promotion
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div className={`p-3 rounded-lg ${getTypeColor(announcement.type)}`}>
                    {getTypeIcon(announcement.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {announcement.message}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {isActive(announcement) ? (
                          <Badge className="bg-green-500">Live</Badge>
                        ) : announcement.active ? (
                          <Badge variant="secondary">Scheduled</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                    </div>

                    {/* Super Admin Metadata */}
                    {isSuperAdminUser && (
                      <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-emerald-700" />
                            <span className="text-emerald-900 font-semibold">Created:</span>
                            <span className="text-emerald-700">{announcement.createdBy || 'Unknown'}</span>
                          </div>
                          {announcement.updatedBy && (
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-emerald-700" />
                              <span className="text-emerald-900 font-semibold">Updated:</span>
                              <span className="text-emerald-700">{announcement.updatedBy}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                      <div>
                        <span className="font-medium">Type:</span>{' '}
                        <span className="capitalize">{announcement.type}</span>
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span> {announcement.priority}
                      </div>
                      <div>
                        <span className="font-medium">Start:</span>{' '}
                        {format(new Date(announcement.startDate), 'MMM d, yyyy')}
                      </div>
                      <div>
                        <span className="font-medium">End:</span>{' '}
                        {format(new Date(announcement.endDate), 'MMM d, yyyy')}
                      </div>
                      {announcement.link && (
                        <div>
                          <span className="font-medium">Link:</span>{' '}
                          <a
                            href={announcement.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {announcement.linkText || 'View'}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(announcement)}
                    >
                      {announcement.active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(announcement)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <PromotionEditor announcement={selectedAnnouncement} onClose={handleEditorClose} />
      )}
    </div>
  );
}
