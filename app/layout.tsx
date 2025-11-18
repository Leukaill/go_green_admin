import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LayoutContent } from "@/components/layout-content";
import { AuditProvider } from "@/lib/contexts/audit-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Go Green Rwanda - Admin Dashboard",
  description: "Manage your Go Green Rwanda store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuditProvider>
          <LayoutContent>{children}</LayoutContent>
          <Toaster position="top-right" />
        </AuditProvider>
      </body>
    </html>
  );
}
