'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);

  const updateVisibleCount = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.offsetWidth;
    if (w >= 1024) setVisibleCount(3);
    else if (w >= 640) setVisibleCount(2);
    else setVisibleCount(1);
  }, []);

  useEffect(() => {
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, [updateVisibleCount]);

  const maxIndex = Math.max(0, categories.length - visibleCount);

  const goTo = useCallback((index: number, animate = true) => {
    if (animate) setIsTransitioning(true);
    else setIsTransitioning(false);
    setCurrentIndex(index);
  }, []);

  const goNext = useCallback(() => {
    if (currentIndex >= maxIndex) {
      setIsTransitioning(true);
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 500);
    } else {
      setIsTransitioning(true);
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, maxIndex]);

  const goPrev = useCallback(() => {
    if (currentIndex <= 0) {
      setIsTransitioning(false);
      setCurrentIndex(maxIndex);
    } else {
      setIsTransitioning(true);
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex, maxIndex]);

  useEffect(() => {
    if (categories.length <= visibleCount) return;

    const startAuto = () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = setInterval(() => {
        if (pausedRef.current) return;
        goNext();
      }, 3000);
    };

    startAuto();
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [categories.length, visibleCount, goNext]);

  const handleMouseEnter = () => { pausedRef.current = true; };
  const handleMouseLeave = () => { pausedRef.current = false; };

  const showArrows = categories.length > visibleCount;

  const displayItems = [...categories, categories[0]];

  const getItemWidth = () => {
    if (!containerRef.current) return 300;
    const gap = 24;
    return (containerRef.current.offsetWidth - gap * (visibleCount - 1)) / visibleCount;
  };

  const itemWidth = getItemWidth();
  const gap = 24;
  const translateX = -(currentIndex * (itemWidth + gap));

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showArrows && (
        <button
          onClick={goPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-surface-200 flex items-center justify-center text-surface-600 hover:text-brand-600 hover:border-brand-300 transition-all duration-200"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {showArrows && (
        <button
          onClick={goNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-surface-200 flex items-center justify-center text-surface-600 hover:text-brand-600 hover:border-brand-300 transition-all duration-200"
        >
          <ChevronRight size={20} />
        </button>
      )}

      <div className="overflow-hidden">
        <div
          className="flex"
          style={{
            gap: `${gap}px`,
            transform: `translateX(${translateX}px)`,
            transition: isTransitioning ? 'transform 0.5s ease' : 'none',
          }}
        >
          {displayItems.map((cat, index) => {
            const Icon = categoryIcons[index % categoryIcons.length];
            return (
              <Link
                key={`cat-${cat.id}-${index}`}
                href={`/products?category=${cat.slug}`}
                className="group relative bg-white rounded-2xl border border-surface-200/80 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-400 shrink-0"
                style={{ width: `${itemWidth}px` }}
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
    </div>
  );
}
