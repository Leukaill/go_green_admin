export type UserStatus = 'active' | 'banned' | 'suspended';
export type UserRole = 'customer' | 'vip' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  status: UserStatus;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  joinedDate: string;
  avatar?: string;
  notes?: string;
  bannedReason?: string;
  bannedUntil?: string;
}

const STORAGE_KEY = 'users';

// Default users
const defaultUsers: User[] = [
  {
    id: 'USER-001',
    name: 'Jean Uwimana',
    email: 'jean@example.com',
    phone: '0788123456',
    address: 'KG 15 Ave, Kigali',
    role: 'customer',
    status: 'active',
    totalOrders: 12,
    totalSpent: 540000,
    lastOrder: '2025-11-07',
    joinedDate: '2025-06-15',
  },
  {
    id: 'USER-002',
    name: 'Marie Mukamana',
    email: 'marie@example.com',
    phone: '0789234567',
    address: 'KN 5 Rd, Kigali',
    role: 'vip',
    status: 'active',
    totalOrders: 28,
    totalSpent: 1320000,
    lastOrder: '2025-11-05',
    joinedDate: '2025-05-20',
  },
  {
    id: 'USER-003',
    name: 'David Nkusi',
    email: 'david@example.com',
    phone: '0787345678',
    address: 'KG 9 St, Kimihurura',
    role: 'customer',
    status: 'active',
    totalOrders: 15,
    totalSpent: 675000,
    lastOrder: '2025-11-06',
    joinedDate: '2025-05-10',
  },
  {
    id: 'USER-004',
    name: 'Grace Uwase',
    email: 'grace@example.com',
    phone: '0786456789',
    address: 'KG 12 Ave, Kigali',
    role: 'customer',
    status: 'suspended',
    totalOrders: 5,
    totalSpent: 180000,
    lastOrder: '2025-10-28',
    joinedDate: '2025-08-05',
    notes: 'Payment issues - suspended temporarily',
  },
  {
    id: 'USER-005',
    name: 'Patrick Habimana',
    email: 'patrick@example.com',
    phone: '0785567890',
    address: 'KK 10 Rd, Kigali',
    role: 'vip',
    status: 'active',
    totalOrders: 45,
    totalSpent: 2890000,
    lastOrder: '2025-11-06',
    joinedDate: '2025-04-01',
  },
];

// Load users from localStorage
export function getUsers(): User[] {
  if (typeof window === 'undefined') return defaultUsers;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
  } catch (error) {
    console.error('Failed to load users:', error);
    return defaultUsers;
  }
}

// Save users to localStorage
export function saveUsers(users: User[]) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('users-updated'));
  } catch (error) {
    console.error('Failed to save users:', error);
  }
}

// Get single user
export function getUser(id: string): User | undefined {
  return getUsers().find(user => user.id === id);
}

// Update user
export function updateUser(id: string, updates: Partial<User>) {
  const users = getUsers();
  const updated = users.map(user =>
    user.id === id ? { ...user, ...updates } : user
  );
  saveUsers(updated);
}

// Ban user
export function banUser(id: string, reason: string, until?: string) {
  const users = getUsers();
  const updated = users.map(user =>
    user.id === id ? { 
      ...user, 
      status: 'banned' as UserStatus,
      bannedReason: reason,
      bannedUntil: until,
    } : user
  );
  saveUsers(updated);
}

// Unban user
export function unbanUser(id: string) {
  const users = getUsers();
  const updated = users.map(user =>
    user.id === id ? { 
      ...user, 
      status: 'active' as UserStatus,
      bannedReason: undefined,
      bannedUntil: undefined,
    } : user
  );
  saveUsers(updated);
}

// Suspend user
export function suspendUser(id: string, reason: string) {
  const users = getUsers();
  const updated = users.map(user =>
    user.id === id ? { 
      ...user, 
      status: 'suspended' as UserStatus,
      notes: reason,
    } : user
  );
  saveUsers(updated);
}

// Activate user
export function activateUser(id: string) {
  const users = getUsers();
  const updated = users.map(user =>
    user.id === id ? { 
      ...user, 
      status: 'active' as UserStatus,
    } : user
  );
  saveUsers(updated);
}

// Change user role
export function changeUserRole(id: string, role: UserRole) {
  const users = getUsers();
  const updated = users.map(user =>
    user.id === id ? { ...user, role } : user
  );
  saveUsers(updated);
}

// Delete user
export function deleteUser(id: string) {
  const users = getUsers();
  saveUsers(users.filter(user => user.id !== id));
}
