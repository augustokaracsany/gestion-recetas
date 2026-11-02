import React, { useRef, useState, useEffect } from 'react';

interface ScrollableFilterBarProps {
  children: React.ReactNode;
  className?: string;
  gradientBg?: string; // custom gradient background color
}

export const ScrollableFilterBar: React.FC<ScrollableFilterBarProps> = ({
  children,
  className = '',
  gradientBg = 'from-zinc-900 via-zinc-900/90',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  };

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => checkScroll());
      ro.observe(el);
    }

    const timer = setTimeout(checkScroll, 150);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      if (ro) ro.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -260 : 260;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScroll, 320);
  };

  return (
    <div className={`relative flex items-center min-w-0 overflow-hidden ${className}`}>
      {/* Left Scroll Arrow */}
      {canScrollLeft && (
        <div className={`absolute left-0 z-20 flex items-center h-full pr-3 bg-gradient-to-r ${gradientBg} to-transparent rounded-l-2xl`}>
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Desplazar filtros hacia la izquierda"
            className="w-8 h-8 rounded-full bg-zinc-800 text-amber-400 shadow-lg border border-zinc-700/80 flex items-center justify-center hover:bg-amber-500 hover:text-zinc-950 transition-all cursor-pointer hover:scale-105"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
        </div>
      )}

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      {/* Right Scroll Arrow */}
      {canScrollRight && (
        <div className={`absolute right-0 z-20 flex items-center h-full pl-3 bg-gradient-to-l ${gradientBg} to-transparent rounded-r-2xl`}>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Desplazar filtros hacia la derecha"
            className="w-8 h-8 rounded-full bg-zinc-800 text-amber-400 shadow-lg border border-zinc-700/80 flex items-center justify-center hover:bg-amber-500 hover:text-zinc-950 transition-all cursor-pointer hover:scale-105"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};
