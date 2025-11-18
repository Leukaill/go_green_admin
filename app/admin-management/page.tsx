'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Shield, UserX, UserCheck, Loader2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'inactive';
  last_login: string | null;
  created_at: string;
  phone?: string | null;
  temp_password?: string; // Temporary password shown only after creation
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'admin' as 'super_admin' | 'admin' | 'moderator',
    status: 'active' as 'active' | 'suspended' | 'inactive',
  });

  // Fetch admins from database
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setDataLoading(true);
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admins:', error);
        toast.error('Failed to load admins');
        return;
      }

      setAdmins((data as any[]) || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while loading admins');
    } finally {
      setDataLoading(false);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSuspend = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admins')
        .update({ status: 'suspended' })
        .eq('id', id);

      if (error) throw error;

      setAdmins(admins.map(admin =>
        admin.id === id ? { ...admin, status: 'suspended' as const } : admin
      ));
      toast.success('Admin suspended successfully');
    } catch (error) {
      console.error('Error suspending admin:', error);
      toast.error('Failed to suspend admin');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admins')
        .update({ status: 'active' })
        .eq('id', id);

      if (error) throw error;

      setAdmins(admins.map(admin =>
        admin.id === id ? { ...admin, status: 'active' as const } : admin
      ));
      toast.success('Admin activated successfully');
    } catch (error) {
      console.error('Error activating admin:', error);
      toast.error('Failed to activate admin');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;

    try {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAdmins(admins.filter(admin => admin.id !== id));
      toast.success('Admin deleted successfully');
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin');
    }
  };

  const handleAddAdmin = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'admin',
      status: 'active',
    });
    setIsAddDialogOpen(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '', // Don't show existing password
      phone: admin.phone || '',
      role: admin.role,
      status: admin.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmitAdd = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields (name, email, password)');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in');
      }

      // Call API to create admin with service role
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone || null,
          role: formData.role,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Full API Error:', data);
        console.error('Error code:', data.code);
        console.error('Error details:', data.details);
        console.error('Error hint:', data.hint);
        const errorMsg = data.error || data.message || 'Failed to create admin';
        const fullError = data.details ? `${errorMsg} - ${data.details}` : errorMsg;
        throw new Error(fullError);
      }

      // Refresh the admins list and add temp password to the new admin
      await fetchAdmins();
      
      // Add the temp password to the newly created admin
      setAdmins(prevAdmins => prevAdmins.map(admin => 
        admin.email === formData.email 
          ? { ...admin, temp_password: formData.password }
          : admin
      ));
      
      setIsAddDialogOpen(false);
      toast.success(`✅ Admin created! Password: ${formData.password}`);
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!formData.name || !formData.email || !editingAdmin) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        role: formData.role,
        status: formData.status,
      };

      const { error } = await supabase
        .from('admins')
        .update(updateData)
        .eq('id', editingAdmin.id);

      if (error) throw error;

      // Refresh the admins list
      await fetchAdmins();
      
      setIsEditDialogOpen(false);
      setEditingAdmin(null);
      toast.success('Admin updated successfully!');
    } catch (error: any) {
      console.error('Error updating admin:', error);
      toast.error(error.message || 'Failed to update admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-emerald-50 via-white to-green-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-emerald-800" />
          <h1 className="text-3xl font-bold text-emerald-900">Admin Management</h1>
        </div>
        <p className="text-gray-600">Manage administrator accounts and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6 bg-white border-emerald-200">
          <div className="text-3xl font-bold text-emerald-800">{admins.length}</div>
          <div className="text-sm text-gray-600">Total Admins</div>
        </Card>
        <Card className="p-6 bg-white border-emerald-200">
          <div className="text-3xl font-bold text-green-600">
            {admins.filter(a => a.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </Card>
        <Card className="p-6 bg-white border-emerald-200">
          <div className="text-3xl font-bold text-emerald-900">
            {admins.filter(a => a.role === 'super_admin').length}
          </div>
          <div className="text-sm text-gray-600">Super Admins</div>
        </Card>
        <Card className="p-6 bg-white border-emerald-200">
          <div className="text-3xl font-bold text-yellow-600">
            {admins.filter(a => a.status === 'suspended').length}
          </div>
          <div className="text-sm text-gray-600">Suspended</div>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="p-4 mb-6 bg-white border-emerald-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="bg-emerald-800 hover:bg-emerald-900" onClick={handleAddAdmin}>
            <Plus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
        </div>
      </Card>

      {/* Admins Table */}
      <Card className="bg-white border-emerald-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-emerald-50 border-b border-emerald-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-emerald-900">Admin</th>
                <th className="text-left p-4 text-sm font-semibold text-emerald-900">Role</th>
                <th className="text-left p-4 text-sm font-semibold text-emerald-900">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-emerald-900">Password</th>
                <th className="text-left p-4 text-sm font-semibold text-emerald-900">Last Login</th>
                <th className="text-left p-4 text-sm font-semibold text-emerald-900">Created</th>
                <th className="text-right p-4 text-sm font-semibold text-emerald-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="border-b border-gray-100 hover:bg-emerald-50/50 transition-colors">
                  <td className="p-4">
                    <div>
                      <div className="font-semibold text-gray-900">{admin.name}</div>
                      <div className="text-sm text-gray-600">{admin.email}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={
                      admin.role === 'super_admin'
                        ? 'bg-emerald-800 text-white'
                        : admin.role === 'moderator'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }>
                      {admin.role === 'super_admin' && <Shield className="h-3 w-3 mr-1" />}
                      {admin.role === 'super_admin' ? 'Super Admin' : admin.role === 'moderator' ? 'Moderator' : 'Admin'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge className={
                      admin.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }>
                      {admin.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {admin.temp_password ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-600">••••••••</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(admin.temp_password!);
                            toast.success('Password copied to clipboard!');
                          }}
                          className="h-7 px-2"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not available</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditAdmin(admin)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {admin.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuspend(admin.id)}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivate(admin.id)}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      )}
                      {admin.role !== 'super_admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(admin.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>
              Create a new administrator account for Go Green Rwanda.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@gogreen.rw"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 8 characters"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+250 787 399 228"
                className="h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-sm">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'super_admin' | 'admin' | 'moderator') => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-sm">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'suspended' | 'inactive') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd} disabled={loading} className="bg-emerald-800 hover:bg-emerald-900">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>
              Update administrator information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-sm">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-sm">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@gogreen.rw"
                className="h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-role" className="text-sm">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'super_admin' | 'admin' | 'moderator') => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-status" className="text-sm">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'suspended' | 'inactive') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={loading} className="bg-emerald-800 hover:bg-emerald-900">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
