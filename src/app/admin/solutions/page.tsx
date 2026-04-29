'use client';

import { useState, useEffect, useCallback } from 'react';
import { Solution } from '@/lib/types';
import { Plus, Pencil, Trash2, Upload, AlertCircle } from 'lucide-react';

interface ProductOption {
  id: string;
  name: string;
  model: string;
}

export default function SolutionsPage() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Solution | null>(null);
  const [form, setForm] = useState({
    industry_name: '', image_url: '', description: '',
    related_product_ids: [] as string[], sort_order: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [solutionsRes, productsRes] = await Promise.all([
      fetch('/api/admin/solutions').then((r) => r.json()),
      fetch('/api/admin/products').then((r) => r.json()),
    ]);
    setSolutions(solutionsRes.data || []);
    setProducts(productsRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'solution-images');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) setForm((f) => ({ ...f, image_url: data.url }));
      else setUploadError(data.error || '上传失败，请先在 Supabase Storage 中创建 solution-images bucket（设为 Public）');
    } catch {
      setUploadError('网络错误，上传失败');
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        industry_name: form.industry_name,
        image_url: form.image_url,
        description: form.description,
        related_product_ids: JSON.stringify(form.related_product_ids),
        sort_order: form.sort_order,
      };
      let res: Response;
      if (editing) {
        res = await fetch('/api/admin/solutions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
      } else {
        res = await fetch('/api/admin/solutions', {
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
        setForm({ industry_name: '', image_url: '', description: '', related_product_ids: [], sort_order: 0 });
        fetchData();
      }
    } catch {
      alert('网络错误，保存失败');
    }
    setSaving(false);
  };

  const handleEdit = (sol: Solution) => {
    setEditing(sol);
    setForm({
      industry_name: sol.industry_name,
      image_url: sol.image_url || '',
      description: sol.description || '',
      related_product_ids: sol.related_product_ids ? JSON.parse(sol.related_product_ids) : [],
      sort_order: sol.sort_order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该解决方案？')) return;
    const res = await fetch('/api/admin/solutions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || '删除失败');
    }
    fetchData();
  };

  const toggleProduct = (productId: string) => {
    setForm((f) => ({
      ...f,
      related_product_ids: f.related_product_ids.includes(productId)
        ? f.related_product_ids.filter((id) => id !== productId)
        : [...f.related_product_ids, productId],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">解决方案管理</h1>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ industry_name: '', image_url: '', description: '', related_product_ids: [], sort_order: 0 });
            setUploadError('');
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus size={16} /><span>新增解决方案</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editing ? '编辑解决方案' : '新增解决方案'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">行业名称 *</label>
                <input type="text" value={form.industry_name} onChange={(e) => setForm((f) => ({ ...f, industry_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">行业图片</label>
                <div className="flex items-center space-x-2">
                  <input type="text" value={form.image_url} onChange={(e) => { setForm((f) => ({ ...f, image_url: e.target.value })); setUploadError(''); }}
                    placeholder="输入图片 URL 或点击上传" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
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
                    <img src={form.image_url} alt="预览" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联产品</label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                  {products.length === 0 ? (
                    <p className="text-sm text-gray-400 p-2">暂无产品，请先添加产品</p>
                  ) : (
                    products.map((p) => (
                      <label key={p.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.related_product_ids.includes(p.id)}
                          onChange={() => toggleProduct(p.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{p.name}（{p.model}）</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">取消</button>
              <button onClick={handleSave} disabled={saving || !form.industry_name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">行业名称</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">描述</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">排序</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">加载中...</td></tr>
              ) : solutions.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">暂无数据</td></tr>
              ) : (
                solutions.map((sol) => (
                  <tr key={sol.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{sol.industry_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{sol.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sol.sort_order}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(sol)} className="p-2 text-gray-400 hover:text-blue-600"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(sol.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
