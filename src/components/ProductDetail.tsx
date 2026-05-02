'use client';

import { useState } from 'react';
import { Product, ProductAttachment } from '@/lib/types';
import { ChevronLeft, ChevronRight, FileText, Award, Paperclip, Package } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  attachments: ProductAttachment[];
}

type TabKey = 'summary' | 'specs' | 'attachments';

export default function ProductDetail({ product, attachments }: ProductDetailProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.image_urls || [];
  const mainImage = product.main_image_url || images[0];

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'summary', label: '产品概要', icon: <FileText size={14} /> },
    { key: 'specs', label: '主要参数', icon: <Award size={14} /> },
    { key: 'attachments', label: '证书与附件', icon: <Paperclip size={14} /> },
  ];

  const fileIcon = (type: string) => {
    if (type === 'certificate') return <Award size={16} className="text-emerald-500" />;
    if (type === 'manual') return <FileText size={16} className="text-brand-500" />;
    return <Paperclip size={16} className="text-surface-400" />;
  };

  const fileTypeLabel = (type: string) => {
    if (type === 'certificate') return '证书';
    if (type === 'manual') return '手册';
    return '附件';
  };

  const fileTypeColor = (type: string) => {
    if (type === 'certificate') return 'bg-emerald-50 text-emerald-600';
    if (type === 'manual') return 'bg-brand-50 text-brand-600';
    return 'bg-surface-100 text-surface-500';
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fade-in">
      {/* Top: Image + Info */}
      <div className="flex gap-6 p-6 border-b border-surface-100">
        <div className="shrink-0">
          <div className="w-[220px] h-[220px] bg-surface-50 rounded-2xl overflow-hidden relative group ring-1 ring-surface-200/60">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
                    >
                      <ChevronLeft size={16} className="text-surface-600" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((i) => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
                    >
                      <ChevronRight size={16} className="text-surface-600" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`rounded-full transition-all duration-200 ${
                            idx === currentImageIndex
                              ? 'bg-white w-5 h-1.5'
                              : 'bg-white/50 w-1.5 h-1.5 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : mainImage ? (
              <img src={mainImage} alt={product.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={64} className="text-surface-200" />
              </div>
            )}
          </div>
          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 px-0.5 overflow-x-auto pb-1">
              {images.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`shrink-0 w-11 h-11 rounded-lg overflow-hidden ring-2 transition-all duration-200 ${
                    idx === currentImageIndex
                      ? 'ring-brand-400 shadow-sm'
                      : 'ring-surface-200 opacity-40 hover:opacity-70'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Basic info */}
        <div className="flex-1 min-w-0 pt-0">
          <h1 className="text-xl font-bold text-surface-900 tracking-tight">{product.name}</h1>
          <div className="mt-2 inline-flex items-center px-2.5 py-1 bg-brand-50 text-brand-600 rounded-lg text-sm font-medium">
            型号：{product.model}
          </div>
          {product.description && (
            <p className="text-surface-500 mt-5 leading-relaxed">{product.description}</p>
          )}
        </div>
      </div>

      {/* Tabbed content */}
      <div className="flex-1 flex flex-col overflow-hidden">
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
        <div className="flex-1 overflow-y-auto p-6 animate-fade-in" key={activeTab}>
          {activeTab === 'summary' && (
            <div>
              {product.summary_content ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.summary_content }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-surface-400">
                  <FileText size={32} className="mb-3 text-surface-200" />
                  <p>暂无产品概要</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              {product.specifications_content ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.specifications_content }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-surface-400">
                  <Award size={32} className="mb-3 text-surface-200" />
                  <p>暂无参数信息</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'attachments' && (
            <div>
              {attachments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-surface-400">
                  <Paperclip size={32} className="mb-3 text-surface-200" />
                  <p>暂无附件</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-surface-200/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-50 border-b border-surface-200/60">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-500 w-10"></th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-500 w-60">文件名</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-500 w-20">大小</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-surface-500">描述</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attachments.map((att) => (
                        <tr key={att.id} className="border-b border-surface-100 last:border-b-0 hover:bg-surface-50/50">
                          <td className="px-4 py-3">
                            {fileIcon(att.file_type)}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
