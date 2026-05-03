'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Solution {
  id: string;
  industry_name: string;
  slug: string;
  description: string;
  image_url: string | null;
}

export default function SolutionCarousel({ solutions }: { solutions: Solution[] }) {
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

  const maxIndex = Math.max(0, solutions.length - visibleCount);

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
    if (solutions.length <= visibleCount) return;

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
  }, [solutions.length, visibleCount, goNext]);

  const handleMouseEnter = () => { pausedRef.current = true; };
  const handleMouseLeave = () => { pausedRef.current = false; };

  const showArrows = solutions.length > visibleCount;

  const displayItems = [...solutions, solutions[0]];

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
          {displayItems.map((sol, index) => (
            <Link
              key={`sol-${sol.id}-${index}`}
              href={`/solutions?solution=${sol.slug}`}
              className="group bg-white rounded-2xl border border-surface-200/80 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-400 shrink-0"
              style={{ width: `${itemWidth}px` }}
            >
              <div className="aspect-[16/10] bg-gradient-to-br from-emerald-50 via-surface-50 to-teal-50 flex items-center justify-center overflow-hidden">
                {sol.image_url ? (
                  <img
                    src={sol.image_url}
                    alt={sol.industry_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                    <span className="text-emerald-600 text-2xl font-bold">
                      {sol.industry_name[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-surface-900 group-hover:text-brand-600 transition-colors duration-200">
                  {sol.industry_name}
                </h3>
                <div className="text-sm text-surface-500 mt-2 line-clamp-2 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sol.description || '' }} />
                <div className="mt-3 flex items-center text-sm text-brand-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  了解更多 <ArrowRight size={14} className="ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
