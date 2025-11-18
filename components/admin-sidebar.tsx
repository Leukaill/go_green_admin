'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderTree, 
  FileText, 
  Megaphone, 
  ShoppingCart, 
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCog,
  Database,
  Activity,
  Lock,
  BarChart3,
  LogOut,
  MessageCircle,
  Menu,
  X
} from 'lucide-react';
import { HubIconAnimated } from '@/components/icons/hub-icon';
import { cn } from '@/lib/utils';
import { isSuperAdmin, logoutAdmin, clearAdminRole } from '@/lib/auth';
import { toast } from 'sonner';

const adminNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: ShoppingBag },
  { name: 'Categories', href: '/categories', icon: FolderTree },
  { name: 'Go Hub', href: '/hub', icon: HubIconAnimated },
  { name: 'Blog Posts', href: '/blog', icon: FileText },
  { name: 'Promotions', href: '/promotions', icon: Megaphone },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'WhatsApp Chat', href: '/whatsapp-settings', icon: MessageCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const superAdminNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: ShoppingBag },
  { name: 'Categories', href: '/categories', icon: FolderTree },
  { name: 'Go Hub', href: '/hub', icon: HubIconAnimated },
  { name: 'Blog Posts', href: '/blog', icon: FileText },
  { name: 'Promotions', href: '/promotions', icon: Megaphone },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'WhatsApp Chat', href: '/whatsapp-settings', icon: MessageCircle },
  { name: 'Admin Management', href: '/admin-management', icon: UserCog, superAdminOnly: true },
  { name: 'System Settings', href: '/system-settings', icon: Database, superAdminOnly: true },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, superAdminOnly: true },
  { name: 'Audit Logs', href: '/audit-logs', icon: Activity, superAdminOnly: true },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);

  useEffect(() => {
    setIsSuperAdminUser(isSuperAdmin());
  }, []);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logoutAdmin();
      clearAdminRole();
      toast.success('Logged out successfully!');
      router.push('/login');
    }
  };

  const navigation = isSuperAdminUser ? superAdminNavigation : adminNavigation;
  const bgColor = isSuperAdminUser ? 'bg-gradient-to-b from-emerald-900 to-green-900' : 'bg-white';
  const borderColor = isSuperAdminUser ? 'border-emerald-800' : 'border-gray-200';
  const textColor = isSuperAdminUser ? 'text-emerald-50' : 'text-gray-900';

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className={cn(
        "lg:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 border-b z-40",
        bgColor,
        borderColor
      )}>
        <div className="flex items-center gap-2">
          <Image
            src="/go-green-logo-no-background.jpg"
            alt="Go Green Rwanda"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className={cn("font-bold text-lg", textColor)}>Go Green</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isSuperAdminUser 
              ? "hover:bg-emerald-800/50 text-emerald-50" 
              : "hover:bg-gray-100 text-gray-900"
          )}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-16"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <div className={cn(
        "border-r flex flex-col transition-all duration-300 z-50",
        bgColor,
        borderColor,
        // Mobile Drawer
        "fixed top-16 left-0 bottom-0 w-64",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop
        "lg:relative lg:top-0 lg:translate-x-0",
        isCollapsed ? "lg:w-20" : "lg:w-64"
      )}>
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center justify-between px-4 border-b",
        isSuperAdminUser ? "border-emerald-800" : "border-gray-200"
      )}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-10 w-10 flex-shrink-0">
            <Image
              src="/go-green-logo-no-background.jpg"
              alt="Go Green Rwanda"
              width={40}
              height={40}
              className="object-contain"
              unoptimized
            />
          </div>
          {!isCollapsed && (
            <div className="whitespace-nowrap">
              <h1 className={cn(
                "text-lg font-bold",
                isSuperAdminUser ? "text-white" : "text-gray-900"
              )}>
                Go Green
              </h1>
              <p className={cn(
                "text-xs flex items-center gap-1",
                isSuperAdminUser ? "text-emerald-200" : "text-gray-500"
              )}>
                {isSuperAdminUser && <Shield className="h-3 w-3" />}
                {isSuperAdminUser ? "Super Admin" : "Admin Panel"}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-1.5 rounded-lg transition-colors flex-shrink-0",
            isSuperAdminUser ? "hover:bg-emerald-800" : "hover:bg-gray-100"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className={cn("h-5 w-5", isSuperAdminUser ? "text-emerald-200" : "text-gray-600")} />
          ) : (
            <ChevronLeft className={cn("h-5 w-5", isSuperAdminUser ? "text-emerald-200" : "text-gray-600")} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item: any) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isSuperAdminItem = item.superAdminOnly;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative group',
                isActive
                  ? isSuperAdminUser 
                    ? 'bg-emerald-800 text-white shadow-lg' 
                    : 'bg-primary text-white'
                  : isSuperAdminUser
                    ? 'text-emerald-100 hover:bg-emerald-800/50'
                    : 'text-gray-700 hover:bg-gray-100',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.name : ''}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="flex items-center gap-2">
                  {item.name}
                  {isSuperAdminItem && (
                    <Shield className="h-3 w-3 text-emerald-300" />
                  )}
                </span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className={cn(
                  "absolute left-full ml-2 px-3 py-2 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50",
                  isSuperAdminUser ? "bg-emerald-800" : "bg-gray-900"
                )}>
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className={cn(
        "p-4 border-t space-y-2",
        isSuperAdminUser ? "border-emerald-800" : "border-gray-200"
      )}>
        {/* User Info */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg",
          isSuperAdminUser ? "bg-emerald-800/50" : "bg-gray-50",
          isCollapsed && "justify-center"
        )}>
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0",
            isSuperAdminUser ? "bg-emerald-700 ring-2 ring-emerald-500" : "bg-primary"
          )}>
            {isSuperAdminUser ? <Shield className="h-5 w-5" /> : "A"}
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className={cn(
                "text-sm font-medium",
                isSuperAdminUser ? "text-white" : "text-gray-900"
              )}>
                {isSuperAdminUser ? "Super Admin" : "Admin User"}
              </p>
              <p className={cn(
                "text-xs",
                isSuperAdminUser ? "text-emerald-200" : "text-gray-500"
              )}>
                {isSuperAdminUser ? "Full Access" : "admin@gogreen.rw"}
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group",
            isSuperAdminUser 
              ? "text-red-200 hover:bg-red-900/50 hover:text-white" 
              : "text-red-600 hover:bg-red-50",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className={cn(
              "absolute left-full ml-2 px-3 py-2 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50",
              "bg-red-600"
            )}>
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
    </>
  );
}
