'use client';

import { Product } from '@/lib/types';
import { ImageIcon } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ProductList({ products, selectedId, onSelect }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-surface-400">
        <div className="text-center">
          <div className="w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ImageIcon size={20} className="text-surface-300" />
          </div>
          <p className="text-sm text-surface-400">暂无产品</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-stretch gap-4 overflow-x-auto px-6 py-4 scrollbar-hide">
      {products.map((product) => {
        const thumb = product.image_urls?.[0] || product.main_image_url;
        const isSelected = selectedId === product.id;
        return (
          <button
            key={product.id}
            onClick={() => onSelect(product.id)}
            className={`flex flex-col items-center w-[140px] shrink-0 p-3 rounded-xl text-center transition-all duration-200 group ${
              isSelected
                ? 'bg-brand-50 shadow-sm ring-1 ring-brand-200'
                : 'hover:bg-surface-50 ring-1 ring-surface-200/60'
            }`}
          >
            {thumb ? (
              <div className="relative w-full aspect-square mb-2.5">
                <img
                  src={thumb}
                  alt={product.name}
                  className={`w-full h-full rounded-lg object-cover ring-1 ${
                    isSelected ? 'ring-brand-200' : 'ring-surface-200'
                  }`}
                />
                {(product.image_urls?.length || 0) > 1 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {product.image_urls.length}
                  </span>
                )}
              </div>
            ) : (
              <div
                className={`w-full aspect-square rounded-lg flex items-center justify-center text-lg font-bold mb-2.5 ${
                  isSelected
                    ? 'bg-brand-100 text-brand-600'
                    : 'bg-surface-100 text-surface-400'
                }`}
              >
                {product.name[0]}
              </div>
            )}
            <p className={`text-xs font-medium truncate w-full transition-colors duration-200 ${
              isSelected ? 'text-brand-700' : 'text-surface-800 group-hover:text-surface-900'
            }`}>
              {product.name}
            </p>
            <p className="text-[10px] text-surface-400 mt-0.5 truncate w-full">{product.model}</p>
          </button>
        );
      })}
    </div>
  );
}
