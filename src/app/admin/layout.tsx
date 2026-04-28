'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Tag, Box, Lightbulb, LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { href: '/admin/categories', label: '产品大类', icon: Tag },
  { href: '/admin/products', label: '产品管理', icon: Box },
  { href: '/admin/solutions', label: '解决方案', icon: Lightbulb },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }
    // Check auth
    fetch('/api/admin/check')
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
        } else {
          router.push('/admin/login');
        }
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <LayoutDashboard size={20} className="text-blue-600" />
            <span className="font-bold text-gray-900">管理后台</span>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors ${
                  active
                    ? 'text-blue-700 bg-blue-50 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full px-2 py-2"
          >
            <LogOut size={16} />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <button
            className="md:hidden mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline"
            target="_blank"
          >
            查看前台网站 →
          </Link>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
