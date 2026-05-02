'use client';

import { ProductCategory } from '@/lib/types';
import { Search } from 'lucide-react';

interface CategoryListProps {
  categories: ProductCategory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export default function CategoryList({ categories, selectedId, onSelect, disabled }: CategoryListProps) {
  return (
    <div className="h-full flex flex-col bg-surface-50/50 relative">
      <div className="px-5 py-4 border-b border-surface-200/60">
        <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-widest">
          产品大类
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`w-full relative overflow-hidden rounded-xl transition-all duration-200 group ${
                isSelected
                  ? 'ring-2 ring-brand-400 shadow-md'
                  : 'ring-1 ring-surface-200/60 hover:ring-brand-300 hover:shadow-sm'
              }`}
            >
              <div className="aspect-[16/7] w-full">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-surface-200 to-surface-300 flex items-center justify-center">
                    <span className="text-2xl font-bold text-surface-400">{cat.name[0]}</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-6">
                <span className={`text-base font-semibold block truncate ${
                  isSelected ? 'text-white' : 'text-white/90 group-hover:text-white'
                }`}>
                  {cat.name}
                </span>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-400 ring-2 ring-white/80" />
              )}
            </button>
          );
        })}
      </div>
      {disabled && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center pointer-events-none">
          <div className="flex items-center space-x-2 px-4 py-2 bg-white/90 rounded-xl shadow-sm">
            <Search size={14} className="text-brand-500" />
            <span className="text-sm font-medium text-surface-600">搜索模式</span>
          </div>
        </div>
      )}
    </div>
  );
}
