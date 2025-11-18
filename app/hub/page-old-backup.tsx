'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Wallet, 
  Users, 
  TrendingUp, 
  DollarSign,
  Search,
  Edit,
  Gift,
  Crown,
  Leaf,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Sprout,
  TreeDeciduous,
  Trees,
  X,
  Ban,
  CheckCircle,
  Mail,
  Calendar,
  Activity
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { isSuperAdmin } from '@/lib/auth';

interface HubMember {
  id: string;
  name: string;
  email: string;
  tier: 'sprout' | 'leaf' | 'tree' | 'forest';
  points: number;
  totalDeposits: number;
  joinedDate: string;
  lastActivity: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

const tierInfo = {
  sprout: { name: 'Sprout', icon: Sprout, color: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-300', iconColor: 'text-green-600' },
  leaf: { name: 'Leaf', icon: Leaf, color: 'bg-green-200', textColor: 'text-green-800', borderColor: 'border-green-400', iconColor: 'text-green-700' },
  tree: { name: 'Tree', icon: TreeDeciduous, color: 'bg-emerald-300', textColor: 'text-emerald-900', borderColor: 'border-emerald-500', iconColor: 'text-emerald-800' },
  forest: { name: 'Forest', icon: Trees, color: 'bg-emerald-500', textColor: 'text-white', borderColor: 'border-emerald-700', iconColor: 'text-white' },
};

// Mock data
const mockMembers: HubMember[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', tier: 'tree', points: 125000, totalDeposits: 500000, joinedDate: '2024-01-15', lastActivity: '2024-11-06', createdBy: 'Admin User', createdAt: '2024-01-15 10:30', updatedBy: 'John Doe', updatedAt: '2024-11-06 14:20' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', tier: 'leaf', points: 75000, totalDeposits: 250000, joinedDate: '2024-03-20', lastActivity: '2024-11-07', createdBy: 'Super Admin', createdAt: '2024-03-20 09:15' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', tier: 'sprout', points: 25000, totalDeposits: 100000, joinedDate: '2024-09-10', lastActivity: '2024-11-05', createdBy: 'Admin User', createdAt: '2024-09-10 16:45', updatedBy: 'Super Admin', updatedAt: '2024-11-05 11:30' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', tier: 'forest', points: 450000, totalDeposits: 2000000, joinedDate: '2023-11-01', lastActivity: '2024-11-07', createdBy: 'Super Admin', createdAt: '2023-11-01 08:00' },
];

export default function HubManagementPage() {
  const [members, setMembers] = useState<HubMember[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<HubMember | null>(null);
  const [giftPoints, setGiftPoints] = useState('');
  const [giftReason, setGiftReason] = useState('');
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);

  useEffect(() => {
    setIsSuperAdminUser(isSuperAdmin());
  }, []);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = selectedTier === 'all' || member.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const stats = {
    totalMembers: members.length,
    totalPoints: members.reduce((sum, m) => sum + m.points, 0),
    totalDeposits: members.reduce((sum, m) => sum + m.totalDeposits, 0),
    avgPointsPerMember: Math.round(members.reduce((sum, m) => sum + m.points, 0) / members.length),
  };

  const tierDistribution = {
    sprout: members.filter(m => m.tier === 'sprout').length,
    leaf: members.filter(m => m.tier === 'leaf').length,
    tree: members.filter(m => m.tier === 'tree').length,
    forest: members.filter(m => m.tier === 'forest').length,
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Go Hub Management</h1>
        <p className="text-sm text-gray-600">Manage loyalty program members and rewards</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+12%</span>
          </div>
          <p className="text-xs text-gray-600 mb-1">Total Members</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Star className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+8%</span>
          </div>
          <p className="text-xs text-gray-600 mb-1">Total Points</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPoints.toLocaleString()}</p>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+15%</span>
          </div>
          <p className="text-xs text-gray-600 mb-1">Total Deposits</p>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalDeposits)}</p>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+5%</span>
          </div>
          <p className="text-xs text-gray-600 mb-1">Avg Points/Member</p>
          <p className="text-2xl font-bold text-gray-900">{stats.avgPointsPerMember.toLocaleString()}</p>
        </Card>
      </div>

      {/* Tier Distribution */}
      <Card className="p-5 mb-6 bg-white border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Tier Distribution</h3>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(tierDistribution).map(([tier, count]) => {
            const info = tierInfo[tier as keyof typeof tierInfo];
            const TierIcon = info.icon;
            return (
              <div key={tier} className={`p-4 rounded-lg ${info.color} border ${info.borderColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <TierIcon className={`h-5 w-5 ${info.iconColor}`} />
                  <p className={`text-xs font-semibold ${info.textColor}`}>{info.name}</p>
                </div>
                <p className={`text-2xl font-bold ${info.textColor}`}>{count}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4 mb-4 bg-white border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTier('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedTier === 'all' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Tiers
            </button>
            {Object.entries(tierInfo).map(([tier, info]) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedTier === tier ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {info.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Members Table */}
      <Card className="overflow-hidden bg-white border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Member</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Tier</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Points</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Total Deposits</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Joined</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Last Active</th>
                {isSuperAdminUser && (
                  <>
                    <th className="text-left py-4 px-6 text-sm font-bold text-emerald-900">Created By</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-emerald-900">Updated By</th>
                  </>
                )}
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const info = tierInfo[member.tier];
                return (
                  <tr 
                    key={member.id} 
                    onClick={() => {
                      setSelectedMember(member);
                      setShowDetailsModal(true);
                    }}
                    className="border-t border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-600">{member.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${info.color} ${info.textColor} border ${info.borderColor}`}>
                        {info.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-semibold text-gray-900">{member.points.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(member.totalDeposits)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs text-gray-600">{member.joinedDate}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs text-gray-600">{member.lastActivity}</p>
                    </td>
                    {isSuperAdminUser && (
                      <>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-xs font-semibold text-emerald-900">{member.createdBy || 'N/A'}</p>
                            <p className="text-xs text-emerald-700">{member.createdAt || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {member.updatedBy ? (
                            <div>
                              <p className="text-xs font-semibold text-emerald-900">{member.updatedBy}</p>
                              <p className="text-xs text-emerald-700">{member.updatedAt}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">-</p>
                          )}
                        </td>
                      </>
                    )}
                    <td className="py-3 px-4">
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => {
                            setSelectedMember(member);
                            setShowEditModal(true);
                          }}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Edit Member"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedMember(member);
                            setShowGiftModal(true);
                          }}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          title="Gift Points"
                        >
                          <Gift className="h-4 w-4" />
                        </button>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Gift Points</h2>
              <button onClick={() => {
                setShowGiftModal(false);
                setGiftPoints('');
                setGiftReason('');
              }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Gifting to:</p>
              <p className="font-bold text-gray-900">{selectedMember.name}</p>
              <p className="text-xs text-gray-600">{selectedMember.email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Points Amount *</label>
                <input 
                  type="number" 
                  value={giftPoints}
                  onChange={(e) => setGiftPoints(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                  placeholder="e.g., 5000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reason *</label>
                <textarea 
                  value={giftReason}
                  onChange={(e) => setGiftReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                  placeholder="e.g., Compensation for service issue"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowGiftModal(false);
                  setGiftPoints('');
                  setGiftReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!giftPoints || !giftReason) {
                    alert('Please fill in all fields');
                    return;
                  }
                  // Update member points
                  setMembers(members.map(m => 
                    m.id === selectedMember.id 
                      ? { ...m, points: m.points + parseInt(giftPoints) }
                      : m
                  ));
                  alert(`Successfully gifted ${giftPoints} points to ${selectedMember.name}`);
                  setShowGiftModal(false);
                  setGiftPoints('');
                  setGiftReason('');
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
              >
                <Gift className="inline h-4 w-4 mr-2" />
                Gift Points
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Manage Member</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="font-bold text-gray-900 mb-1">{selectedMember.name}</p>
              <p className="text-sm text-gray-600">{selectedMember.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${tierInfo[selectedMember.tier].color} ${tierInfo[selectedMember.tier].textColor}`}>
                  {tierInfo[selectedMember.tier].name}
                </span>
                <span className="text-sm text-gray-600">{selectedMember.points.toLocaleString()} points</span>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Ban className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Ban from Hub</p>
                  <p className="text-xs text-gray-600">Suspend member access</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Edit className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Adjust Points</p>
                  <p className="text-xs text-gray-600">Manually modify balance</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Change Tier</p>
                  <p className="text-xs text-gray-600">Upgrade or downgrade tier</p>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => setShowEditModal(false)}
              className="w-full mt-6 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </Card>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6 bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Member Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Member Info */}
            <div className="mb-6 p-6 bg-gradient-to-r from-primary/10 to-green-500/10 rounded-lg border border-primary/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedMember.name}</h3>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {selectedMember.email}
                  </p>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${tierInfo[selectedMember.tier].color} ${tierInfo[selectedMember.tier].textColor} border ${tierInfo[selectedMember.tier].borderColor}`}>
                  {tierInfo[selectedMember.tier].name} Tier
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Current Points</p>
                  <p className="text-2xl font-bold text-primary">{selectedMember.points.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Total Deposits</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(selectedMember.totalDeposits)}</p>
                </div>
              </div>
            </div>

            {/* Activity Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <p className="text-xs font-semibold text-gray-600">Joined Date</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{selectedMember.joinedDate}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-gray-600" />
                  <p className="text-xs font-semibold text-gray-600">Last Active</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{selectedMember.lastActivity}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-4">
              <p className="text-sm font-bold text-gray-900 mb-3">Quick Actions</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowGiftModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                >
                  <Gift className="h-4 w-4" />
                  Gift Points
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowEditModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                  <Edit className="h-4 w-4" />
                  Manage
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
