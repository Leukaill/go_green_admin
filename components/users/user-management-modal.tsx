'use client';

import { useState } from 'react';
import { X, Ban, CheckCircle, Shield, Trash2, Crown, User as UserIcon, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  updateCustomerStatus,
  updateCustomerNotes,
  type Customer,
  type UserRole 
} from '@/lib/supabase/customers';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';

interface UserManagementModalProps {
  user: Customer;
  onClose: () => void;
  onUpdate: () => void;
}

export function UserManagementModal({ user, onClose, onUpdate }: UserManagementModalProps) {
  const [action, setAction] = useState<'ban' | 'suspend' | 'role' | 'delete' | null>(null);
  const [reason, setReason] = useState('');
  const [banUntil, setBanUntil] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);

  const handleBanUser = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for banning');
      return;
    }

    const { success, error } = await updateCustomerStatus(user.id, 'banned', reason);
    if (success) {
      toast.success(`${user.name} has been banned`);
      onUpdate();
      onClose();
    } else {
      toast.error('Failed to ban user: ' + error);
    }
  };

  const handleUnbanUser = async () => {
    const { success, error } = await updateCustomerStatus(user.id, 'active');
    if (success) {
      toast.success(`${user.name} has been unbanned`);
      onUpdate();
      onClose();
    } else {
      toast.error('Failed to unban user: ' + error);
    }
  };

  const handleSuspendUser = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }

    const { success, error } = await updateCustomerStatus(user.id, 'suspended', reason);
    if (success) {
      toast.success(`${user.name} has been suspended`);
      onUpdate();
      onClose();
    } else {
      toast.error('Failed to suspend user: ' + error);
    }
  };

  const handleActivateUser = async () => {
    const { success, error } = await updateCustomerStatus(user.id, 'active');
    if (success) {
      toast.success(`${user.name} has been activated`);
      onUpdate();
      onClose();
    } else {
      toast.error('Failed to activate user: ' + error);
    }
  };

  const handleChangeRole = async () => {
    // Role changes not implemented yet - would need admin API
    toast.info('Role changes require admin privileges');
    onClose();
  };

  const handleDeleteUser = () => {
    // Delete requires admin API - not implemented
    toast.info('User deletion requires admin privileges');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'banned':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'vip':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-1">User Management</h2>
              <div className="flex items-center gap-3">
                <span className="text-white/90">User ID:</span>
                <span className="font-mono font-bold text-lg bg-white/20 px-3 py-1 rounded">
                  {user.id}
                </span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h3 className="font-bold text-lg mb-4 text-blue-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  👤
                </div>
                User Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-blue-700 font-medium">Name:</span>
                  <span className="ml-2 font-semibold text-gray-900">{user.name}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Email:</span>
                  <span className="ml-2 text-gray-700">{user.email}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Phone:</span>
                  <span className="ml-2 text-gray-700 font-mono">{user.phone}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Address:</span>
                  <span className="ml-2 text-gray-700">{user.address}</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
              <h3 className="font-bold text-lg mb-4 text-purple-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">
                  📊
                </div>
                Account Stats
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-purple-700 font-medium">Status:</span>
                  <Badge className={`ml-2 ${getStatusColor(user.status)}`}>
                    {user.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-purple-700 font-medium">Role:</span>
                  <Badge className={`ml-2 ${getRoleColor(user.role)}`}>
                    {user.role.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-purple-700 font-medium">Total Orders:</span>
                  <span className="ml-2 font-semibold text-gray-900">{user.totalOrders}</span>
                </div>
                <div>
                  <span className="text-purple-700 font-medium">Total Spent:</span>
                  <span className="ml-2 font-semibold text-green-600">{formatPrice(user.totalSpent)}</span>
                </div>
                <div>
                  <span className="text-purple-700 font-medium">Joined:</span>
                  <span className="ml-2 text-gray-700">{format(new Date(user.joinedDate), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Banned/Suspended Info */}
          {(user.status === 'banned' || user.status === 'suspended') && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5">
              <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {user.status === 'banned' ? 'Ban Information' : 'Suspension Information'}
              </h3>
              {user.bannedReason && (
                <p className="text-sm text-red-700 mb-2">
                  <span className="font-semibold">Reason:</span> {user.bannedReason}
                </p>
              )}
              {user.bannedUntil && (
                <p className="text-sm text-red-700">
                  <span className="font-semibold">Until:</span> {format(new Date(user.bannedUntil), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          {!action && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold text-xl mb-4 text-gray-900">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {user.status === 'banned' ? (
                  <Button
                    onClick={handleUnbanUser}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Unban User
                  </Button>
                ) : (
                  <Button
                    onClick={() => setAction('ban')}
                    variant="destructive"
                  >
                    <Ban className="h-5 w-5 mr-2" />
                    Ban User
                  </Button>
                )}

                {user.status === 'suspended' ? (
                  <Button
                    onClick={handleActivateUser}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Activate User
                  </Button>
                ) : user.status !== 'banned' && (
                  <Button
                    onClick={() => setAction('suspend')}
                    variant="outline"
                    className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                  >
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Suspend User
                  </Button>
                )}

                <Button
                  onClick={() => setAction('role')}
                  variant="outline"
                  className="border-purple-500 text-purple-700 hover:bg-purple-50"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Change Role
                </Button>

                <Button
                  onClick={() => setAction('delete')}
                  variant="outline"
                  className="border-red-500 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete User
                </Button>
              </div>
            </div>
          )}

          {/* Ban Form */}
          {action === 'ban' && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <h3 className="font-bold text-xl mb-4 text-red-900">Ban User</h3>
              <div className="space-y-4">
                <div>
                  <Label>Reason for Ban <span className="text-red-500">*</span></Label>
                  <Textarea
                    placeholder="e.g., Violated terms of service, fraudulent activity..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Ban Until (Optional)</Label>
                  <Input
                    type="date"
                    value={banUntil}
                    onChange={(e) => setBanUntil(e.target.value)}
                  />
                  <p className="text-xs text-gray-600 mt-1">Leave empty for permanent ban</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setAction(null)} variant="outline">Cancel</Button>
                  <Button onClick={handleBanUser} variant="destructive">Confirm Ban</Button>
                </div>
              </div>
            </div>
          )}

          {/* Suspend Form */}
          {action === 'suspend' && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <h3 className="font-bold text-xl mb-4 text-yellow-900">Suspend User</h3>
              <div className="space-y-4">
                <div>
                  <Label>Reason for Suspension <span className="text-red-500">*</span></Label>
                  <Textarea
                    placeholder="e.g., Payment issues, verification pending..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setAction(null)} variant="outline">Cancel</Button>
                  <Button onClick={handleSuspendUser} className="bg-yellow-600 hover:bg-yellow-700">
                    Confirm Suspension
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Change Role Form */}
          {action === 'role' && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <h3 className="font-bold text-xl mb-4 text-purple-900">Change User Role</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {(['customer', 'vip', 'admin'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedRole === role
                          ? 'border-purple-500 bg-white shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {role === 'admin' && <Shield className="h-6 w-6 text-purple-600" />}
                        {role === 'vip' && <Crown className="h-6 w-6 text-amber-600" />}
                        {role === 'customer' && <UserIcon className="h-6 w-6 text-blue-600" />}
                        <span className="font-semibold capitalize">{role}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setAction(null)} variant="outline">Cancel</Button>
                  <Button onClick={handleChangeRole} className="bg-purple-600 hover:bg-purple-700">
                    Update Role
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          {action === 'delete' && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <h3 className="font-bold text-xl mb-4 text-red-900 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Delete User Permanently
              </h3>
              <p className="text-red-700 mb-4">
                This will permanently delete <strong>{user.name}</strong> and all associated data. 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setAction(null)} variant="outline">Cancel</Button>
                <Button onClick={handleDeleteUser} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Permanently Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
