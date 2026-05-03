'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

interface Solution {
  id: string;
  industry_name: string;
  slug: string;
  description: string;
  image_url: string | null;
  related_product_ids: string | null;
}

interface Product {
  id: string;
  name: string;
  model: string;
  category_id: string;
}

export default function SolutionsAccordion({
  solutions,
  productsMap,
  categoriesMap,
  initialExpandedSlug,
}: {
  solutions: Solution[];
  productsMap: Map<string, Product>;
  categoriesMap: Map<string, string>;
  initialExpandedSlug?: string | null;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(() => {
    if (!initialExpandedSlug) return null;
    const found = solutions.find((s) => s.slug === initialExpandedSlug);
    return found?.id || null;
  });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const pendingExpand = useRef<string | null>(null);
  const initialScrolled = useRef(false);

  const smoothScrollTo = useCallback((targetY: number) => {
    const startY = window.pageYOffset;
    const diff = targetY - startY;
    if (Math.abs(diff) < 5) return;
    const duration = 600;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, startY + diff * ease);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  const scrollToItem = useCallback((id: string) => {
    const el = itemRefs.current.get(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const targetY = window.pageYOffset + rect.top - 80;
      smoothScrollTo(targetY);
    }
  }, [smoothScrollTo]);

  useEffect(() => {
    if (initialExpandedSlug && !initialScrolled.current) {
      const found = solutions.find((s) => s.slug === initialExpandedSlug);
      if (found) {
        initialScrolled.current = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToItem(found.id);
          });
        });
      }
    }
  }, [initialExpandedSlug, solutions, scrollToItem]);

  const toggle = useCallback((id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setTimeout(() => scrollToItem(solutions[0]?.id), 500);
      return;
    }

    if (expandedId !== null) {
      pendingExpand.current = id;
      setExpandedId(null);
      setTimeout(() => {
        setExpandedId(id);
        pendingExpand.current = null;
        requestAnimationFrame(() => scrollToItem(id));
      }, 300);
    } else {
      setExpandedId(id);
      requestAnimationFrame(() => scrollToItem(id));
    }
  }, [expandedId, solutions, scrollToItem]);

  return (
    <div className="space-y-3">
      {solutions.map((sol) => {
        const isExpanded = expandedId === sol.id;
        const isHovered = hoveredId === sol.id;
        const hasHover = hoveredId !== null;

        const relatedIds: string[] = sol.related_product_ids
          ? JSON.parse(sol.related_product_ids)
          : [];
        const relatedProducts = relatedIds
          .map((id) => productsMap.get(id))
          .filter(Boolean);

        return (
          <div
            key={sol.id}
            ref={(el) => {
              if (el) itemRefs.current.set(sol.id, el);
            }}
          >
            <button
              onClick={() => toggle(sol.id)}
              onMouseEnter={() => setHoveredId(sol.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative w-full overflow-hidden rounded-2xl transition-all duration-500"
              style={{
                aspectRatio: isExpanded ? '21/2' : '21/4',
                minHeight: '120px',
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                style={{
                  backgroundImage: sol.image_url ? `url(${sol.image_url})` : 'none',
                  transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                }}
              />
              {!sol.image_url && (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-800 to-brand-950 flex items-center justify-center">
                  <span className="text-brand-300/30 text-[120px] font-bold leading-none select-none">
                    {sol.industry_name[0]}
                  </span>
                </div>
              )}
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)',
                  opacity: hasHover && !isHovered ? 0.4 : 1,
                }}
              />
              {hasHover && !isHovered && (
                <div className="absolute inset-0 bg-black/30 transition-opacity duration-500" />
              )}
              <div className="relative h-full flex items-center justify-between px-8 md:px-12">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight drop-shadow-lg">
                    {sol.industry_name}
                  </h2>
                </div>
                <ChevronDown
                  size={24}
                  className={`text-white/70 transition-transform duration-500 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            <div
              className={`grid transition-all duration-500 ease-in-out ${
                isExpanded ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="bg-white rounded-2xl border border-surface-200/80 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-2/5 aspect-video md:aspect-auto min-h-[220px] bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden">
                    {sol.image_url ? (
                      <img
                        src={sol.image_url}
                        alt={sol.industry_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-emerald-200 text-8xl font-bold">
                          {sol.industry_name[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                    <div className="text-surface-600 leading-relaxed text-base mb-6 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sol.description || '' }} />

                    {relatedProducts.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                          关联产品
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {relatedProducts.map((product: any) => (
                            <Link
                              key={product.id}
                              href={`/products?category=${categoriesMap.get(product.category_id) || ''}&product=${product.model}`}
                              className="inline-flex items-center px-3.5 py-1.5 bg-brand-50 text-brand-600 rounded-lg text-sm font-medium hover:bg-brand-100 transition-colors duration-200"
                            >
                              {product.name}（{product.model}）
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        );
      })}

      {solutions.length === 0 && (
        <div className="text-center py-20 text-surface-400">
          <p className="text-lg">暂无解决方案</p>
        </div>
      )}
    </div>
  );
}
