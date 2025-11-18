'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  TrendingUp, 
  DollarSign,
  Search,
  Edit,
  Gift,
  Leaf,
  Star,
  Sprout,
  TreeDeciduous,
  Trees,
  X,
  Ban,
  CheckCircle,
  Mail,
  Calendar,
  Activity,
  Loader2,
  UserX,
  UserCheck
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { isSuperAdmin } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface HubMember {
  id: string;
  user_id: string;
  points_balance: number;
  total_earned: number;
  total_deposited: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
  // Joined from auth.users
  email?: string;
}

type HubTier = 'sprout' | 'leaf' | 'tree' | 'forest';

const tierInfo = {
  sprout: { name: 'Sprout', icon: Sprout, color: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-300', iconColor: 'text-green-600', minPoints: 0, maxPoints: 499999 },
  leaf: { name: 'Leaf', icon: Leaf, color: 'bg-green-200', textColor: 'text-green-800', borderColor: 'border-green-400', iconColor: 'text-green-700', minPoints: 500000, maxPoints: 1099999 },
  tree: { name: 'Tree', icon: TreeDeciduous, color: 'bg-emerald-300', textColor: 'text-emerald-900', borderColor: 'border-emerald-500', iconColor: 'text-emerald-800', minPoints: 1100000, maxPoints: 1699999 },
  forest: { name: 'Forest', icon: Trees, color: 'bg-emerald-500', textColor: 'text-white', borderColor: 'border-emerald-700', iconColor: 'text-white', minPoints: 1700000, maxPoints: null },
};

function getTierByPoints(totalEarned: number): HubTier {
  if (totalEarned >= 1700000) return 'forest';
  if (totalEarned >= 1100000) return 'tree';
  if (totalEarned >= 500000) return 'leaf';
  return 'sprout';
}

export default function HubManagementPage() {
  const [members, setMembers] = useState<HubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<HubMember | null>(null);
  const [giftPoints, setGiftPoints] = useState('');
  const [giftReason, setGiftReason] = useState('');
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setIsSuperAdminUser(isSuperAdmin());
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // Fetch hub accounts with emails from view
      const { data, error } = await supabase
        .from('hub_accounts_with_emails')
        .select('*')
        .order('total_earned', { ascending: false });

      if (error) throw error;
      
      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching hub members:', error);
      toast.error('Failed to load hub members');
    } finally {
      setLoading(false);
    }
  };

  const handleGiftPoints = async () => {
    if (!selectedMember || !giftPoints || parseInt(giftPoints) <= 0) {
      toast.error('Please enter a valid points amount');
      return;
    }

    try {
      setSubmitting(true);
      const giftAmount = parseInt(giftPoints);
      
      // Check tier before gifting
      const oldTier = getTierByPoints(selectedMember.total_earned);
      const newTotalEarned = selectedMember.total_earned + giftAmount;
      const newTier = getTierByPoints(newTotalEarned);
      const tierUpgraded = newTier !== oldTier;
      
      // Use RPC function to add points (creates transaction record automatically)
      const { data, error } = await supabase.rpc('add_hub_points_admin', {
        p_user_id: selectedMember.user_id,
        p_amount: giftAmount,
        p_description: giftReason || 'Admin gift points',
      });

      if (error) throw error;

      toast.success(`Gifted ${formatPrice(giftAmount)} points to ${selectedMember.email}!`);
      
      // Show tier upgrade notification
      if (tierUpgraded) {
        const tierData = tierInfo[newTier];
        setTimeout(() => {
          toast.success(`🎊 Member promoted to ${tierData.name} tier!`, {
            description: `They now have ${formatPrice(newTotalEarned)} total earned points`,
            duration: 5000,
          });
        }, 1000);
      }
      
      await fetchMembers();
      setShowGiftModal(false);
      setGiftPoints('');
      setGiftReason('');
    } catch (error: any) {
      console.error('Error gifting points:', error);
      toast.error(error.message || 'Failed to gift points');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustPoints = async (member: HubMember, adjustment: number) => {
    if (!isSuperAdminUser) {
      toast.error('Only super admins can adjust points');
      return;
    }

    try {
      const newBalance = Math.max(0, member.points_balance + adjustment);
      const newEarned = adjustment > 0 ? member.total_earned + adjustment : member.total_earned;
      
      const { error } = await supabase
        .from('hub_accounts')
        .update({ 
          points_balance: newBalance,
          total_earned: newEarned,
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id);

      if (error) throw error;

      toast.success(`Points ${adjustment > 0 ? 'added' : 'deducted'} successfully!`);
      await fetchMembers();
    } catch (error: any) {
      console.error('Error adjusting points:', error);
      toast.error('Failed to adjust points');
    }
  };

  const handleSetTierPoints = async (member: HubMember, targetTier: HubTier) => {
    if (!isSuperAdminUser) {
      toast.error('Only super admins can adjust tier points');
      return;
    }

    try {
      const targetPoints = tierInfo[targetTier].minPoints;
      const difference = targetPoints - member.total_earned;
      
      const { error } = await supabase
        .from('hub_accounts')
        .update({ 
          total_earned: targetPoints,
          points_balance: member.points_balance + difference,
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id);

      if (error) throw error;

      toast.success(`Member promoted to ${tierInfo[targetTier].name} tier!`);
      await fetchMembers();
      setShowEditModal(false);
    } catch (error: any) {
      console.error('Error setting tier:', error);
      toast.error('Failed to set tier');
    }
  };

  const filteredMembers = members.filter(member => {
    const memberTier = getTierByPoints(member.total_earned);
    const matchesSearch = member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = selectedTier === 'all' || memberTier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const stats = {
    totalMembers: members.length,
    totalPointsBalance: members.reduce((sum, m) => sum + m.points_balance, 0),
    totalEarned: members.reduce((sum, m) => sum + m.total_earned, 0),
    totalDeposits: members.reduce((sum, m) => sum + m.total_deposited, 0),
  };

  const tierDistribution = {
    sprout: members.filter(m => getTierByPoints(m.total_earned) === 'sprout').length,
    leaf: members.filter(m => getTierByPoints(m.total_earned) === 'leaf').length,
    tree: members.filter(m => getTierByPoints(m.total_earned) === 'tree').length,
    forest: members.filter(m => getTierByPoints(m.total_earned) === 'forest').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading Go Hub members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Go Hub Management</h1>
        <p className="text-gray-600">Manage loyalty program members and rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Total Members</p>
              <p className="text-4xl font-bold text-blue-600">{stats.totalMembers}</p>
            </div>
            <Users className="h-12 w-12 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">Points Balance</p>
              <p className="text-4xl font-bold text-green-600">{formatPrice(stats.totalPointsBalance)}</p>
            </div>
            <Star className="h-12 w-12 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-900 mb-1">Total Earned</p>
              <p className="text-4xl font-bold text-purple-600">{formatPrice(stats.totalEarned)}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-900 mb-1">Total Deposits</p>
              <p className="text-4xl font-bold text-orange-600">{formatPrice(stats.totalDeposits)}</p>
            </div>
            <DollarSign className="h-12 w-12 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Tier Distribution */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tier Distribution</h2>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(tierDistribution).map(([tier, count]) => {
            const info = tierInfo[tier as keyof typeof tierInfo];
            const Icon = info.icon;
            return (
              <div key={tier} className={`p-4 rounded-lg border-2 ${info.color} ${info.borderColor}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`h-6 w-6 ${info.iconColor}`} />
                  <span className={`font-bold ${info.textColor}`}>{info.name}</span>
                </div>
                <p className={`text-3xl font-bold ${info.textColor}`}>{count}</p>
                <p className="text-xs text-gray-600 mt-1">{formatPrice(info.minPoints)}+ points</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedTier === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedTier('all')}
            >
              All
            </Button>
            {Object.entries(tierInfo).map(([tier, info]) => (
              <Button
                key={tier}
                variant={selectedTier === tier ? 'default' : 'outline'}
                onClick={() => setSelectedTier(tier)}
                className={selectedTier === tier ? info.color : ''}
              >
                {info.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Members Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Member</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Tier</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Points</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Deposits</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.map((member) => {
                const memberTier = getTierByPoints(member.total_earned);
                const tierData = tierInfo[memberTier];
                const TierIcon = tierData.icon;
                
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{member.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${tierData.color} ${tierData.borderColor} border`}>
                        <TierIcon className={`h-4 w-4 ${tierData.iconColor}`} />
                        <span className={`text-sm font-medium ${tierData.textColor}`}>{tierData.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold text-gray-900">{formatPrice(member.points_balance)}</span>
                        </div>
                        <span className="text-xs text-gray-500">Earned: {formatPrice(member.total_earned)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{formatPrice(member.total_deposited)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(member.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowGiftModal(true);
                          }}
                        >
                          <Gift className="h-4 w-4 mr-1" />
                          Gift
                        </Button>
                        {isSuperAdminUser && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedMember(member);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Gift Points Modal */}
      {showGiftModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Gift Points</h2>
              <button onClick={() => setShowGiftModal(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Member</Label>
                <p className="text-sm text-gray-600">{selectedMember.email}</p>
              </div>
              <div>
                <Label>Current Balance</Label>
                <p className="text-2xl font-bold text-green-600">{formatPrice(selectedMember.points_balance)}</p>
                <p className="text-xs text-gray-500">Total Earned: {formatPrice(selectedMember.total_earned)}</p>
              </div>
              <div>
                <Label>Points to Gift</Label>
                <Input
                  type="number"
                  value={giftPoints}
                  onChange={(e) => setGiftPoints(e.target.value)}
                  placeholder="Enter points amount"
                />
              </div>
              <div>
                <Label>Reason (Optional)</Label>
                <Textarea
                  value={giftReason}
                  onChange={(e) => setGiftReason(e.target.value)}
                  placeholder="Why are you gifting these points?"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowGiftModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleGiftPoints} className="flex-1" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gift Points'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Tier Modal (Super Admin Only) */}
      {showEditModal && selectedMember && isSuperAdminUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Member Tier</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Member</Label>
                <p className="text-sm text-gray-600">{selectedMember.email}</p>
              </div>
              <div>
                <Label>Select New Tier</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {Object.entries(tierInfo).map(([tier, info]) => {
                    const Icon = info.icon;
                    return (
                      <button
                        key={tier}
                        onClick={() => handleSetTierPoints(selectedMember, tier as HubTier)}
                        className={`p-4 rounded-lg border-2 ${info.color} ${info.borderColor} hover:scale-105 transition-transform`}
                      >
                        <Icon className={`h-8 w-8 ${info.iconColor} mx-auto mb-2`} />
                        <p className={`font-bold ${info.textColor}`}>{info.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{formatPrice(info.minPoints)}+</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
