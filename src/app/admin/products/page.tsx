'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Product, ProductCategory } from '@/lib/types';
import { Plus, Pencil, Trash2, Upload, AlertCircle } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '', model: '', description: '', category_id: '',
    image_url: '', manual_url: '', certificate_url: '', sort_order: 0,
  });
  const [uploading, setUploading] = useState<string>('');
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*').order('sort_order'),
      supabase.from('product_categories').select('*').order('sort_order'),
    ]);
    setProducts(productsRes.data || []);
    setCategories(categoriesRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredProducts = filterCategory === 'all'
    ? products
    : products.filter((p) => p.category_id === filterCategory);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, bucket: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    setUploadError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, [field]: data.url }));
      } else {
        setUploadError(data.error || `上传失败，请先在 Supabase Storage 中创建 ${bucket} bucket（设为 Public）`);
      }
    } catch {
      setUploadError('网络错误，上传失败');
    }
    setUploading('');
  };

  const handleSave = async () => {
    setSaving(true);
    if (editing) {
      await supabase.from('products').update(form).eq('id', editing.id);
    } else {
      await supabase.from('products').insert(form);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', model: '', description: '', category_id: '', image_url: '', manual_url: '', certificate_url: '', sort_order: 0 });
    fetchData();
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, model: p.model, description: p.description || '',
      category_id: p.category_id, image_url: p.image_url || '',
      manual_url: p.manual_url || '', certificate_url: p.certificate_url || '',
      sort_order: p.sort_order,
    });
    setUploadError('');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该产品？')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name || '-';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">产品管理</h1>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: '', model: '', description: '', category_id: categories[0]?.id || '', image_url: '', manual_url: '', certificate_url: '', sort_order: 0 });
            setUploadError('');
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus size={16} /><span>新增产品</span>
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">所有大类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editing ? '编辑产品' : '新增产品'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">产品名称 *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">型号 *</label>
                  <input type="text" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所属大类 *</label>
                <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">请选择</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">产品介绍</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {(['image_url', 'manual_url', 'certificate_url'] as const).map((field) => {
                const labels = { image_url: '产品图片', manual_url: '产品手册', certificate_url: '证书文件' };
                const buckets = { image_url: 'product-images', manual_url: 'documents', certificate_url: 'documents' };
                return (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{labels[field]}</label>
                    <div className="flex items-center space-x-2">
                      <input type="text" value={form[field]} onChange={(e) => { setForm((f) => ({ ...f, [field]: e.target.value })); setUploadError(''); }}
                        placeholder="输入 URL 或点击上传" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      <label className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 text-sm shrink-0">
                        <Upload size={14} />
                        <span>{uploading === field ? '上传中...' : '上传'}</span>
                        <input type="file" accept={field === 'image_url' ? 'image/*' : '.pdf'} onChange={(e) => handleUpload(e, field, buckets[field])} className="hidden" />
                      </label>
                    </div>
                    {field === 'image_url' && form.image_url && (
                      <div className="mt-2">
                        <img src={form.image_url} alt="预览" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                      </div>
                    )}
                  </div>
                );
              })}
              {uploadError && (
                <div className="flex items-start space-x-1 text-red-600 text-xs">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => { setShowForm(false); setEditing(null); setUploadError(''); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">取消</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.model || !form.category_id}
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">名称</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">型号</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">所属大类</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">排序</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">加载中...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">暂无数据</td></tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.model}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{categoryName(p.category_id)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.sort_order}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-blue-600"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
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
