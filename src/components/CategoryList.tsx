'use client';

import { ProductCategory, Product } from '@/lib/types';

interface CategoryListProps {
  categories: ProductCategory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function CategoryList({ categories, selectedId, onSelect }: CategoryListProps) {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 border-b border-gray-100">
        产品大类
      </h2>
      <div className="flex-1 overflow-y-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors border-l-3 ${
              selectedId === cat.id
                ? 'bg-blue-50 border-l-blue-600 text-blue-700'
                : 'border-l-transparent hover:bg-gray-50 text-gray-700'
            }`}
            style={{ borderLeftWidth: '3px' }}
          >
            {cat.image_url ? (
              <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-bold shrink-0">
                {cat.name[0]}
              </div>
            )}
            <span className="text-sm font-medium truncate">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
