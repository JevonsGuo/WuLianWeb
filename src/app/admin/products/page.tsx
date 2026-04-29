'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Product, ProductCategory, ProductAttachment } from '@/lib/types';
import { Plus, Pencil, Trash2, Upload, AlertCircle, X, FileText, Award, Paperclip } from 'lucide-react';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '', model: '', description: '', category_id: '',
    image_urls: [] as string[], main_image_url: '',
    summary_content: '', specifications_content: '',
    manual_url: '', certificate_url: '', sort_order: 0,
  });
  const [attachments, setAttachments] = useState<ProductAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'product-images');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, image_urls: [...f.image_urls, data.url] }));
      } else {
        setUploadError(data.error || '上传失败');
      }
    } catch {
      setUploadError('网络错误');
    }
    setUploading(false);
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setForm((f) => ({ ...f, image_urls: [...f.image_urls, url] }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setForm((f) => ({ ...f, image_urls: f.image_urls.filter((_, i) => i !== index) }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, bucket: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
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
        setUploadError(data.error || '上传失败');
      }
    } catch {
      setUploadError('网络错误');
    }
    setUploading(false);
  };

  // Attachment upload
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError('');
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'product-attachments');
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) {
          // Determine file type from name
          let fileType = 'other';
          const nameLower = file.name.toLowerCase();
          if (nameLower.includes('证书') || nameLower.includes('cert')) fileType = 'certificate';
          else if (nameLower.includes('手册') || nameLower.includes('manual')) fileType = 'manual';

          // Save to DB
          await supabase.from('product_attachments').insert({
            product_id: editing?.id || 'pending',
            file_name: file.name,
            file_url: data.url,
            file_type: fileType,
            file_size: file.size,
          });
        }
      } catch {
        setUploadError('附件上传失败');
      }
    }
    // Refresh attachments
    if (editing?.id) {
      const { data } = await supabase.from('product_attachments').select('*').eq('product_id', editing.id).order('sort_order');
      setAttachments(data || []);
    }
    setUploading(false);
  };

  const handleDeleteAttachment = async (attId: string) => {
    if (!confirm('确定删除该附件？')) return;
    await supabase.from('product_attachments').delete().eq('id', attId);
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name, model: form.model, description: form.description,
      category_id: form.category_id, image_urls: form.image_urls,
      main_image_url: form.main_image_url,
      summary_content: form.summary_content,
      specifications_content: form.specifications_content,
      manual_url: form.manual_url, certificate_url: form.certificate_url,
      sort_order: form.sort_order,
    };
    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing.id);
    } else {
      const { data } = await supabase.from('products').insert(payload).select();
      // Move pending attachments to the new product
      if (data && data[0]) {
        await supabase.from('product_attachments').update({ product_id: data[0].id }).eq('product_id', 'pending');
      }
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', model: '', description: '', category_id: '', image_urls: [], main_image_url: '', summary_content: '', specifications_content: '', manual_url: '', certificate_url: '', sort_order: 0 });
    setImageUrlInput('');
    setAttachments([]);
    fetchData();
  };

  const handleEdit = async (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, model: p.model, description: p.description || '',
      category_id: p.category_id, image_urls: p.image_urls || [],
      main_image_url: p.main_image_url || '',
      summary_content: p.summary_content || '',
      specifications_content: p.specifications_content || '',
      manual_url: p.manual_url || '', certificate_url: p.certificate_url || '',
      sort_order: p.sort_order,
    });
    setUploadError('');
    setImageUrlInput('');
    // Fetch attachments
    const { data } = await supabase.from('product_attachments').select('*').eq('product_id', p.id).order('sort_order');
    setAttachments(data || []);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该产品？')) return;
    await supabase.from('product_attachments').delete().eq('product_id', id);
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
            setForm({ name: '', model: '', description: '', category_id: categories[0]?.id || '', image_urls: [], main_image_url: '', summary_content: '', specifications_content: '', manual_url: '', certificate_url: '', sort_order: 0 });
            setUploadError('');
            setImageUrlInput('');
            setAttachments([]);
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus size={16} /><span>新增产品</span>
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="all">所有大类</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl mb-8">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">产品简介</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* 产品图片（多图） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  产品图片 <span className="text-gray-400 font-normal">（多张）</span>
                </label>
                {form.image_urls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.image_urls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt={`图片 ${idx + 1}`} className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                        <button type="button" onClick={() => handleRemoveImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input type="text" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); } }}
                    placeholder="输入图片 URL 回车添加" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={handleAddImageUrl} disabled={!imageUrlInput.trim()}
                    className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50 shrink-0">添加</button>
                  <label className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 text-sm shrink-0">
                    <Upload size={14} /><span>{uploading ? '上传中...' : '上传'}</span>
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* 详情主图 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">详情页主图</label>
                <div className="flex items-center space-x-2">
                  <input type="text" value={form.main_image_url} onChange={(e) => setForm((f) => ({ ...f, main_image_url: e.target.value }))}
                    placeholder="输入 URL 或上传" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  <label className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 text-sm shrink-0">
                    <Upload size={14} /><span>上传</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'main_image_url', 'product-images')} className="hidden" />
                  </label>
                </div>
                {form.main_image_url && (
                  <img src={form.main_image_url} alt="主图预览" className="mt-2 w-24 h-24 rounded-lg object-cover border border-gray-200" />
                )}
              </div>

              {/* 产品概要 - 富文本 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">产品概要</label>
                <RichTextEditor
                  value={form.summary_content}
                  onChange={(val: string) => setForm((f) => ({ ...f, summary_content: val }))}
                  placeholder="输入产品概要介绍..."
                />
              </div>

              {/* 主要参数 - 富文本 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">主要参数</label>
                <RichTextEditor
                  value={form.specifications_content}
                  onChange={(val: string) => setForm((f) => ({ ...f, specifications_content: val }))}
                  placeholder="输入产品技术参数..."
                />
              </div>

              {/* 产品手册 & 证书 */}
              <div className="grid grid-cols-2 gap-4">
                {(['manual_url', 'certificate_url'] as const).map((field) => {
                  const labels = { manual_url: '产品手册', certificate_url: '证书文件' };
                  const buckets = { manual_url: 'documents', certificate_url: 'documents' };
                  return (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{labels[field]}</label>
                      <div className="flex items-center space-x-2">
                        <input type="text" value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                          placeholder="URL 或上传" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        <label className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 text-sm shrink-0">
                          <Upload size={14} />
                          <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, field, buckets[field])} className="hidden" />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 附件管理 */}
              {editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">证书与附件</label>
                  {attachments.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {attachments.map((att) => (
                        <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2 min-w-0">
                            {att.file_type === 'certificate' ? <Award size={14} className="text-green-500" /> :
                             att.file_type === 'manual' ? <FileText size={14} className="text-blue-500" /> :
                             <Paperclip size={14} className="text-gray-500" />}
                            <span className="text-sm truncate">{att.file_name}</span>
                            <span className="text-xs text-gray-400 px-1 py-0.5 bg-gray-200 rounded">
                              {att.file_type === 'certificate' ? '证书' : att.file_type === 'manual' ? '手册' : '附件'}
                            </span>
                          </div>
                          <button onClick={() => handleDeleteAttachment(att.id)} className="p-1 text-gray-400 hover:text-red-600 shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 text-sm w-fit">
                    <Upload size={14} /><span>{uploading ? '上传中...' : '添加附件'}</span>
                    <input type="file" multiple accept=".pdf,.zip,.rar,.jpg,.png" onChange={handleAttachmentUpload} className="hidden" />
                  </label>
                </div>
              )}

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
              <button onClick={() => { setShowForm(false); setEditing(null); setUploadError(''); setAttachments([]); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">取消</button>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">图片</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">名称</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">型号</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">所属大类</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">排序</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">加载中...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">暂无数据</td></tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      {p.image_urls && p.image_urls.length > 0 ? (
                        <div className="relative">
                          <img src={p.image_urls[0]} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                          {p.image_urls.length > 1 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center">
                              {p.image_urls.length}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">无图</div>
                      )}
                    </td>
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
