'use client';

import { useState, useEffect } from 'react';
import { Search, Mail, Phone, MapPin, ShoppingBag, Crown, Shield, Ban, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { getCustomers, type Customer, type UserStatus } from '@/lib/supabase/customers';
import { UserManagementModal } from '@/components/users/user-management-modal';
import { toast } from 'sonner';

export default function CustomersPage() {
  const [users, setUsers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const { customers, error } = await getCustomers();
    
    if (error) {
      console.error('Error loading customers:', error);
      toast.error('Failed to load customers: ' + error);
    } else {
      setUsers(customers);
      console.log(`Loaded ${customers.length} customers`);
    }
    
    setIsLoading(false);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const bannedUsers = users.filter(u => u.status === 'banned').length;
  const suspendedUsers = users.filter(u => u.status === 'suspended').length;
  const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'banned':
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'vip':
        return <Crown className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage all registered users and their accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{suspendedUsers}</div>
            <div className="text-sm text-muted-foreground">Suspended</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{bannedUsers}</div>
            <div className="text-sm text-muted-foreground">Banned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{formatPrice(totalRevenue)}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All ({totalUsers})
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Active ({activeUsers})
              </Button>
              <Button
                variant={statusFilter === 'suspended' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('suspended')}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Suspended ({suspendedUsers})
              </Button>
              <Button
                variant={statusFilter === 'banned' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('banned')}
              >
                <Ban className="h-4 w-4 mr-1" />
                Banned ({bannedUsers})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card 
            key={user.id} 
            className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
            onClick={() => setSelectedUser(user)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {user.name}
                      {getRoleIcon(user.role)}
                    </h3>
                    <p className="text-xs text-muted-foreground">{user.id}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(user.status)}>
                  {user.status}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{user.address || 'No address'}</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Orders:</span>
                  <span className="font-semibold">{user.totalOrders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Spent:</span>
                  <span className="font-semibold text-primary">{formatPrice(user.totalSpent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Order:</span>
                  <span>{user.lastOrder}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Joined:</span>
                  <span>{user.joinedDate}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4" onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(user);
              }}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Manage User
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <UserManagementModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={loadUsers}
        />
      )}
    </div>
  );
}
