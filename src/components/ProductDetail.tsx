'use client';

import { useState } from 'react';
import { Product, ProductAttachment } from '@/lib/types';
import { ChevronLeft, ChevronRight, FileText, Award, Paperclip, Download } from 'lucide-react';

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
    if (type === 'certificate') return <Award size={16} className="text-green-500" />;
    if (type === 'manual') return <FileText size={16} className="text-blue-500" />;
    return <Paperclip size={16} className="text-gray-500" />;
  };

  const fileTypeLabel = (type: string) => {
    if (type === 'certificate') return '证书';
    if (type === 'manual') return '手册';
    return '附件';
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 上半部分：主图 + 基本信息 */}
      <div className="flex gap-6 p-6 border-b border-gray-100">
        {/* 主图区域 */}
        <div className="shrink-0">
          <div className="w-[300px] h-[300px] bg-gray-50 rounded-xl overflow-hidden relative group">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((i) => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={16} className="text-gray-600" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : mainImage ? (
              <img src={mainImage} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl font-bold">
                {product.name[0]}
              </div>
            )}
          </div>
          {/* 缩略图条 */}
          {images.length > 1 && (
            <div className="flex gap-1.5 mt-2 px-1 overflow-x-auto">
              {images.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentImageIndex ? 'border-blue-500' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 基本信息 */}
        <div className="flex-1 min-w-0 pt-2">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-blue-600 font-medium mt-1">型号：{product.model}</p>
          {product.description && (
            <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>
          )}
        </div>
      </div>

      {/* 标签页区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab 头 */}
        <div className="flex border-b border-gray-200 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'summary' && (
            <div>
              {product.summary_content ? (
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: product.summary_content }}
                />
              ) : (
                <p className="text-gray-400">暂无产品概要</p>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              {product.specifications_content ? (
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: product.specifications_content }}
                />
              ) : (
                <p className="text-gray-400">暂无参数信息</p>
              )}
            </div>
          )}

          {activeTab === 'attachments' && (
            <div>
              {attachments.length === 0 ? (
                <p className="text-gray-400">暂无附件</p>
              ) : (
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {fileIcon(att.file_type)}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{att.file_name}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
                            <span className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-500">
                              {fileTypeLabel(att.file_type)}
                            </span>
                            {att.file_size && <span>{formatFileSize(att.file_size)}</span>}
                          </div>
                        </div>
                      </div>
                      <a
                        href={att.file_url}
                        download={att.file_name}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                      >
                        <Download size={14} />
                        <span>下载</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
