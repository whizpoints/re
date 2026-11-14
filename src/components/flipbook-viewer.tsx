'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, Printer, ShieldAlert, Sparkles, Loader2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FlipbookViewerProps {
  doc: {
    id: string;
    title: string;
    slug: string;
    pageCount: number;
    pages?: string[];
    logoUrl?: string | null;
    views?: number;
    sessionToken?: string;
  };
}

export default function FlipbookViewer({ doc }: FlipbookViewerProps) {
  const totalPages = Math.max(doc?.pageCount || 0, doc?.pages?.length || 0, 1);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [loadedPages, setLoadedPages] = useState<Record<number, boolean>>({});
  const [loadingPages, setLoadingPages] = useState<Record<number, boolean>>({});
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const [drmToastVisible, setDrmToastVisible] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const drmTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});
  const thumbnailCanvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});
  const loadingLock = useRef<Record<number, boolean>>({});

  const loadedCount = Object.keys(loadedPages).length;
  const progressPercent = Math.min(100, Math.round((loadedCount / totalPages) * 100));

  // Detect mobile viewport
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

  // Show DRM notification when user attempts right-click or inspect
  const showDrmAlert = useCallback(() => {
    setDrmToastVisible(true);
    if (drmTimeoutRef.current) clearTimeout(drmTimeoutRef.current);
    drmTimeoutRef.current = setTimeout(() => {
      setDrmToastVisible(false);
    }, 2800);
  }, []);

  // Global Anti-Scrape Keyboard & Context Menu Interception
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showDrmAlert();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Allow Ctrl+P for High-Definition Document Printing
      if (isCtrlOrMeta && key === 'P') {
        e.preventDefault();
        triggerPrint();
        return;
      }

      // Block F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        showDrmAlert();
        return;
      }

      // Block Ctrl+U (View Source), Ctrl+S (Save Page), Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element Picker)
      if (
        (isCtrlOrMeta && key === 'U') ||
        (isCtrlOrMeta && key === 'S') ||
        (isCtrlOrMeta && e.shiftKey && (key === 'I' || key === 'J' || key === 'C'))
      ) {
        e.preventDefault();
        showDrmAlert();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDrmAlert]);

  // Handle scroll to temporarily hide floating controls
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 450);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active page via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(idx)) {
              setCurrentPage(idx);
              // Trigger preload of current and adjacent pages
              loadPage(idx);
              if (idx + 1 < totalPages) loadPage(idx + 1);
            }
          }
        });
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '100px 0px 100px 0px',
        threshold: 0.2,
      }
    );

    const pageElements = document.querySelectorAll('.pdf-page');
    pageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [totalPages]);

  // Securely load a page slice and draw directly to canvas in memory
  const loadPage = useCallback(
    async (pageIndex: number) => {
      if (loadedPages[pageIndex] || loadingLock.current[pageIndex]) return;

      loadingLock.current[pageIndex] = true;
      setLoadingPages((prev) => ({ ...prev, [pageIndex]: true }));

      try {
        let blobUrl: string | null = null;

        if (doc.sessionToken) {
          // Tokenized secure edge stream
          const res = await fetch(`/api/documents/${doc.id}/render?page=${pageIndex}&token=${doc.sessionToken}`, {
            headers: { Accept: 'image/jpeg,image/webp,*/*' },
            cache: 'no-store',
          });

          if (!res.ok) {
            throw new Error(`Failed to load page ${pageIndex + 1}`);
          }

          const blob = await res.blob();
          blobUrl = URL.createObjectURL(blob);
        } else if (doc.pages?.[pageIndex]) {
          // Direct fallback if pages array provided
          blobUrl = doc.pages[pageIndex];
        }

        if (!blobUrl) {
          throw new Error('No source available for page');
        }

        // Decode into memory image
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = (e) => reject(e);
          img.src = blobUrl!;
        });

        // 1. Draw onto main full-resolution canvas
        const mainCanvas = canvasRefs.current[pageIndex];
        if (mainCanvas) {
          mainCanvas.width = img.naturalWidth || 1600;
          mainCanvas.height = img.naturalHeight || 2262;
          const ctx = mainCanvas.getContext('2d', { alpha: false });
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);
          }
        }

        // 2. Draw thumbnail for desktop sidebar
        const thumbCanvas = thumbnailCanvasRefs.current[pageIndex];
        if (thumbCanvas) {
          thumbCanvas.width = 320;
          thumbCanvas.height = Math.round(320 * (img.naturalHeight / img.naturalWidth || 1.414));
          const tCtx = thumbCanvas.getContext('2d', { alpha: false });
          if (tCtx) {
            tCtx.imageSmoothingEnabled = true;
            tCtx.imageSmoothingQuality = 'medium';
            tCtx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);
          }
        }

        // Immediately revoke in-memory object URL to prevent memory leaks and url extraction
        if (doc.sessionToken && blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }

        setLoadedPages((prev) => ({ ...prev, [pageIndex]: true }));
      } catch (err) {
        console.error(`[CANVAS RENDER ERROR] Page ${pageIndex + 1}:`, err);
      } finally {
        loadingLock.current[pageIndex] = false;
        setLoadingPages((prev) => ({ ...prev, [pageIndex]: false }));
      }
    },
    [doc.id, doc.sessionToken, doc.pages, loadedPages]
  );

  // Sequential loading: Start with Page 0 immediately, then Page 1
  useEffect(() => {
    let mounted = true;

    async function initialSequence() {
      if (totalPages > 0) {
        await loadPage(0);
        if (!mounted) return;
        if (totalPages > 1) {
          await loadPage(1);
        }
      }
    }

    initialSequence();
    return () => {
      mounted = false;
    };
  }, [totalPages, loadPage]);

  // Smooth scroll to page
  const scrollToPage = (index: number) => {
    setCurrentPage(index);
    const element = document.getElementById(`page-${index}`);
    if (element && scrollContainerRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // High-Definition Document Print Trigger (Ctrl+P / Button)
  const triggerPrint = async () => {
    // If not all pages are loaded, fetch them in parallel before invoking print dialog
    const unrendered = Array.from({ length: totalPages }, (_, i) => i).filter((i) => !loadedPages[i]);

    if (unrendered.length > 0) {
      setIsPreparingPrint(true);
      toast.loading(`Preparing high-definition pages for printing (${unrendered.length} remaining)...`, {
        id: 'print-prep',
      });

      await Promise.all(unrendered.map((pageIdx) => loadPage(pageIdx)));

      toast.dismiss('print-prep');
      setIsPreparingPrint(false);
    }

    // Small delay to ensure all canvas buffers are completely rendered on screen
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="flipbook-root flex h-dvh w-screen bg-[#0f172a] overflow-hidden font-sans relative select-none">
      {/* Top Publication Loading Progress Line */}
      {loadedCount < totalPages && (
        <div className="viewer-progress-bar no-print fixed top-0 left-0 right-0 h-[2px] bg-slate-800 z-50">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Floating DRM Warning Alert Toast */}
      {drmToastVisible && (
        <div className="no-print fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-xl border border-blue-500/50 shadow-2xl rounded-2xl px-5 py-3 text-white flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block text-blue-300">Protected Publication</span>
            <span className="text-slate-300">Direct source inspection and asset downloads are restricted.</span>
          </div>
        </div>
      )}

      {/* Sidebar Thumbnails (Desktop) */}
      {!isMobile && (
        <aside
          className={`sidebar-container no-print transition-all duration-300 ease-in-out bg-slate-900 border-r border-slate-800 flex flex-col shadow-xl z-20 shrink-0 ${
            isSidebarOpen ? 'w-64' : 'w-0'
          }`}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between min-w-[16rem]">
            <div className="flex items-center gap-2">
              <h2 className="text-slate-200 font-semibold text-sm">Pages</h2>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {loadedCount}/{totalPages}
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-w-[16rem]">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                onClick={() => scrollToPage(i)}
                className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all group ${
                  currentPage === i
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                    : 'border-transparent hover:border-slate-700 bg-slate-800/60'
                }`}
              >
                <div className="relative aspect-[1/1.414] bg-slate-800 flex items-center justify-center overflow-hidden">
                  <canvas
                    ref={(el) => {
                      thumbnailCanvasRefs.current[i] = el;
                    }}
                    className={`w-full h-full object-contain ${loadedPages[i] ? 'block' : 'hidden'}`}
                  />
                  {!loadedPages[i] && (
                    <div className="flex flex-col items-center justify-center p-3 text-slate-500 space-y-1">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-[10px] font-mono">Page {i + 1}</span>
                    </div>
                  )}
                </div>
                <div className="bg-slate-800/90 text-center py-1 text-xs text-slate-400 font-medium group-hover:text-slate-200">
                  Page {i + 1}
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* Floating Top Controls (Top Left & Top Right) */}
        <div
          className={`floating-controls no-print absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${
            isScrolling ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Left Buttons: Sidebar Toggle */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {!isMobile && !isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="bg-slate-800/90 hover:bg-slate-700 text-white p-2.5 rounded-xl backdrop-blur-md transition-all shadow-lg border border-slate-700/60 flex items-center gap-2 text-xs font-semibold"
                title="Open Thumbnail Navigation"
              >
                <Menu size={18} />
                <span>Pages</span>
              </button>
            )}
          </div>

          {/* Right Buttons: Print & Status */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Quick High-Definition Document Print Button */}
            <button
              onClick={triggerPrint}
              disabled={isPreparingPrint}
              className="bg-slate-800/90 hover:bg-slate-700 text-white px-3.5 py-2.5 rounded-xl backdrop-blur-md transition-all shadow-lg border border-slate-700/60 flex items-center gap-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
              title="Print Document (Ctrl + P)"
            >
              {isPreparingPrint ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="hidden sm:inline">Preparing Pages...</span>
                </>
              ) : (
                <>
                  <Printer size={16} className="text-blue-400" />
                  <span className="hidden sm:inline">Print Document</span>
                  <span className="text-[10px] font-mono text-slate-400 hidden md:inline bg-slate-900/60 px-1.5 py-0.5 rounded">
                    Ctrl+P
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Vertical Scroll Document Flow */}
        <div
          ref={scrollContainerRef}
          className="flipbook-scroll-container flex-1 w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#0f172a]"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div
            className="flipbook-pages-wrapper flex flex-col items-center pt-20 pb-16 md:pt-24 md:pb-20 mx-auto transition-all duration-200 ease-out space-y-8 md:space-y-12"
            style={{
              width: '100%',
              maxWidth: '48rem', // max-w-3xl
              paddingLeft: isMobile ? '0.5rem' : '2rem',
              paddingRight: isMobile ? '0.5rem' : '2rem',
            }}
          >
            {Array.from({ length: totalPages }).map((_, i) => {
              const isLoaded = loadedPages[i];
              const isLoading = loadingPages[i];

              return (
                <div
                  key={i}
                  id={`page-${i}`}
                  data-index={i}
                  className="pdf-page w-full flex flex-col items-center relative"
                >
                  {/* Canvas Container with DRM Transparent Shield */}
                  <div className="w-full relative shadow-2xl rounded-sm overflow-hidden bg-white aspect-[1/1.414]">
                    {/* The Full-Resolution HTML5 Canvas */}
                    <canvas
                      ref={(el) => {
                        canvasRefs.current[i] = el;
                      }}
                      className={`w-full h-full object-contain bg-white transition-opacity duration-300 pointer-events-none ${
                        isLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
                      }`}
                    />

                    {/* Transparent Protective DRM Shield Overlay */}
                    {isLoaded && (
                      <div
                        className="no-print absolute inset-0 z-10 select-none cursor-default"
                        onContextMenu={(e) => {
                          e.preventDefault();
                          showDrmAlert();
                        }}
                        draggable={false}
                      />
                    )}

                    {/* Sleek Skeleton Loading Placeholder (No Square Macroblocks!) */}
                    {!isLoaded && (
                      <div className="viewer-skeleton absolute inset-0 bg-slate-800 flex flex-col items-center justify-center p-6 text-center animate-pulse">
                        <div className="w-12 h-12 rounded-2xl bg-slate-700/60 border border-slate-600 flex items-center justify-center mb-3">
                          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                        </div>
                        <span className="text-sm font-semibold text-slate-200">
                          {isLoading ? `Rendering Page ${i + 1} of ${totalPages}...` : `Preparing Page ${i + 1}...`}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                          Retina WebAssembly rasterization active
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Clean Page Divider / Number (Hidden during printing) */}
                  <div className="page-number-divider no-print mt-4 text-slate-500 text-xs font-mono font-medium tracking-widest uppercase">
                    &mdash; Page {i + 1} &mdash;
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Page Indicator (Floating at bottom) */}
        {isMobile && (
          <div className="mobile-page-indicator no-print absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-semibold shadow-xl border border-slate-700/80 flex items-center gap-2">
            <span>
              {currentPage + 1} / {totalPages}
            </span>
            {loadedCount < totalPages && (
              <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
            )}
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; border: 2px solid #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `,
        }}
      />
    </div>
  );
}
