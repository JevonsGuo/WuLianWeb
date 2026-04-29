'use client';

import { Product } from '@/lib/types';

interface ProductListProps {
  products: Product[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ProductList({ products, selectedId, onSelect }: ProductListProps) {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 border-b border-gray-100">
        产品列表
      </h2>
      <div className="flex-1 overflow-y-auto">
        {products.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">暂无产品</div>
        ) : (
          products.map((product) => {
            const thumb = product.image_urls?.[0] || product.main_image_url;
            return (
              <button
                key={product.id}
                onClick={() => onSelect(product.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors border-l-3 ${
                  selectedId === product.id
                    ? 'bg-blue-50 border-l-blue-600'
                    : 'border-l-transparent hover:bg-gray-50'
                }`}
                style={{ borderLeftWidth: '3px' }}
              >
                {thumb ? (
                  <img src={thumb} alt={product.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-lg font-bold shrink-0">
                    {product.name[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${selectedId === product.id ? 'text-blue-700' : 'text-gray-900'}`}>
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{product.model}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
