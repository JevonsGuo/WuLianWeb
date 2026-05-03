'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Cpu, Bot, Eye } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

const categoryIcons = [Cpu, Bot, Eye];

export default function CategoryCarousel({ categories }: { categories: Category[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(':scope > *')?.offsetWidth || 300;
    const gap = 24;
    const amount = (cardWidth + gap) * 1;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    setTimeout(checkScroll, 400);
  };

  const showArrows = categories.length > 3;

  return (
    <div className="relative">
      {showArrows && canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-surface-200 flex items-center justify-center text-surface-600 hover:text-brand-600 hover:border-brand-300 transition-all duration-200"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {showArrows && canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-surface-200 flex items-center justify-center text-surface-600 hover:text-brand-600 hover:border-brand-300 transition-all duration-200"
        >
          <ChevronRight size={20} />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-2"
      >
        {categories.map((cat, index) => {
          const Icon = categoryIcons[index % categoryIcons.length];
          return (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative bg-white rounded-2xl border border-surface-200/80 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-400 snap-start shrink-0 w-[calc(33.333%-16px)] min-w-[280px]"
            >
              <div className="aspect-[16/10] bg-gradient-to-br from-brand-50 via-surface-50 to-brand-100/50 flex items-center justify-center overflow-hidden">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon size={28} className="text-brand-500" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-surface-900 group-hover:text-brand-600 transition-colors duration-200">
                  {cat.name}
                </h3>
                <div className="mt-2 flex items-center text-sm text-brand-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  了解更多 <ArrowRight size={14} className="ml-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
