'use client';

import { ProductCategory } from '@/lib/types';

interface CategoryListProps {
  categories: ProductCategory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function CategoryList({ categories, selectedId, onSelect }: CategoryListProps) {
  return (
    <div className="h-full flex flex-col bg-surface-50/50">
      <div className="px-5 py-4 border-b border-surface-200/60">
        <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-widest">
          产品大类
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2.5">
        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-all duration-200 mb-1 ${
                isSelected
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-surface-600 hover:bg-surface-100/80 hover:text-surface-800'
              }`}
            >
              {cat.image_url ? (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className={`w-10 h-10 rounded-lg object-cover shrink-0 ring-1 ${
                    isSelected ? 'ring-brand-200' : 'ring-surface-200'
                  }`}
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                    isSelected
                      ? 'bg-brand-100 text-brand-600'
                      : 'bg-surface-100 text-surface-400'
                  }`}
                >
                  {cat.name[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className={`text-sm font-medium block truncate ${isSelected ? 'text-brand-700' : ''}`}>
                  {cat.name}
                </span>
              </div>
              {isSelected && (
                <div className="w-1 h-5 rounded-full bg-brand-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
