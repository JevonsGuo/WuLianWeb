'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);
  const isJumpingRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const allItems = [...solutions, ...solutions, ...solutions];
  const singleSetWidth = useRef(0);

  const getItemWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 300;
    return el.querySelector<HTMLElement>(':scope > *')?.offsetWidth || 300;
  }, []);

  const getGap = useCallback(() => {
    return 24;
  }, []);

  const checkScroll = useCallback(() => {
    if (isJumpingRef.current) return;
    const el = scrollRef.current;
    if (!el) return;

    const itemW = getItemWidth();
    const gap = getGap();
    const step = itemW + gap;
    singleSetWidth.current = (itemW + gap) * solutions.length;

    const baseOffset = singleSetWidth.current;
    const scrollLeft = el.scrollLeft;

    setCanScrollLeft(true);
    setCanScrollRight(true);

    if (scrollLeft >= baseOffset * 2) {
      isJumpingRef.current = true;
      el.scrollLeft = scrollLeft - baseOffset;
      requestAnimationFrame(() => { isJumpingRef.current = false; });
    } else if (scrollLeft < baseOffset - step) {
      isJumpingRef.current = true;
      el.scrollLeft = scrollLeft + baseOffset;
      requestAnimationFrame(() => { isJumpingRef.current = false; });
    }
  }, [solutions.length, getItemWidth, getGap]);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = getItemWidth();
    const gap = getGap();
    el.scrollBy({ left: dir === 'left' ? -(cardWidth + gap) : (cardWidth + gap), behavior: 'smooth' });
  }, [getItemWidth, getGap]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || solutions.length === 0) return;

    const itemW = getItemWidth();
    const gap = getGap();
    singleSetWidth.current = (itemW + gap) * solutions.length;
    el.scrollLeft = singleSetWidth.current;

    checkScroll();
  }, [solutions, checkScroll, getItemWidth, getGap]);

  useEffect(() => {
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  useEffect(() => {
    if (solutions.length <= 3) return;

    const startAuto = () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = setInterval(() => {
        if (pausedRef.current) return;
        scroll('right');
      }, 3000);
    };

    startAuto();
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [solutions.length, scroll]);

  const handleMouseEnter = () => { pausedRef.current = true; };
  const handleMouseLeave = () => { pausedRef.current = false; };

  const showArrows = solutions.length > 3;

  const renderCard = (sol: Solution, keyPrefix: string) => (
    <Link
      key={`${keyPrefix}-${sol.id}`}
      href={`/solutions?solution=${sol.slug}`}
      className="group bg-white rounded-2xl border border-surface-200/80 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-400 snap-start shrink-0 w-[calc(33.333%-16px)] min-w-[280px]"
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
  );

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
        {allItems.map((sol, index) => renderCard(sol, `s${Math.floor(index / solutions.length)}`))}
      </div>
    </div>
  );
}
