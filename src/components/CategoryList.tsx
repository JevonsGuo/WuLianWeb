'use client';

import { ProductCategory } from '@/lib/types';

interface CategoryListProps {
  categories: ProductCategory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function CategoryList({ categories, selectedId, onSelect }: CategoryListProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto px-6 py-4 scrollbar-hide">
      {categories.map((cat) => {
        const isSelected = selectedId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-left transition-all duration-200 shrink-0 ${
              isSelected
                ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200'
                : 'bg-surface-50 text-surface-600 hover:bg-surface-100 hover:text-surface-800 ring-1 ring-surface-200/60'
            }`}
          >
            {cat.image_url ? (
              <img
                src={cat.image_url}
                alt={cat.name}
                className={`w-8 h-8 rounded-lg object-cover shrink-0 ${
                  isSelected ? 'ring-1 ring-brand-200' : ''
                }`}
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isSelected
                    ? 'bg-brand-100 text-brand-600'
                    : 'bg-surface-100 text-surface-400'
                }`}
              >
                {cat.name[0]}
              </div>
            )}
            <span className={`text-sm font-medium whitespace-nowrap ${isSelected ? 'text-brand-700' : ''}`}>
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
