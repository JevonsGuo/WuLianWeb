'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, ProductCategory, ProductAttachment } from '@/lib/types';
import {
  Plus, Pencil, Trash2, Upload, AlertCircle, X,
  FileText, Award, Paperclip, Package, Save,
  ChevronLeft, ImagePlus, Link2, ExternalLink, Search
} from 'lucide-react';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

type TabKey = 'summary' | 'specs' | 'attachments';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
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
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pendingAttachments, setPendingAttachments] = useState<Array<{ file_name: string; file_url: string; file_type: string; file_size: number; description: string }>>([]);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachModalFile, setAttachModalFile] = useState<File | null>(null);
  const [attachModalType, setAttachModalType] = useState<string>('other');
  const [attachModalDesc, setAttachModalDesc] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products').then((r) => r.json()),
        fetch('/api/admin/categories').then((r) => r.json()),
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch {
      setProducts([]);
      setCategories([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredProducts = (filterCategory === 'all'
    ? products
    : products.filter((p) => p.category_id === filterCategory)
  ).filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return p.name.toLowerCase().includes(q) || p.model.toLowerCase().includes(q);
  });

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
        setForm((f) => ({ ...f, image_urls: [...f.image_urls, data.url] }));
      } else {
        setUploadError(data.error || '上传失败' + (data.debug ? ` (${data.debug})` : ''));
      }
    } catch (err) {
      setUploadError('网络错误: ' + (err instanceof Error ? err.message : String(err)));
    }
    setUploading(false);
  };

  const handleCarouselUploadClick = useCallback(() => {
    if (uploading) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      handleUpload(e as unknown as React.ChangeEvent<HTMLInputElement>);
      input.remove();
    };
    document.body.appendChild(input);
    input.click();
  }, [uploading, handleUpload]);

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setForm((f) => ({ ...f, image_urls: [...f.image_urls, url] }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setForm((f) => ({ ...f, image_urls: f.image_urls.filter((_, i) => i !== index) }));
  };

  const handleAttachmentUpload = async () => {
    if (!attachModalFile) return;
    setUploading(true);
    setUploadError('');
    const isNewProduct = editing?.id === '__new__';
    const formData = new FormData();
    formData.append('file', attachModalFile);
    formData.append('bucket', 'product-attachments');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setUploadError(data.error || '文件上传失败');
        setUploading(false);
        setShowAttachModal(false);
        setAttachModalFile(null);
        setAttachModalType('other');
        setAttachModalDesc('');
        return;
      }
      if (isNewProduct) {
        setPendingAttachments((prev) => [...prev, { file_name: attachModalFile.name, file_url: data.url, file_type: attachModalType, file_size: attachModalFile.size, description: attachModalDesc }]);
      } else {
        const payload: Record<string, unknown> = {
          product_id: editing?.id,
          file_name: attachModalFile.name,
          file_url: data.url,
          file_type: attachModalType,
          file_size: attachModalFile.size,
          description: attachModalDesc || '',
        };
        let attRes = await fetch('/api/admin/attachments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!attRes.ok) {
          delete payload.description;
          attRes = await fetch('/api/admin/attachments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }
        if (!attRes.ok) {
          const attData = await attRes.json();
          setUploadError(attData.error || '附件保存失败');
          setUploading(false);
          setShowAttachModal(false);
          setAttachModalFile(null);
          setAttachModalType('other');
          setAttachModalDesc('');
          return;
        }
        const listRes = await fetch(`/api/admin/attachments?product_id=${editing!.id}`);
        const listData = await listRes.json();
        setAttachments(listData.data || []);
      }
    } catch {
      setUploadError('附件上传失败');
    }
    setUploading(false);
    setShowAttachModal(false);
    setAttachModalFile(null);
    setAttachModalType('other');
    setAttachModalDesc('');
  };

  const handleDeleteAttachment = async (attId: string) => {
    if (!confirm('确定删除该附件？')) return;
    await fetch('/api/admin/attachments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: attId }),
    });
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const handleSave = async () => {
    if (!form.name || !form.model || !form.category_id) return;
    setSaving(true);
    setSaveError('');
    const payload = {
      name: form.name, model: form.model, description: form.description,
      category_id: form.category_id, image_urls: form.image_urls,
      main_image_url: form.main_image_url,
      summary_content: form.summary_content,
      specifications_content: form.specifications_content,
      manual_url: form.manual_url, certificate_url: form.certificate_url,
      sort_order: form.sort_order,
    };
    try {
      if (editing && editing.id !== '__new__') {
        const res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) { setSaveError(data.error || '保存失败'); setSaving(false); return; }
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) { setSaveError(data.error || '保存失败'); setSaving(false); return; }
        if (data.data?.id && pendingAttachments.length > 0) {
          for (const att of pendingAttachments) {
            await fetch('/api/admin/attachments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product_id: data.data.id,
                file_name: att.file_name,
                file_url: att.file_url,
                file_type: att.file_type,
                file_size: att.file_size,
                description: att.description,
              }),
            });
          }
        }
      }
    } catch {
      setSaveError('网络错误，请重试');
      setSaving(false);
      return;
    }
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    setEditing(null);
    setForm({ name: '', model: '', description: '', category_id: '', image_urls: [], main_image_url: '', summary_content: '', specifications_content: '', manual_url: '', certificate_url: '', sort_order: 0 });
    setImageUrlInput('');
    setAttachments([]);
    setActiveTab('summary');
    setCurrentImageIndex(0);
    setPendingAttachments([]);
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
    setActiveTab('summary');
    setCurrentImageIndex(0);
    const res = await fetch(`/api/admin/attachments?product_id=${p.id}`);
    const attData = await res.json();
    setAttachments(attData.data || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该产品？')) return;
    await fetch('/api/admin/attachments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id }),
    });
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ name: '', model: '', description: '', category_id: '', image_urls: [], main_image_url: '', summary_content: '', specifications_content: '', manual_url: '', certificate_url: '', sort_order: 0 });
    setUploadError('');
    setImageUrlInput('');
    setAttachments([]);
    setActiveTab('summary');
    setCurrentImageIndex(0);
    setPendingAttachments([]);
  };

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name || '-';

  const isEditing = editing !== null;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'summary', label: '产品概要', icon: <FileText size={14} /> },
    { key: 'specs', label: '主要参数', icon: <Award size={14} /> },
    { key: 'attachments', label: '证书与附件', icon: <Paperclip size={14} /> },
  ];

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ==================== Editing Mode ====================
  if (isEditing) {
    const images = form.image_urls;

    return (
      <div className="h-[calc(100vh-64px)] flex flex-col bg-white rounded-2xl shadow-card animate-fade-in mx-4 my-4 overflow-hidden">
        {/* Top bar */}
        <div className="relative flex items-center justify-between px-6 py-3 border-b border-surface-200/60 bg-surface-50/50">
          <div className="flex items-center space-x-3">
            <button onClick={handleCancel} className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors">
              <ChevronLeft size={18} className="text-surface-500" />
            </button>
            <h2 className="text-sm font-semibold text-surface-900">
              {editing ? '编辑产品' : '新增产品'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-1.5 text-sm text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.model || !form.category_id}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              <Save size={14} />
              <span>{saving ? '保存中...' : '保存'}</span>
            </button>
          </div>
          {saveError && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs whitespace-nowrap">
              <AlertCircle size={12} />
              <span>{saveError}</span>
            </div>
          )}
        </div>

        {/* Main editing area - mirrors the frontend detail layout */}
        <div className="flex-1 overflow-y-auto">
          {/* Top: Image + Basic Info (same layout as ProductDetail) */}
          <div className="flex gap-8 p-8 border-b border-surface-100">
            {/* Image area */}
            <div className="shrink-0">
              <div className="w-[300px] h-[300px] bg-surface-50 rounded-2xl overflow-hidden relative group ring-1 ring-surface-200/60">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentImageIndex]}
                      alt="产品图片"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <ChevronLeft size={16} className="text-surface-600" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((i) => (i + 1) % images.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <ChevronLeft size={16} className="text-surface-600 rotate-180" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`rounded-full transition-all duration-200 ${
                                idx === currentImageIndex ? 'bg-white w-5 h-1.5' : 'bg-white/50 w-1.5 h-1.5 hover:bg-white/80'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={48} className="text-surface-200" />
                  </div>
                )}
              </div>

              {/* Thumbnail strip with add/remove */}
              <div className="flex gap-2 mt-3 px-0.5 overflow-x-auto pb-1 items-center">
                {images.map((url, idx) => (
                  <div key={idx} className="relative shrink-0 group/thumb">
                    <button
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden ring-2 transition-all duration-200 ${
                        idx === currentImageIndex ? 'ring-brand-400 shadow-sm' : 'ring-surface-200 opacity-60 hover:opacity-80'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-sm"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {/* Add image button */}
                {uploading ? (
                  <div className="shrink-0 w-14 h-14 rounded-xl border-2 border-dashed border-brand-400 flex items-center justify-center bg-brand-50">
                    <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCarouselUploadClick}
                    className="shrink-0 w-14 h-14 rounded-xl border-2 border-dashed border-surface-300 flex items-center justify-center hover:border-brand-400 hover:bg-brand-50/30 transition-colors"
                  >
                    <ImagePlus size={18} className="text-surface-400" />
                  </button>
                )}
              </div>

              {/* URL input */}
              <div className="flex items-center space-x-1.5 mt-2">
                <div className="relative flex-1">
                  <Link2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-300" />
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); } }}
                    placeholder="图片 URL"
                    className="w-full pl-7 pr-2 py-1.5 border border-surface-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                  />
                </div>
                <button
                  onClick={handleAddImageUrl}
                  disabled={!imageUrlInput.trim()}
                  className="px-2 py-1.5 bg-surface-100 rounded-lg text-xs hover:bg-surface-200 disabled:opacity-50 transition-colors shrink-0"
                >
                  添加
                </button>
              </div>
            </div>

            {/* Basic info editing (mirrors the right side of ProductDetail) */}
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">产品名称 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="输入产品名称"
                  className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-shadow"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-surface-500 mb-1.5">型号 *</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                    placeholder="输入型号"
                    className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-shadow"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-surface-500 mb-1.5">排序</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-shadow"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">所属大类 *</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-shadow bg-white"
                >
                  <option value="">请选择</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">产品简介</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="简要描述产品特点..."
                  className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-shadow resize-none"
                />
              </div>
            </div>
          </div>

          {/* Tabbed content editing (mirrors the tab area of ProductDetail) */}
          <div className="flex flex-col">
            {/* Tab header */}
            <div className="flex px-8 border-b border-surface-100">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all duration-200 -mb-px ${
                    activeTab === tab.key
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-surface-400 hover:text-surface-600'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-8 animate-fade-in" key={activeTab}>
              {activeTab === 'summary' && (
                <div>
                  <RichTextEditor
                    value={form.summary_content}
                    onChange={(val: string) => setForm((f) => ({ ...f, summary_content: val }))}
                    placeholder="输入产品概要介绍..."
                  />
                </div>
              )}

              {activeTab === 'specs' && (
                <div>
                  <RichTextEditor
                    value={form.specifications_content}
                    onChange={(val: string) => setForm((f) => ({ ...f, specifications_content: val }))}
                    placeholder="输入产品技术参数..."
                  />
                </div>
              )}

              {activeTab === 'attachments' && (
                <div className="space-y-4">
                  {(attachments.length > 0 || pendingAttachments.length > 0) && (
                    <div className="overflow-hidden rounded-xl border border-surface-200/60">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-surface-50 border-b border-surface-200/60">
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-500 w-10"></th>
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-500 w-[600px]">文件名</th>
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-500 w-20">大小</th>
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-500">描述</th>
                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-surface-500 w-12"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {attachments.map((att) => (
                            <tr key={att.id} className="border-b border-surface-100 last:border-b-0 hover:bg-surface-50/50">
                              <td className="px-4 py-3">
                                {att.file_type === 'certificate' ? <Award size={16} className="text-emerald-500" /> :
                                 att.file_type === 'manual' ? <FileText size={16} className="text-brand-500" /> :
                                 <Paperclip size={16} className="text-surface-400" />}
                              </td>
                              <td className="px-4 py-3">
                                <a
                                  href={`/api/download?url=${encodeURIComponent(att.file_url)}&name=${encodeURIComponent(att.file_name)}`}
                                  className="text-surface-800 font-medium hover:text-brand-600 transition-colors break-all"
                                >
                                  {att.file_name}
                                </a>
                              </td>
                              <td className="px-4 py-3 text-surface-400 text-xs">{att.file_size ? formatFileSize(att.file_size) : '-'}</td>
                              <td className="px-4 py-3 text-surface-500 text-sm">{att.description || '-'}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleDeleteAttachment(att.id)}
                                  className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {pendingAttachments.map((att, idx) => (
                            <tr key={`pending-${idx}`} className="border-b border-surface-100 last:border-b-0 bg-amber-50/50">
                              <td className="px-4 py-3">
                                {att.file_type === 'certificate' ? <Award size={16} className="text-emerald-500" /> :
                                 att.file_type === 'manual' ? <FileText size={16} className="text-brand-500" /> :
                                 <Paperclip size={16} className="text-surface-400" />}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-surface-800 font-medium break-all">{att.file_name}</span>
                              </td>
                              <td className="px-4 py-3 text-surface-400 text-xs">{att.file_size ? formatFileSize(att.file_size) : '-'}</td>
                              <td className="px-4 py-3 text-surface-500 text-sm">{att.description || '-'}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => setPendingAttachments((prev) => prev.filter((_, i) => i !== idx))}
                                  className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setAttachModalFile(null);
                      setAttachModalType('other');
                      setAttachModalDesc('');
                      setShowAttachModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-3 bg-surface-50 border-2 border-dashed border-surface-200 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-colors w-fit"
                  >
                    <Upload size={16} className="text-surface-400" />
                    <span className="text-sm text-surface-600 font-medium">添加附件</span>
                  </button>
                </div>
              )}

              {showAttachModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAttachModal(false)}>
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold text-surface-900 mb-5">添加附件</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">选择文件</label>
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.pdf,.zip,.rar,.jpg,.png,.doc,.docx,.xls,.xlsx';
                            input.onchange = (e) => {
                              const f = (e.target as HTMLInputElement).files?.[0];
                              if (f) setAttachModalFile(f);
                              input.remove();
                            };
                            document.body.appendChild(input);
                            input.click();
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 border border-surface-200 rounded-xl text-sm hover:border-brand-400 transition-colors"
                        >
                          <span className={attachModalFile ? 'text-surface-800' : 'text-surface-400'}>
                            {attachModalFile ? attachModalFile.name : '点击选择文件...'}
                          </span>
                          <Upload size={16} className="text-surface-400 shrink-0" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">文件类型</label>
                        <div className="flex gap-2">
                          {[
                            { value: 'manual', label: '手册', icon: <FileText size={14} /> },
                            { value: 'certificate', label: '证书', icon: <Award size={14} /> },
                            { value: 'other', label: '其他', icon: <Paperclip size={14} /> },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setAttachModalType(opt.value)}
                              className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                                attachModalType === opt.value
                                  ? 'border-brand-400 bg-brand-50 text-brand-700'
                                  : 'border-surface-200 text-surface-500 hover:border-surface-300'
                              }`}
                            >
                              {opt.icon}
                              <span>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">文件描述</label>
                        <textarea
                          value={attachModalDesc}
                          onChange={(e) => setAttachModalDesc(e.target.value)}
                          placeholder="描述此文件的内容..."
                          rows={2}
                          className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-shadow resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowAttachModal(false)}
                        className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={handleAttachmentUpload}
                        disabled={!attachModalFile || uploading}
                        className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                      >
                        {uploading ? '上传中...' : '确认上传'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="flex items-start space-x-2 text-red-500 text-xs mt-4 p-3 bg-red-50 rounded-xl">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== List Mode ====================
  return (
    <div className="space-y-6">
      {saveSuccess && (
        <div className="flex items-center space-x-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium animate-fade-in">
          <Save size={16} />
          <span>保存成功</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">产品管理</h1>
          <p className="text-sm text-surface-500 mt-1">管理所有产品信息，编辑界面与前台展示一致</p>
        </div>
        <button
          onClick={() => {
            setEditing({ id: '__new__' } as any);
            setForm({ name: '', model: '', description: '', category_id: categories[0]?.id || '', image_urls: [], main_image_url: '', summary_content: '', specifications_content: '', manual_url: '', certificate_url: '', sort_order: 0 });
            setUploadError('');
            setImageUrlInput('');
            setAttachments([]);
            setActiveTab('summary');
            setCurrentImageIndex(0);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 text-sm font-medium shadow-sm shadow-brand-600/20 transition-colors"
        >
          <Plus size={16} /><span>新增产品</span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索产品名称或型号..."
            className="pl-9 pr-4 py-2 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/30 outline-none bg-white w-64"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3.5 py-2 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/30 outline-none bg-white"
        >
          <option value="all">所有大类</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Product cards grid */}
      {loading ? (
        <div className="text-center py-16 text-surface-400">加载中...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-surface-400">
          <Package size={40} className="mb-3 text-surface-200" />
          <p>暂无产品</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {filteredProducts.map((p) => {
            const thumb = p.image_urls?.[0] || p.main_image_url;
            return (
              <div
                key={p.id}
                className="group bg-white rounded-2xl border border-surface-200/80 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-brand-50 to-surface-50 overflow-hidden relative">
                  {thumb ? (
                    <img src={thumb} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-surface-200" />
                    </div>
                  )}
                  <a
                    href={`/products?category=${categories.find((c) => c.id === p.category_id)?.slug || ''}&product=${p.model || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/90 rounded-lg text-sm font-medium text-surface-700 shadow-sm">
                      <ExternalLink size={14} />
                      <span>打开产品前台页面</span>
                    </span>
                  </a>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-surface-900 truncate">{p.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-surface-500">{p.model}</span>
                        <span className="text-surface-300">·</span>
                        <span className="text-xs text-surface-400">{categoryName(p.category_id)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0 ml-2">
                      <button
                        onClick={() => handleEdit(p)}
                        title="编辑"
                        className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        title="删除"
                        className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
