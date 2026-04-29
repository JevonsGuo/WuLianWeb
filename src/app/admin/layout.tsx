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
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }
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
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-spin w-8 h-8 border-[3px] border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-surface-200/60 transform transition-transform md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-surface-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-sm">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <span className="font-bold text-surface-900 text-sm">管理后台</span>
          </div>
          <button className="md:hidden p-1 hover:bg-surface-100 rounded-lg" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav className="py-3 px-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 ${
                  active
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-800'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} className={active ? 'text-brand-500' : ''} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-100">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2.5 text-sm text-surface-500 hover:text-red-600 transition-colors w-full px-3 py-2.5 rounded-xl hover:bg-red-50"
          >
            <LogOut size={16} />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-60">
        <header className="h-14 bg-white border-b border-surface-200/60 flex items-center px-6">
          <button
            className="md:hidden mr-3 p-1 hover:bg-surface-100 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
          <Link
            href="/"
            className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
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
