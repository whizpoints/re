'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowDown, Hand } from 'lucide-react';

export default function FlipbookViewer({ doc }: { doc: any }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll to hide UI
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 500); // UI reappears 500ms after scrolling stops
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Track which page is currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentPage(Number(entry.target.getAttribute('data-index')));
          }
        });
      },
      { 
        root: scrollContainerRef.current, 
        rootMargin: '0px', 
        threshold: 0.3 // Trigger when 30% of the page is visible
      }
    );
    
    const pages = document.querySelectorAll('.pdf-page');
    pages.forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, [doc.pages, doc.pageCount]);

  const scrollToPage = (index: number) => {
    setCurrentPage(index);
    const element = document.getElementById(`page-${index}`);
    if (element && scrollContainerRef.current) {
      // Adding a small offset so it doesn't hide behind the top padding/controls
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex h-dvh w-screen bg-[#0f172a] overflow-hidden font-sans">
      

      {/* Sidebar / Thumbnails (Desktop) */}
      {!isMobile && (
        <div className={`transition-all duration-300 ease-in-out bg-slate-900 border-r border-slate-800 flex flex-col shadow-xl z-20 shrink-0 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between min-w-[16rem]">
            <h2 className="text-slate-200 font-semibold">Pages</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-w-[16rem]">
            {Array.from({ length: doc.pageCount }).map((_, i) => (
              <div 
                key={i} 
                onClick={() => scrollToPage(i)}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${currentPage === i ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg' : 'border-transparent hover:border-slate-600'}`}
              >
                {doc.pages?.[i] ? (
                  <img src={doc.pages[i]} alt={`Thumbnail ${i+1}`} className="w-full h-auto object-contain bg-white" draggable={false} onContextMenu={(e) => e.preventDefault()} />
                ) : (
                  <div className="w-full aspect-[1/1.4] bg-slate-800 flex items-center justify-center text-slate-500 font-bold">{i+1}</div>
                )}
                <div className="bg-slate-800 text-center py-1.5 text-xs text-slate-400 font-medium">Page {i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        
        {/* Floating Controls (Top Left) */}
        <div className={`absolute top-4 left-4 z-10 flex gap-2 transition-opacity duration-300 ${isScrolling ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {!isMobile && !isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} className="bg-slate-800/80 hover:bg-slate-700 text-white p-3 rounded-xl backdrop-blur-sm transition-colors shadow-lg border border-slate-700/50">
              <Menu size={20} />
            </button>
          )}
        </div>



        {/* Vertical Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#0f172a]"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div 
            className="flex flex-col items-center pt-24 pb-8 md:pt-28 md:pb-12 mx-auto transition-all duration-200 ease-out space-y-6 md:space-y-10"
            style={{ 
              width: '100%',
              maxWidth: '48rem', // max-w-3xl
              paddingLeft: isMobile ? '0.5rem' : '2rem',
              paddingRight: isMobile ? '0.5rem' : '2rem',
            }}
          >
            {Array.from({ length: doc.pageCount }).map((_, i) => (
              <div 
                key={i}
                id={`page-${i}`}
                data-index={i}
                className="pdf-page w-full flex flex-col items-center relative"
              >
                {doc.pages?.[i] ? (
                  <img 
                    src={doc.pages[i]} 
                    alt={`Page ${i + 1}`} 
                    className="w-full h-auto bg-white shadow-2xl rounded-sm select-none pointer-events-none" draggable={false} onContextMenu={(e) => e.preventDefault()}
                  />
                ) : (
                  <div className="w-full aspect-[1/1.414] bg-white flex items-center justify-center rounded-sm shadow-2xl">
                    <span className="text-6xl font-bold text-slate-200">Loading {i + 1}...</span>
                  </div>
                )}
                
                {/* Optional subtle page divider/number for vertical flow */}
                <div className="mt-4 text-slate-500 text-sm font-medium tracking-widest uppercase">
                  - {i + 1} -
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Page Indicator (Floating at bottom) */}
        {isMobile && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-slate-800/90 backdrop-blur-sm px-5 py-2.5 rounded-full text-white text-sm font-medium shadow-lg border border-slate-700 transition-opacity">
            {currentPage + 1} / {doc.pageCount}
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; border: 2px solid #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}
