'use client';

import { useState, useEffect } from 'react';
import { Activity, X, User, Clock, Eye, EyeOff, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBlogAuditLogs, type AuditLog } from '@/lib/supabase/audit';
import { format } from 'date-fns';

interface BlogAuditLogsProps {
  onClose: () => void;
}

const actionIcons: Record<string, any> = {
  blog_post_created: FileText,
  blog_post_updated: Edit,
  blog_post_published: Eye,
  blog_post_unpublished: EyeOff,
  blog_post_deleted: Trash2,
};

const actionColors: Record<string, string> = {
  blog_post_created: 'bg-blue-100 text-blue-700',
  blog_post_updated: 'bg-yellow-100 text-yellow-700',
  blog_post_published: 'bg-green-100 text-green-700',
  blog_post_unpublished: 'bg-orange-100 text-orange-700',
  blog_post_deleted: 'bg-red-100 text-red-700',
};

export function BlogAuditLogs({ onClose }: BlogAuditLogsProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const { logs: auditLogs } = await getBlogAuditLogs();
    setLogs(auditLogs);
    setLoading(false);
  };

  const getActionLabel = (action: string) => {
    return action.replace('blog_post_', '').replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <Card className="max-w-6xl mx-auto bg-white">
          {/* Header */}
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Blog Audit Logs</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track all blog post actions and changes
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading audit logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-lg font-medium mb-2">No audit logs yet</p>
                <p className="text-sm text-muted-foreground">
                  Blog actions will be tracked here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => {
                  const Icon = actionIcons[log.action] || Activity;
                  const colorClass = actionColors[log.action] || 'bg-gray-100 text-gray-700';

                  return (
                    <Card key={log.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={`p-3 rounded-lg ${colorClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Action & Time */}
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={colorClass}>
                                {getActionLabel(log.action)}
                              </Badge>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                              </div>
                            </div>

                            {/* Admin Info */}
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold text-sm">{log.admin_name}</span>
                              <span className="text-sm text-muted-foreground">
                                ({log.admin_email})
                              </span>
                            </div>

                            {/* Details */}
                            {log.details && (
                              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {log.details.title && (
                                    <div>
                                      <span className="text-muted-foreground">Title:</span>
                                      <span className="ml-2 font-medium">{log.details.title}</span>
                                    </div>
                                  )}
                                  {log.details.category && (
                                    <div>
                                      <span className="text-muted-foreground">Category:</span>
                                      <span className="ml-2 font-medium">{log.details.category}</span>
                                    </div>
                                  )}
                                  {log.details.slug && (
                                    <div>
                                      <span className="text-muted-foreground">Slug:</span>
                                      <span className="ml-2 font-mono text-xs">{log.details.slug}</span>
                                    </div>
                                  )}
                                  {log.details.is_published !== undefined && (
                                    <div>
                                      <span className="text-muted-foreground">Status:</span>
                                      <Badge 
                                        variant={log.details.is_published ? 'default' : 'secondary'}
                                        className="ml-2"
                                      >
                                        {log.details.is_published ? 'Published' : 'Draft'}
                                      </Badge>
                                    </div>
                                  )}
                                  {log.details.changes && (
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground">Changes:</span>
                                      <div className="ml-2 mt-1 flex gap-2">
                                        {log.details.changes.title_changed && (
                                          <Badge variant="outline" className="text-xs">Title</Badge>
                                        )}
                                        {log.details.changes.content_changed && (
                                          <Badge variant="outline" className="text-xs">Content</Badge>
                                        )}
                                        {log.details.changes.status_changed && (
                                          <Badge variant="outline" className="text-xs">Status</Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* IP Address */}
                            {log.ip_address && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                IP: {log.ip_address}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>

          {/* Footer */}
          <div className="border-t p-4 bg-muted/30 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Total logs: {logs.length}
            </div>
            <Button onClick={onClose}>Close</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
