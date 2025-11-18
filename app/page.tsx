'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  ShoppingBag, 
  Users, 
  Wallet, 
  TrendingUp,
  Package,
  FileText,
  Megaphone,
  DollarSign,
  ShoppingCart,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Shield,
  Activity,
  Database,
  UserCog
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { isSuperAdmin } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  hubMembers: number;
  blogPosts: number;
  activePromos: number;
  avgOrderValue: number;
  revenueGrowth: string;
  ordersGrowth: string;
  productsGrowth: string;
  customersGrowth: string;
  hubGrowth: string;
  blogGrowth: string;
  promosGrowth: string;
  avgOrderGrowth: string;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [adminName, setAdminName] = useState('Admin');
  const [greeting, setGreeting] = useState<{ text: string; icon: any; message: string; emoji: string } | null>(null);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    hubMembers: 0,
    blogPosts: 0,
    activePromos: 0,
    avgOrderValue: 0,
    revenueGrowth: '0%',
    ordersGrowth: '0%',
    productsGrowth: '0%',
    customersGrowth: '0%',
    hubGrowth: '0%',
    blogGrowth: '0%',
    promosGrowth: '0%',
    avgOrderGrowth: '0%',
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [adminCount, setAdminCount] = useState(0);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [systemEvents, setSystemEvents] = useState(0);
  const [databaseSize, setDatabaseSize] = useState('0 MB');
  const [systemUptime, setSystemUptime] = useState('99.9%');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Set greeting only once on mount
    setGreeting(getGreeting());
    setIsSuperAdminUser(isSuperAdmin());
    fetchDashboardData();
    
    // Set up real-time subscription for orders
    const ordersChannel = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        ordersResult,
        productsResult,
        customersResult,
        blogPostsResult,
        adminsResult,
      ] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('blog_posts').select('*'),
        supabase.from('admins').select('*'),
      ]);

      // Log any errors for debugging
      if (ordersResult.error) console.error('Orders fetch error:', ordersResult.error);
      if (productsResult.error) console.error('Products fetch error:', productsResult.error);
      if (customersResult.error) console.error('Customers fetch error:', customersResult.error);
      if (blogPostsResult.error) console.error('Blog posts fetch error:', blogPostsResult.error);

      // Calculate stats from orders
      const orders = (ordersResult.data || []) as any[];
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get recent orders (last 5) - already sorted
      const recent = orders.slice(0, 5);
      setRecentOrders(recent);

      // Calculate previous period stats (30 days ago)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Current period (last 30 days)
      const recentOrders = orders.filter(o => new Date(o.created_at) >= thirtyDaysAgo);
      const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Previous period (30-60 days ago)
      const previousOrders = orders.filter(o => {
        const date = new Date(o.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      });
      const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const previousAvgOrder = previousOrders.length > 0 ? previousRevenue / previousOrders.length : 0;

      // Calculate order status distribution
      const statusCounts = orders.reduce((acc: any, order) => {
        const status = order.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      setOrderStatusData([
        { name: 'Delivered', value: statusCounts.delivered || 0 },
        { name: 'Processing', value: statusCounts.processing || 0 },
        { name: 'Pending', value: statusCounts.pending || 0 },
        { name: 'Cancelled', value: statusCounts.cancelled || 0 },
      ]);

      // Calculate monthly revenue (last 6 months)
      const monthlyRevenue = calculateMonthlyRevenue(orders);
      setRevenueData(monthlyRevenue);

      // Get customers with loyalty points (Hub members)
      const customers = (customersResult.data || []) as any[];
      const hubMembers = customers.filter(c => (c.loyalty_points || 0) > 0).length;

      // Calculate previous period customers
      const recentCustomers = customers.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length;
      const previousCustomers = customers.filter(c => {
        const date = new Date(c.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).length;

      const previousHubMembers = customers.filter(c => {
        const date = new Date(c.created_at);
        return (c.loyalty_points || 0) > 0 && date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).length;

      // Calculate growth percentages
      const calculateGrowth = (current: number, previous: number): string => {
        if (previous === 0) return current > 0 ? '+100%' : '0%';
        const growth = ((current - previous) / previous) * 100;
        return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
      };

      const revenueGrowth = calculateGrowth(recentRevenue, previousRevenue);
      const ordersGrowth = calculateGrowth(recentOrders.length, previousOrders.length);
      const customersGrowth = calculateGrowth(recentCustomers, previousCustomers);
      const avgOrderGrowth = calculateGrowth(avgOrderValue, previousAvgOrder);
      const hubGrowth = calculateGrowth(hubMembers, previousHubMembers);

      // Products and blog growth (compare counts)
      const products = (productsResult.data || []) as any[];
      const recentProducts = products.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length;
      const productsGrowth = `+${recentProducts}`;

      const blogPosts = (blogPostsResult.data || []) as any[];
      const recentBlogs = blogPosts.filter(b => new Date(b.created_at) >= thirtyDaysAgo).length;
      const blogGrowth = `+${recentBlogs}`;

      // Update stats
      setStats({
        totalRevenue,
        totalOrders,
        totalProducts: products.length,
        totalCustomers: customers.length,
        hubMembers,
        blogPosts: blogPosts.length,
        activePromos: 0, // TODO: Add promotions table
        avgOrderValue,
        revenueGrowth,
        ordersGrowth,
        productsGrowth,
        customersGrowth,
        hubGrowth,
        blogGrowth,
        promosGrowth: '+0',
        avgOrderGrowth,
      });

      setAdminCount(adminsResult.data?.length || 0);

      // Calculate system events (total records in all tables today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = orders.filter(o => new Date(o.created_at) >= today).length;
      const todayCustomers = customers.filter(c => new Date(c.created_at) >= today).length;
      const todayProducts = products.filter(p => new Date(p.created_at) >= today).length;
      const todayBlogs = blogPosts.filter(b => new Date(b.created_at) >= today).length;
      const totalEvents = todayOrders + todayCustomers + todayProducts + todayBlogs;
      
      console.log('System Events Debug:', {
        today: today.toISOString(),
        todayOrders,
        todayCustomers,
        todayProducts,
        todayBlogs,
        totalEvents,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        totalProducts: products.length,
        totalBlogs: blogPosts.length
      });
      
      setSystemEvents(totalEvents);

      // Calculate database size (estimate based on record counts)
      const totalRecords = orders.length + customers.length + products.length + blogPosts.length + (adminsResult.data?.length || 0);
      const estimatedSizeMB = (totalRecords * 2) / 1000; // Rough estimate: 2KB per record
      if (estimatedSizeMB < 1) {
        setDatabaseSize(`${(estimatedSizeMB * 1000).toFixed(0)} KB`);
      } else if (estimatedSizeMB < 1000) {
        setDatabaseSize(`${estimatedSizeMB.toFixed(1)} MB`);
      } else {
        setDatabaseSize(`${(estimatedSizeMB / 1000).toFixed(2)} GB`);
      }

      // System uptime (calculate based on oldest record)
      const allDates = [
        ...orders.map(o => new Date(o.created_at)),
        ...customers.map(c => new Date(c.created_at)),
        ...products.map(p => new Date(p.created_at)),
      ];
      if (allDates.length > 0) {
        const oldestDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const daysSinceStart = Math.floor((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
        const uptime = daysSinceStart > 0 ? ((daysSinceStart - 1) / daysSinceStart * 100).toFixed(1) : '99.9';
        setSystemUptime(`${uptime}%`);
      }

      // Get current admin name
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: admin } = await supabase
          .from('admins')
          .select('name')
          .eq('id', user.id)
          .single();
        if (admin) {
          setAdminName((admin as any).name);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (orders: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    const monthlyData: any[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthOrders = orders.filter(order => {
        const orderMonth = new Date(order.created_at).getMonth();
        return orderMonth === monthIndex;
      });
      const revenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      monthlyData.push({
        month: months[monthIndex],
        revenue,
      });
    }

    return monthlyData;
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    
    const morningGreetings = [
      "Rise and shine! Let's make today amazing! ☕",
      "Hope you're ready for a productive day!",
      "Fresh start, fresh opportunities! Let's go!",
      "The early bird gets the worm! You're crushing it! 🌅",
      "Morning energy activated! Time to conquer!",
      "New day, new victories ahead!",
      "Coffee ready? Let's make magic happen!",
      "Sunrise means new possibilities!",
      "You're up early! That's the spirit!",
      "Morning champion! Ready to win today?",
      "Breakfast of champions? Let's get to work!",
      "The world is yours this morning!",
      "Early start = early success!",
      "Morning vibes are immaculate today!",
      "Let's turn this morning into gold!",
      "Wakey wakey! Time to make money! 💰",
      "Good things come to those who wake early!",
      "Your morning hustle is inspiring!",
      "Bright and early! Love the dedication!",
      "Morning motivation: ON! Let's do this!",
      "The day is young and so are your dreams!",
      "Morning grind mode: ACTIVATED!",
      "You're glowing this morning! ✨",
      "Early bird special: SUCCESS!",
      "Morning masterpiece in the making!"
    ];

    const afternoonGreetings = [
      "You're doing great! Keep it up!",
      "Halfway through! You're crushing it! 💪",
      "Afternoon productivity at its finest!",
      "Keep that momentum going!",
      "You're on fire today!",
      "Lunch break over? Let's finish strong!",
      "Afternoon warrior! Love the energy!",
      "The grind doesn't stop! Respect!",
      "You're making it look easy!",
      "Afternoon excellence in progress!",
      "Keep pushing! Victory is near!",
      "Your afternoon game is strong!",
      "Midday magic happening right now!",
      "You're in the zone! Don't stop!",
      "Afternoon hustle = evening success!",
      "The day is yours! Own it!",
      "Productivity level: MAXIMUM! 🚀",
      "You're absolutely killing it!",
      "Afternoon champion status: UNLOCKED!",
      "Keep that winning streak alive!",
      "Your dedication is unmatched!",
      "Afternoon goals: SMASHED!",
      "You make success look effortless!",
      "The afternoon belongs to you!",
      "Unstoppable force detected! That's you!"
    ];

    const eveningGreetings = [
      "Wrapping up the day nicely!",
      "Almost there! Finish strong! 🌆",
      "Evening excellence! You've earned it!",
      "What a productive day you've had!",
      "Winding down like a boss!",
      "Evening vibes! Time to celebrate wins!",
      "You've conquered today! Well done!",
      "Sunset means mission accomplished!",
      "Evening warrior! Respect the hustle!",
      "Time to count your victories!",
      "You've made today count!",
      "Evening reflection: You're amazing!",
      "The day was yours! Own it!",
      "Sunset on another successful day!",
      "Evening mode: ACHIEVEMENT UNLOCKED!",
      "You've earned this evening!",
      "Day's work done! You're a star! ⭐",
      "Evening calm after a storm of success!",
      "Time to relax! You've earned it!",
      "What a day you've had!",
      "Evening pride! You should be proud!",
      "Closing time for another win!",
      "Evening satisfaction guaranteed!",
      "You've painted today beautiful!",
      "Evening hero! That's you!"
    ];

    const nightGreetings = [
      "Burning the midnight oil? Don't forget to rest!",
      "Night owl mode activated! 🦉",
      "Late night hustle! But sleep matters too!",
      "Dedication level: LEGENDARY!",
      "The grind never stops! But you should! 😴",
      "Night shift champion!",
      "Working late? You're incredible!",
      "Midnight warrior! Take care of yourself!",
      "The moon is proud of your dedication!",
      "Late night, big dreams!",
      "Night time is the right time! But rest soon!",
      "Burning bright in the night!",
      "Your dedication is inspiring! Sleep soon!",
      "Night owl wisdom in progress!",
      "The stars are watching your success!",
      "Late night magic happening!",
      "Night shift excellence!",
      "Working while others sleep! Respect!",
      "Moonlight motivation!",
      "Night time productivity beast!",
      "The night is young but you need rest!",
      "Midnight oil burning bright!",
      "Night grind! But health first!",
      "Stars align for night workers!",
      "Late night legend status!"
    ];

    const emojis = ['👋', '🎉', '✨', '🚀', '💪', '🌟', '🔥', '⚡', '💯', '🎯', '🏆', '👑', '💎', '🌈', '🎊', 
                    '🙌', '👏', '🎪', '🎭', '🎨', '🎬', '🎤', '🎸', '🎹', '🎺', '🎻', '🥁', '🎮', '🎲', '🎰'];
    
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    if (hour >= 5 && hour < 12) {
      const message = morningGreetings[Math.floor(Math.random() * morningGreetings.length)];
      return { text: 'Good morning', icon: Sunrise, message, emoji: randomEmoji };
    } else if (hour >= 12 && hour < 17) {
      const message = afternoonGreetings[Math.floor(Math.random() * afternoonGreetings.length)];
      return { text: 'Good afternoon', icon: Sun, message, emoji: randomEmoji };
    } else if (hour >= 17 && hour < 21) {
      const message = eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)];
      return { text: 'Good evening', icon: Sunset, message, emoji: randomEmoji };
    } else {
      const message = nightGreetings[Math.floor(Math.random() * nightGreetings.length)];
      return { text: 'Good night', icon: Moon, message, emoji: randomEmoji };
    }
  };

  const GreetingIcon = greeting?.icon || Sunrise;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!greeting) return null;

  return (
    <div className="min-h-screen">
      {/* Personalized Greeting */}
      <Card className="mb-4 sm:mb-6 lg:mb-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 lg:p-4 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
              <GreetingIcon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-1 sm:mb-2">
                {greeting.text}, {adminName}! {greeting.emoji}
              </h1>
              <p className="text-white/90 text-sm sm:text-base lg:text-lg">{greeting.message}</p>
            </div>
          </div>
          <div className="text-left lg:text-right w-full lg:w-auto">
            <div className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-1 sm:mb-2 font-mono">
              {formatTime(currentTime)}
            </div>
            <div className="text-white/90 text-xs sm:text-sm lg:text-lg">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full"></span>
          Quick Stats
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[
          {
            title: 'Total Revenue',
            value: loading ? 'Loading...' : formatPrice(stats.totalRevenue),
            change: stats.revenueGrowth,
            icon: DollarSign,
            color: 'bg-green-500',
          },
          {
            title: 'Total Orders',
            value: loading ? 'Loading...' : stats.totalOrders.toString(),
            change: stats.ordersGrowth,
            icon: ShoppingCart,
            color: 'bg-blue-500',
          },
          {
            title: 'Products',
            value: loading ? 'Loading...' : stats.totalProducts.toString(),
            change: stats.productsGrowth,
            icon: Package,
            color: 'bg-purple-500',
          },
          {
            title: 'Customers',
            value: loading ? 'Loading...' : stats.totalCustomers.toString(),
            change: stats.customersGrowth,
            icon: Users,
            color: 'bg-orange-500',
          },
          {
            title: 'Hub Members',
            value: loading ? 'Loading...' : stats.hubMembers.toString(),
            change: stats.hubGrowth,
            icon: Wallet,
            color: 'bg-emerald-500',
          },
          {
            title: 'Blog Posts',
            value: loading ? 'Loading...' : stats.blogPosts.toString(),
            change: stats.blogGrowth,
            icon: FileText,
            color: 'bg-pink-500',
          },
          {
            title: 'Active Promos',
            value: loading ? 'Loading...' : stats.activePromos.toString(),
            change: stats.promosGrowth,
            icon: Megaphone,
            color: 'bg-yellow-500',
          },
          {
            title: 'Avg Order Value',
            value: loading ? 'Loading...' : formatPrice(stats.avgOrderValue),
            change: stats.avgOrderGrowth,
            icon: TrendingUp,
            color: 'bg-indigo-500',
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 sm:p-5 lg:p-6 bg-white/60 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl hover:bg-white/70 transition-all duration-300">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-2.5 lg:p-3 rounded-xl ${stat.color} bg-opacity-20 backdrop-blur-sm shadow-lg`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-100/50 px-2 sm:px-3 py-1 rounded-full">{stat.change}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
            </Card>
          );
        })}
        </div>
      </div>

      {/* Super Admin Exclusive Stats */}
      {isSuperAdminUser && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-600 rounded-full"></span>
            <Shield className="h-5 w-5 text-emerald-600" />
            Super Admin Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Card className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-emerald-800 to-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <UserCog className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                <span className="text-xs sm:text-sm bg-white/20 px-2 sm:px-3 py-1 rounded-full">Active</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 mb-1">Total Admins</p>
              <p className="text-2xl sm:text-3xl font-bold">{loading ? '...' : adminCount}</p>
            </Card>

            <Card className="p-4 sm:p-5 lg:p-6 bg-white/60 backdrop-blur-lg border-2 border-emerald-800/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Activity className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-emerald-800" />
                <span className="text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-100/50 px-2 sm:px-3 py-1 rounded-full">Today</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">System Events</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-900">{loading ? '...' : systemEvents.toLocaleString()}</p>
            </Card>

            <Card className="p-4 sm:p-5 lg:p-6 bg-white/60 backdrop-blur-lg border-2 border-emerald-800/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Database className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-emerald-800" />
                <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-100/50 px-2 sm:px-3 py-1 rounded-full">Healthy</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Database Size</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-900">{loading ? '...' : databaseSize}</p>
            </Card>

            <Card className="p-4 sm:p-5 lg:p-6 bg-white/60 backdrop-blur-lg border-2 border-emerald-800/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-emerald-800" />
                <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-100/50 px-2 sm:px-3 py-1 rounded-full">
                  {systemUptime === '99.9%' ? '+15%' : `${parseFloat(systemUptime) > 99 ? '✓' : '⚠'}`}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">System Uptime</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-900">{loading ? '...' : systemUptime}</p>
            </Card>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full"></span>
          Analytics & Insights
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Revenue Chart - Takes 2 columns on desktop */}
        <Card className="lg:col-span-2 p-4 sm:p-6 lg:p-8 bg-white/40 backdrop-blur-xl border-2 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-1 sm:mb-2">📈 Revenue Overview</h2>
            <p className="text-xs sm:text-sm text-gray-600">Monthly revenue trend</p>
          </div>
          <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl sm:rounded-2xl p-2 sm:p-4 backdrop-blur-sm">
            <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value: number) => formatPrice(value)}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </Card>

        {/* Orders Chart - Takes 1 column on desktop */}
        <Card className="p-4 sm:p-6 lg:p-8 bg-white/40 backdrop-blur-xl border-2 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-1 sm:mb-2">📊 Orders</h2>
            <p className="text-xs sm:text-sm text-gray-600">By status</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl sm:rounded-2xl p-2 sm:p-4 backdrop-blur-sm">
            <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#3b82f6" />
                <Cell fill="#eab308" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </Card>
        </div>
      </div>

      {/* Recent Orders - Full Width */}
      <Card className="p-4 sm:p-6 lg:p-8 bg-white/40 backdrop-blur-xl border-2 border-white/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-1 sm:mb-2">🛒 Recent Orders</h2>
            <p className="text-xs sm:text-sm text-gray-600">Latest customer orders</p>
          </div>
          <a href="/orders" className="px-3 sm:px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-bold transition-colors">
            View All →
          </a>
        </div>
        <div className="bg-gradient-to-br from-gray-50/50 to-slate-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 backdrop-blur-sm">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading orders...</div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No orders yet</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 border-2 border-white/40 shadow-lg hover:shadow-xl hover:scale-105">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-900">{order.order_number}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{order.customer_name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                    <span className="text-sm font-bold text-primary">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
