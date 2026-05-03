'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Phone, Mail, MapPin, Clock, Save, AlertCircle } from 'lucide-react';

interface SettingItem {
  key: string;
  value: string;
  label: string;
  group: string;
  sort_order: number;
}

const contactFields: { key: string; label: string; placeholder: string }[] = [
  { key: 'contact_phone', label: '咨询电话', placeholder: '400-888-6688' },
  { key: 'contact_phone_note', label: '电话备注', placeholder: '工作日 9:00 - 18:00' },
  { key: 'contact_email', label: '联系邮箱', placeholder: 'contact@wulian-tech.com' },
  { key: 'contact_email_note', label: '邮箱备注', placeholder: '我们将在 24 小时内回复' },
  { key: 'contact_address', label: '公司地址', placeholder: '上海市浦东新区张江高科' },
  { key: 'contact_address_detail', label: '地址详情', placeholder: '博云路2号浦软大厦 18F' },
  { key: 'contact_work_time', label: '工作时间', placeholder: '周一至周五 9:00 - 18:00' },
  { key: 'contact_work_time_note', label: '工作时间备注', placeholder: '法定节假日除外' },
  { key: 'contact_form_email', label: '表单接收邮箱', placeholder: '接收联系表单的邮箱地址' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = useCallback(async () => {
    const res = await fetch('/api/admin/settings');
    const result = await res.json();
    const map: Record<string, string> = {};
    for (const item of (result.data || []) as SettingItem[]) {
      map[item.key] = item.value;
    }
    setSettings(map);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const updates = contactFields.map((f) => ({
        key: f.key,
        value: settings[f.key] || '',
      }));

      for (const item of updates) {
        const res = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || '保存失败');
        }
      }
      setMessage({ type: 'success', text: '设置保存成功' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">网站设置</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <Phone size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">联系我们</h2>
              <p className="text-xs text-gray-500">设置前台联系页面显示的信息及表单接收邮箱</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {message && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg text-sm ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                <AlertCircle size={16} />
                <span>{message.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone size={14} className="inline mr-1 -mt-0.5" />
                  {contactFields[0].label}
                </label>
                <input
                  type="text"
                  value={settings[contactFields[0].key] || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, [contactFields[0].key]: e.target.value }))}
                  placeholder={contactFields[0].placeholder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{contactFields[1].label}</label>
                <input
                  type="text"
                  value={settings[contactFields[1].key] || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, [contactFields[1].key]: e.target.value }))}
                  placeholder={contactFields[1].placeholder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail size={14} className="inline mr-1 -mt-0.5" />
                  {contactFields[2].label}
                </label>
                <input
                  type="email"
                  value={settings[contactFields[2].key] || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, [contactFields[2].key]: e.target.value }))}
                  placeholder={contactFields[2].placeholder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{contactFields[3].label}</label>
                <input
                  type="text"
                  value={settings[contactFields[3].key] || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, [contactFields[3].key]: e.target.value }))}
                  placeholder={contactFields[3].placeholder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin size={14} className="inline mr-1 -mt-0.5" />
                  {contactFields[4].label}
                </label>
                <input
                  type="text"
                  value={settings[contactFields[4].key] || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, [contactFields[4].key]: e.target.value }))}
                  placeholder={contactFields[4].placeholder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{contactFields[5].label}</label>
                <input
                  type="text"
                  value={settings[contactFields[5].key] || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, [contactFields[5].key]: e.target.value }))}
                  placeholder={contactFields[5].placeholder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock size={14} className="inline mr-1 -mt-0.5" />
                  {contactFields[6].label}
                </label>
                <input
                  type="text"
                  value={settings[contactFields[6].key] || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, [contactFields[6].key]: e.target.value }))}
                  placeholder={contactFields[6].placeholder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{contactFields[7].label}</label>
                <input
                  type="text"
                  value={settings[contactFields[7].key] || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, [contactFields[7].key]: e.target.value }))}
                  placeholder={contactFields[7].placeholder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail size={14} className="inline mr-1 -mt-0.5 text-orange-500" />
                  {contactFields[8].label}
                  <span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  value={settings[contactFields[8].key] || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, [contactFields[8].key]: e.target.value }))}
                  placeholder={contactFields[8].placeholder}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50/30"
                />
                <p className="text-xs text-gray-400 mt-1">前台"发送消息"表单提交后，邮件将发送到此邮箱</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save size={16} />
              <span>{saving ? '保存中...' : '保存设置'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
