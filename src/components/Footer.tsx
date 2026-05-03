'use client';

import { useEffect, useState } from 'react';
import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((result) => {
        if (result.data) setSettings(result.data);
      })
      .finally(() => setLoaded(true));
  }, []);

  const email = loaded ? (settings.contact_email || 'contact@wulian-tech.com') : '';
  const addressParts = [settings.contact_address, settings.contact_address_detail].filter(Boolean);
  const address = loaded ? (addressParts.length > 0 ? addressParts.join(' ') : '上海市浦东新区张江高科 博云路2号浦软大厦 18F') : '';

  return (
    <footer className="bg-surface-900 text-surface-400 mt-auto">
      <div className="h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">物</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">物联智造</span>
            </div>
            <p className="text-sm leading-relaxed text-surface-400">
              专业的工业物联网设备与解决方案提供商，致力于为制造业数字化转型提供核心硬件与系统支撑。
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">快速链接</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/" className="hover:text-brand-300 transition-colors duration-200">首页</a></li>
              <li><a href="/products" className="hover:text-brand-300 transition-colors duration-200">产品中心</a></li>
              <li><a href="/solutions" className="hover:text-brand-300 transition-colors duration-200">解决方案</a></li>
              <li><a href="/contact" className="hover:text-brand-300 transition-colors duration-200">联系我们</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">联系我们</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail size={14} className="text-brand-400 shrink-0" />
                <span>{email}</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={14} className="text-brand-400 shrink-0" />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-800 mt-10 pt-8 text-center text-xs text-surface-500">
          <p>© 2024 物联智造科技有限公司 版权所有</p>
        </div>
      </div>
    </footer>
  );
}
