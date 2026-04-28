'use client';

import { ProductCategory } from '@/lib/types';

interface CategorySidebarProps {
  categories: ProductCategory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function CategorySidebar({
  categories,
  selectedId,
  onSelect,
}: CategorySidebarProps) {
  return (
    <aside className="w-full md:w-72 shrink-0">
      {/* Mobile: horizontal scroll */}
      <div className="md:hidden flex overflow-x-auto gap-2 pb-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
              selectedId === cat.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {cat.image_url && (
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-6 h-6 rounded object-cover"
              />
            )}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Desktop: vertical list */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <h2 className="px-4 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
          产品大类
        </h2>
        <nav className="py-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all relative ${
                selectedId === cat.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {selectedId === cat.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r" />
              )}
              {cat.image_url ? (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">
                    {cat.name[0]}
                  </span>
                </div>
              )}
              <span className="font-medium text-sm">{cat.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
