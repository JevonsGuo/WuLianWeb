'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductCategory } from '@/lib/types';
import { Plus, Pencil, Trash2, Upload, AlertCircle } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', image_url: '', sort_order: 0 });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchCategories = useCallback(async () => {
    const res = await fetch('/api/admin/categories');
    const json = await res.json();
    setCategories(json.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'product-images');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((f) => ({ ...f, image_url: data.url }));
      } else {
        setUploadError(data.error || '上传失败，请先在 Supabase Storage 中创建 product-images bucket（设为 Public）');
      }
    } catch {
      setUploadError('网络错误，上传失败');
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { name: form.name, image_url: form.image_url, sort_order: form.sort_order };
      let res: Response;
      if (editing) {
        res = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
      } else {
        res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '保存失败');
      } else {
        setShowForm(false);
        setEditing(null);
        setForm({ name: '', image_url: '', sort_order: 0 });
        fetchCategories();
      }
    } catch {
      alert('网络错误，保存失败');
    }
    setSaving(false);
  };

  const handleEdit = (cat: ProductCategory) => {
    setEditing(cat);
    setForm({ name: cat.name, image_url: cat.image_url || '', sort_order: cat.sort_order });
    setUploadError('');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('删除大类将同时删除其下所有产品，确定删除？')) return;
    const res = await fetch('/api/admin/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || '删除失败');
    }
    fetchCategories();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">产品大类管理</h1>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: '', image_url: '', sort_order: 0 });
            setUploadError('');
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus size={16} />
          <span>新增大类</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editing ? '编辑大类' : '新增大类'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图片</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => { setForm((f) => ({ ...f, image_url: e.target.value })); setUploadError(''); }}
                    placeholder="输入图片 URL 或点击上传"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <label className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 text-sm shrink-0">
                    <Upload size={14} />
                    <span>{uploading ? '上传中...' : '上传'}</span>
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                </div>
                {uploadError && (
                  <div className="flex items-start space-x-1 mt-2 text-red-600 text-xs">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}
                {form.image_url && (
                  <div className="mt-2">
                    <img src={form.image_url} alt="预览" className="w-20 h-20 rounded-lg object-cover border border-gray-200" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => { setShowForm(false); setEditing(null); setUploadError(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">名称</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">图片</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">排序</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">加载中...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">暂无数据</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.name}</td>
                  <td className="px-6 py-4">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt="" className="w-10 h-10 rounded object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-gray-400 text-sm">无</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cat.sort_order}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
