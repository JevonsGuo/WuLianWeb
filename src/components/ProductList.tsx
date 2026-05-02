'use client';

import { Product, ProductCategory } from '@/lib/types';
import { ImageIcon } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
  categories?: ProductCategory[];
  showCategory?: boolean;
}

export default function ProductList({ products, selectedId, onSelect, loading, categories, showCategory }: ProductListProps) {
  const categoryName = (categoryId: string) => categories?.find((c) => c.id === categoryId)?.name || '';

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-5 py-4 border-b border-surface-200/60">
        <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-widest">
          产品列表
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2.5">
        {loading ? (
          <div className="px-4 py-16 text-center">
            <div className="w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse">
              <ImageIcon size={20} className="text-surface-300" />
            </div>
            <p className="text-sm text-surface-400">加载中...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <div className="w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ImageIcon size={20} className="text-surface-300" />
            </div>
            <p className="text-sm text-surface-400">暂无产品</p>
          </div>
        ) : (
          products.map((product) => {
            const thumb = product.image_urls?.[0] || product.main_image_url;
            const isSelected = selectedId === product.id;
            return (
              <button
                key={product.id}
                onClick={() => onSelect(product.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-all duration-200 mb-1 group ${
                  isSelected
                    ? 'bg-brand-50 shadow-sm'
                    : 'hover:bg-surface-50'
                }`}
              >
                {thumb ? (
                  <div className="relative shrink-0">
                    <img
                      src={thumb}
                      alt={product.name}
                      className={`w-12 h-12 rounded-lg object-cover ring-1 ${
                        isSelected ? 'ring-brand-200' : 'ring-surface-200'
                      }`}
                    />
                  </div>
                ) : (
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold shrink-0 ${
                      isSelected
                        ? 'bg-brand-100 text-brand-600'
                        : 'bg-surface-100 text-surface-400'
                    }`}
                  >
                    {product.name[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate transition-colors duration-200 ${
                    isSelected ? 'text-brand-700' : 'text-surface-800 group-hover:text-surface-900'
                  }`}>
                    {product.name}
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5">
                    {product.model}
                    {showCategory && categoryName(product.category_id) && (
                      <> · <span className="text-brand-500">{categoryName(product.category_id)}</span></>
                    )}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-1 h-5 rounded-full bg-brand-500 shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
