'use client';

import { Product } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
  isAnimating: boolean;
  onProductClick: (product: Product) => void;
}

export default function ProductGrid({
  products,
  isAnimating,
  onProductClick,
}: ProductGridProps) {
  return (
    <div
      className={`product-grid ${isAnimating ? 'fade-out' : 'fade-in'}`}
    >
      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">暂无产品</p>
          <p className="text-sm mt-2">该分类下暂无产品信息</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const firstImage = product.image_urls?.[0];
            return (
              <div
                key={product.id}
                className="product-card-stagger bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Product Image - clickable */}
                <button
                  onClick={() => onProductClick(product)}
                  className="w-full aspect-square bg-gray-50 overflow-hidden cursor-pointer relative"
                >
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-gray-400 text-4xl font-bold">
                        {product.name[0]}
                      </span>
                    </div>
                  )}
                  {/* 多图角标 */}
                  {product.image_urls && product.image_urls.length > 1 && (
                    <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                      {product.image_urls.length} 图
                    </span>
                  )}
                </button>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{product.model}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
