'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin-sidebar';
import { AuthProvider } from '@/components/auth-provider';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <AuthProvider>
      {isLoginPage ? (
        <>{children}</>
      ) : (
        <div className="flex h-screen overflow-hidden">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30 pt-16 lg:pt-0">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      )}
    </AuthProvider>
  );
}
