'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Printer,
  Sparkles,
  Search,
  Upload,
  Layers,
  Sliders,
  FileText,
  Image as ImageIcon,
  Check,
  Info,
  Phone,
  MessageSquare,
  ZoomIn,
  ZoomOut,
  Eye,
  Edit3,
  Move,
  Type,
  QrCode,
  Palette,
  Lock,
} from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';
import { A4_TEMPLATES, A4Template } from '@/lib/templates/a4-templates';
import {
  A4PosterData,
  renderA4PosterToCanvas,
  generateReliableQRCanvas,
  downloadA4PDF,
  downloadA4PNG,
  printA4Poster,
} from '@/lib/a4-generator';
import toast from 'react-hot-toast';

interface A4PosterStudioProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  slug: string;
  url: string;
  initialLogoUrl?: string;
  isProUser?: boolean;
}

export function A4PosterStudio({
  isOpen,
  onClose,
  documentTitle,
  slug,
  url,
  initialLogoUrl,
  isProUser = false,
}: A4PosterStudioProps) {
  // Mounting for React Portal
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // View Mode: 'view' vs 'edit'
  const [isEditMode, setIsEditMode] = useState(true);
  const [mobileTab, setMobileTab] = useState<'canvas' | 'editor'>('canvas');

  // Active Customization Section
  const [activeTab, setActiveTab] = useState<'templates' | 'qr' | 'typography' | 'photo' | 'background' | 'hosting'>('templates');

  // Selected Template
  const [selectedTemplate, setSelectedTemplate] = useState<A4Template>(A4_TEMPLATES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Customizable Texts
  const [customTitle, setCustomTitle] = useState(documentTitle || A4_TEMPLATES[0].defaultTitle);
  const [customSubtitle, setCustomSubtitle] = useState(A4_TEMPLATES[0].defaultSubtitle);
  const [badgeText, setBadgeText] = useState(A4_TEMPLATES[0].badgeText);
  const [personName, setPersonName] = useState('');
  const [sunriseDate, setSunriseDate] = useState('12 Jan 1954');
  const [sunsetDate, setSunsetDate] = useState('08 Nov 2026');
  const [bottomNote, setBottomNote] = useState(A4_TEMPLATES[0].defaultBottomNote);

  // Sizing & Positioning Controls (Default Large QR Code: 1360px!)
  const [titleFontSize, setTitleFontSize] = useState<number>(82);
  const [qrSize, setQrSize] = useState<number>(1360);
  const [qrCardOffsetY, setQrCardOffsetY] = useState<number>(0);
  const [photoSize, setPhotoSize] = useState<number>(460);
  const [qrLogoSize, setQrLogoSize] = useState<number>(0.38);

  // Layout Visibility Toggles
  const [showBadge, setShowBadge] = useState(true);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showSunriseSunset, setShowSunriseSunset] = useState(true);
  const [showBottomNote, setShowBottomNote] = useState(true);
  const [showHostingNotice, setShowHostingNotice] = useState(true);

  // Photo
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoShape, setPhotoShape] = useState<'circle' | 'arch' | 'rounded' | 'none'>('arch');

  // Custom Background & Transparency
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [customBgOpacity, setCustomBgOpacity] = useState<number>(0.6);

  // QR Customization
  const [centerLogoUrl, setCenterLogoUrl] = useState<string | undefined>(initialLogoUrl || '/logo.png');
  const [qrDotsType, setQrDotsType] = useState<'extra-rounded' | 'rounded' | 'dots' | 'classy' | 'square'>('extra-rounded');
  const [qrCornersType, setQrCornersType] = useState<'extra-rounded' | 'square' | 'dot'>('extra-rounded');
  const [customQrColor, setCustomQrColor] = useState<string>(A4_TEMPLATES[0].qrColor);

  // Canvas Zoom: Defaults directly to 70% as requested by the user
  const [canvasZoom, setCanvasZoom] = useState<number>(0.7);

  // Loading states
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);

  // Offscreen QR Generator
  const qrRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Live Canvas Viewport Ref (Guarantees 100% WYSIWYG match to PDF)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR Code data URL when relevant settings change
  useEffect(() => {
    if (!isOpen) return;

    const qr = new QRCodeStyling({
      width: 1500,
      height: 1500,
      type: 'canvas',
      data: url,
      margin: 16,
      image: centerLogoUrl || undefined,
      dotsOptions: {
        color: customQrColor || selectedTemplate.qrColor || '#0f172a',
        type: qrDotsType,
      },
      cornersSquareOptions: {
        color: customQrColor || selectedTemplate.qrColor || '#0f172a',
        type: qrCornersType as any,
      },
      cornersDotOptions: {
        color: customQrColor || selectedTemplate.qrColor || '#0f172a',
        type: qrCornersType === 'extra-rounded' ? 'dot' : (qrCornersType as any),
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10,
        imageSize: qrLogoSize,
      },
      backgroundOptions: {
        color: '#ffffff',
      },
    });

    // Primary: Generate immediately and reliably with canvas error correction
    const targetColor = customQrColor || selectedTemplate.qrColor || '#0f172a';
    generateReliableQRCanvas(url, targetColor, centerLogoUrl, qrLogoSize)
      .then((reliableCanvas) => {
        setQrDataUrl(reliableCanvas.toDataURL('image/png'));
      })
      .catch((err) => {
        console.warn('Reliable QR generator fallback triggered:', err);
      });

    // Optional: Also render to qrRef if styler succeeds
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      try {
        qr.append(qrRef.current);
        setTimeout(() => {
          const canvas = qrRef.current?.querySelector('canvas') as HTMLCanvasElement;
          if (canvas) {
            try {
              const dataUrl = canvas.toDataURL('image/png');
              if (dataUrl && dataUrl.length > 200) {
                setQrDataUrl(dataUrl);
              }
            } catch (e) {
              // Tainted or unavailable, keep reliable canvas
            }
          }
        }, 150);
      } catch (e) {
        // Styler error, reliable canvas already set
      }
    }
  }, [isOpen, url, customQrColor, selectedTemplate.qrColor, centerLogoUrl, qrDotsType, qrCornersType, qrLogoSize]);

  // Build Payload
  const buildPosterData = useCallback((): A4PosterData => ({
    documentTitle,
    slug,
    url,
    template: selectedTemplate,
    customTitle,
    customSubtitle,
    badgeText,
    personName,
    sunriseDate,
    sunsetDate,
    bottomNote,
    titleFontSize,
    qrSize,
    qrCardOffsetY,
    photoSize,
    showBadge,
    showPhoto,
    showSunriseSunset,
    showBottomNote,
    photoUrl,
    photoShape,
    customBgUrl,
    customBgOpacity,
    qrDataUrl,
    centerLogoUrl,
    qrLogoSize,
    customQrColor,
    showHostingNotice: isProUser ? showHostingNotice : true,
    isProUser,
  }), [
    documentTitle,
    slug,
    url,
    selectedTemplate,
    customTitle,
    customSubtitle,
    badgeText,
    personName,
    sunriseDate,
    sunsetDate,
    bottomNote,
    titleFontSize,
    qrSize,
    qrCardOffsetY,
    photoSize,
    showBadge,
    showPhoto,
    showSunriseSunset,
    showBottomNote,
    photoUrl,
    photoShape,
    customBgUrl,
    customBgOpacity,
    qrDataUrl,
    centerLogoUrl,
    qrLogoSize,
    customQrColor,
    showHostingNotice,
    isProUser,
  ]);

  // Live Canvas Renderer (Draws the exact output canvas onto the on-screen preview)
  const updatePreviewCanvas = useCallback(async () => {
    if (!previewCanvasRef.current || !qrDataUrl) return;

    try {
      setIsRenderingPreview(true);
      const data = buildPosterData();
      const highResCanvas = await renderA4PosterToCanvas(data);

      const previewCanvas = previewCanvasRef.current;
      previewCanvas.width = 1240; // High resolution preview width (1:2 ratio)
      previewCanvas.height = 1754; // High resolution preview height

      const pCtx = previewCanvas.getContext('2d');
      if (pCtx) {
        pCtx.imageSmoothingEnabled = true;
        pCtx.imageSmoothingQuality = 'high';
        pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        pCtx.drawImage(highResCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
      }
    } catch (e) {
      console.warn('Error rendering live preview canvas:', e);
    } finally {
      setIsRenderingPreview(false);
    }
  }, [buildPosterData, qrDataUrl]);

  // Update preview canvas whenever any setting changes
  useEffect(() => {
    if (isOpen && qrDataUrl) {
      updatePreviewCanvas();
    }
  }, [isOpen, qrDataUrl, updatePreviewCanvas]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return A4_TEMPLATES.filter((tpl) => {
      const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
      const matchesSearch =
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.badgeText.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Handle template selection
  const handleSelectTemplate = (tpl: A4Template) => {
    setSelectedTemplate(tpl);
    setBadgeText(tpl.badgeText);
    setCustomTitle(tpl.defaultTitle);
    setCustomSubtitle(tpl.defaultSubtitle);
    setBottomNote(tpl.defaultBottomNote);
    setCustomQrColor(tpl.qrColor);
  };

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
        setShowPhoto(true);
        if (photoShape === 'none') setPhotoShape('arch');
        if (qrSize > 1150) setQrSize(1120); // Automatically adjust QR size to fit photo
      };
      reader.readAsDataURL(file);
    }
  };

  // QR Center Logo Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCenterLogoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Custom Background Upload Handler
  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomBgUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Export handlers
  const handleDownloadPDF = async () => {
    try {
      setIsExportingPDF(true);
      toast.loading('Compiling 300 DPI A4 PDF...', { id: 'pdf-export' });
      const data = buildPosterData();
      await downloadA4PDF(data);
      toast.success('Print-ready A4 PDF downloaded!', { id: 'pdf-export' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF. Please try again.', { id: 'pdf-export' });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleDownloadPNG = async () => {
    try {
      setIsExportingPNG(true);
      toast.loading('Generating 300 DPI Poster...', { id: 'png-export' });
      const data = buildPosterData();
      await downloadA4PNG(data);
      toast.success('300 DPI Poster downloaded!', { id: 'png-export' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate image. Please try again.', { id: 'png-export' });
    } finally {
      setIsExportingPNG(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const data = buildPosterData();
      await printA4Poster(data);
    } catch (err) {
      console.error(err);
      toast.error('Unable to open print dialog.');
    } finally {
      setIsPrinting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-slate-950/92 backdrop-blur-xl flex flex-col w-screen h-screen overflow-hidden select-none animate-in fade-in duration-200">
      
      {/* Hidden offscreen QR renderer */}
      <div ref={qrRef} className="hidden" />

      {/* ================================================================= */}
      {/* 1. TOP HEADER APP BAR                                             */}
      {/* ================================================================= */}
      <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-50">
        
        {/* Left: Branding & Publication Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                Whizpoint A4 Standee Studio
              </h2>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                300 DPI Vector PDF
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-xs md:max-w-md">
              Publication: <span className="font-semibold text-slate-700">{documentTitle}</span>
            </p>
          </div>
        </div>

        {/* Center: Exact Zoom Controls (Default 70%) */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setCanvasZoom((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(1))))}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-700 px-2 min-w-[50px] text-center">
            {Math.round(canvasZoom * 100)}%
          </span>
          <button
            onClick={() => setCanvasZoom((prev) => Math.min(1.2, Number((prev + 0.1).toFixed(1))))}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCanvasZoom(0.7)}
            className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
            title="Reset to standard 70%"
          >
            70%
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Toggle Customizer Drawer */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              isEditMode
                ? 'bg-blue-50 border border-blue-300 text-blue-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-transparent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEditMode ? 'Hide Editor' : 'Customize & Edit'}</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isPrinting ? 'Preparing...' : 'Print'}</span>
          </button>

          {/* Poster PNG */}
          <button
            onClick={handleDownloadPNG}
            disabled={isExportingPNG}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Poster PNG</span>
          </button>

          {/* Download 300 DPI PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPDF ? 'Generating...' : 'Download A4 PDF'}</span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" />

          {/* Close Studio */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ================================================================= */}
      {/* 2. MOBILE VIEW SWITCHER                                           */}
      {/* ================================================================= */}
      <div className="lg:hidden flex bg-white border-b border-slate-200 p-1 shrink-0 z-40">
        <button
          onClick={() => setMobileTab('canvas')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'canvas' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View A4 Poster</span>
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'editor' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit & Customize</span>
        </button>
      </div>

      {/* ================================================================= */}
      {/* 3. MAIN WORKSPACE                                                 */}
      {/* ================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* --------------------------------------------------------------- */}
        {/* A. PIXEL-PERFECT LIVE A4 CANVAS PREVIEW (100% MATCHES PDF)      */}
        {/* --------------------------------------------------------------- */}
        <div
          className={`flex-1 bg-slate-950/80 p-4 sm:p-6 lg:p-8 flex items-center justify-center overflow-auto custom-scrollbar relative transition-all duration-300 ${
            mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Canvas Wrapper scaled with canvasZoom */}
          <div
            className="relative transition-transform duration-200 shadow-[0_30px_90px_rgba(0,0,0,0.65)] rounded-2xl overflow-hidden border border-white/20 shrink-0"
            style={{
              transform: `scale(${canvasZoom})`,
              transformOrigin: 'center center',
              width: '620px',
              maxWidth: '92vw',
              aspectRatio: '210 / 297',
            }}
          >
            {/* The Actual Rendered Output Canvas */}
            <canvas
              ref={previewCanvasRef}
              className="w-full h-full object-contain block bg-white"
            />

            {/* Rendering spinner indicator */}
            {isRenderingPreview && (
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-white flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>Syncing 300 DPI Canvas</span>
              </div>
            )}
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* B. SLIDING CUSTOMIZER & EDIT DRAWER                             */}
        {/* --------------------------------------------------------------- */}
        {isEditMode && (
          <aside
            className={`w-full lg:w-[460px] xl:w-[490px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-full shrink-0 z-30 transition-all ${
              mobileTab === 'canvas' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Sub-Tabs Navigation */}
            <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1 shrink-0 overflow-x-auto custom-scrollbar">
              {[
                { id: 'templates', label: '50 Templates', icon: Layers },
                { id: 'qr', label: 'QR & Logo', icon: QrCode },
                { id: 'typography', label: 'Text & Sizes', icon: Type },
                { id: 'photo', label: 'Photo', icon: ImageIcon },
                { id: 'background', label: 'Background', icon: Palette },
                { id: 'hosting', label: 'Archival Policy', icon: Info },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-xs border border-slate-200 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-6">
              
              {/* TAB 1: 50 TEMPLATES */}
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', label: 'All (50)' },
                      { id: 'memorial', label: 'Memorial' },
                      { id: 'wedding', label: 'Weddings' },
                      { id: 'corporate', label: 'Corporate' },
                      { id: 'restaurant', label: 'Menus' },
                      { id: 'realestate', label: 'Real Estate' },
                      { id: 'events', label: 'Galas' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search templates (e.g. sunrise, marble, bistro)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Grid of Templates */}
                  <div className="grid grid-cols-2 gap-2.5 max-h-[58vh] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredTemplates.map((tpl) => {
                      const isSelected = selectedTemplate.id === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          onClick={() => handleSelectTemplate(tpl)}
                          className={`text-left p-3 rounded-2xl border transition-all relative flex flex-col justify-between h-28 group overflow-hidden cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md bg-white'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                          }`}
                        >
                          <div
                            className="absolute inset-0 opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity"
                            style={{ background: tpl.bgGradient }}
                          />
                          <div className="relative z-10">
                            <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {tpl.category}
                            </span>
                            <div className="text-xs font-bold text-slate-900 mt-1 leading-snug line-clamp-1">
                              {tpl.name}
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                              {tpl.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: QR CODE & LOGO SIZING / MOVEMENT */}
              {activeTab === 'qr' && (
                <div className="space-y-5">
                  
                  {/* Large QR Code Size Slider */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800">QR Code Size</label>
                      <span className="text-xs font-mono font-bold text-blue-600">{qrSize} px</span>
                    </div>
                    <input
                      type="range"
                      min={800}
                      max={1650}
                      step={25}
                      value={qrSize}
                      onChange={(e) => setQrSize(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Standard (800)</span>
                      <span>Default Large (1360)</span>
                      <span>Max Fill (1650)</span>
                    </div>
                  </div>

                  {/* QR Vertical Position Slider */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Move className="w-3.5 h-3.5 text-blue-600" />
                        <span>Shift QR Card Position (Up / Down)</span>
                      </label>
                      <span className="text-xs font-mono font-bold text-slate-700">{qrCardOffsetY} px</span>
                    </div>
                    <input
                      type="range"
                      min={-250}
                      max={250}
                      step={15}
                      value={qrCardOffsetY}
                      onChange={(e) => setQrCardOffsetY(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Shift Up (-250)</span>
                      <span>Centered (0)</span>
                      <span>Shift Down (+250)</span>
                    </div>
                  </div>

                  {/* QR Center Logo Controls */}
                  <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="text-xs font-bold text-slate-800 block">
                      QR Center Logo & Size
                    </label>
                    <div className="flex items-center gap-3">
                      {centerLogoUrl ? (
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 shrink-0 overflow-hidden">
                          <img src={centerLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400 shrink-0 text-[10px] font-bold">
                          None
                        </div>
                      )}

                      <div className="flex-1 space-y-1">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                          <span>Upload Custom Logo</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                        {centerLogoUrl && (
                          <button
                            onClick={() => setCenterLogoUrl(undefined)}
                            className="block text-[11px] font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>
                    </div>

                    {centerLogoUrl && (
                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                          <span>Logo Scale</span>
                          <span className="font-mono">{Math.round(qrLogoSize * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0.2}
                          max={0.5}
                          step={0.02}
                          value={qrLogoSize}
                          onChange={(e) => setQrLogoSize(Number(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* QR Foreground Color */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">QR Color</span>
                      <span className="text-[11px] text-slate-500">Pick matching brand color</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customQrColor}
                        onChange={(e) => setCustomQrColor(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0"
                      />
                      <span className="text-xs font-mono font-bold text-slate-700 uppercase">
                        {customQrColor}
                      </span>
                    </div>
                  </div>

                  {/* Pattern Style */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">Pattern Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['extra-rounded', 'rounded', 'dots', 'classy', 'square'] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => setQrDotsType(style)}
                          className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-colors capitalize cursor-pointer ${
                            qrDotsType === style
                              ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {style.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TEXT & TYPOGRAPHY SIZING */}
              {activeTab === 'typography' && (
                <div className="space-y-4">
                  
                  {/* Title Font Size Slider */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800">Main Title Size</label>
                      <span className="text-xs font-mono font-bold text-blue-600">{titleFontSize} px</span>
                    </div>
                    <input
                      type="range"
                      min={48}
                      max={110}
                      step={2}
                      value={titleFontSize}
                      onChange={(e) => setTitleFontSize(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Top Badge Banner */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800">Top Badge Banner</label>
                      <button
                        onClick={() => setShowBadge(!showBadge)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                          showBadge ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {showBadge ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                    {showBadge && (
                      <input
                        type="text"
                        value={badgeText}
                        onChange={(e) => setBadgeText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="e.g. IN LOVING MEMORY, OFFICIAL PUBLICATION"
                      />
                    )}
                  </div>

                  {/* Main Header Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">Header Title</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g. In Loving Memory, Annual Report 2026"
                    />
                  </div>

                  {/* Person Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Person Name / Couple / Author
                    </label>
                    <input
                      type="text"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g. Elder Margaret W. Kamau"
                    />
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">Subtitle</label>
                    <textarea
                      rows={2}
                      value={customSubtitle}
                      onChange={(e) => setCustomSubtitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>

                  {/* Memorial Dates */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-950">Memorial Dates</span>
                      <button
                        onClick={() => setShowSunriseSunset(!showSunriseSunset)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                          showSunriseSunset ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {showSunriseSunset ? 'Visible' : 'Hidden'}
                      </button>
                    </div>

                    {showSunriseSunset && (
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] font-semibold text-amber-900 block mb-1">
                            Sunrise (Birth)
                          </label>
                          <input
                            type="text"
                            value={sunriseDate}
                            onChange={(e) => setSunriseDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-medium text-amber-950 focus:outline-none"
                            placeholder="12 Jan 1954"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-amber-900 block mb-1">
                            Sunset (Resting)
                          </label>
                          <input
                            type="text"
                            value={sunsetDate}
                            onChange={(e) => setSunsetDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-medium text-amber-950 focus:outline-none"
                            placeholder="08 Nov 2026"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Note */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800">
                        Bottom Scripture / Venue / Quote
                      </label>
                      <button
                        onClick={() => setShowBottomNote(!showBottomNote)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                          showBottomNote ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {showBottomNote ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                    {showBottomNote && (
                      <textarea
                        rows={2}
                        value={bottomNote}
                        onChange={(e) => setBottomNote(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: PHOTO SIZING & SHAPING */}
              {activeTab === 'photo' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Portrait Photo</h4>
                      <p className="text-[11px] text-slate-500">For eulogies, weddings, or authors.</p>
                    </div>
                    <button
                      onClick={() => setShowPhoto(!showPhoto)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                        showPhoto ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {showPhoto ? 'Visible' : 'Hidden'}
                    </button>
                  </div>

                  {showPhoto && (
                    <>
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                        {photoUrl ? (
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                            <img src={photoUrl} alt="Portrait" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-200 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}

                        <div className="flex-1 space-y-1.5">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                            <Upload className="w-3.5 h-3.5 text-blue-600" />
                            <span>{photoUrl ? 'Replace Photo' : 'Upload Portrait'}</span>
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                          </label>
                          {photoUrl && (
                            <button
                              onClick={() => setPhotoUrl(null)}
                              className="block text-[11px] font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                            >
                              Remove Photo
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Photo Shape */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-800 block">Frame Shape</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'arch', label: 'Church Arch' },
                            { id: 'circle', label: 'Circle' },
                            { id: 'rounded', label: 'Rounded' },
                          ].map((shape) => (
                            <button
                              key={shape.id}
                              onClick={() => setPhotoShape(shape.id as any)}
                              className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-colors cursor-pointer ${
                                photoShape === shape.id
                                  ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {shape.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Photo Size Slider */}
                      <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-800">Photo Size</label>
                          <span className="text-xs font-mono font-bold text-blue-600">{photoSize} px</span>
                        </div>
                        <input
                          type="range"
                          min={240}
                          max={650}
                          step={20}
                          value={photoSize}
                          onChange={(e) => setPhotoSize(Number(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 5: BACKGROUND & CUSTOM UPLOAD WITH TRANSPARENCY SLIDER */}
              {activeTab === 'background' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">Custom Background & Transparency</h4>
                    <p className="text-xs text-slate-500">
                      Upload your own background image and adjust transparency to blend smoothly with the template gradient.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    {customBgUrl ? (
                      <div className="space-y-3">
                        <div className="h-28 rounded-xl overflow-hidden border border-slate-300 relative">
                          <img src={customBgUrl} alt="Custom Background" className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                            {Math.round(customBgOpacity * 100)}% Opacity
                          </div>
                        </div>

                        {/* Transparency Slider */}
                        <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200">
                          <div className="flex justify-between text-xs font-bold text-slate-800">
                            <span>Background Transparency</span>
                            <span className="font-mono text-blue-600">{Math.round(customBgOpacity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min={0.1}
                            max={1.0}
                            step={0.05}
                            value={customBgOpacity}
                            onChange={(e) => setCustomBgOpacity(Number(e.target.value))}
                            className="w-full accent-blue-600 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Subtle Blend (10%)</span>
                            <span>Balanced (60%)</span>
                            <span>Solid (100%)</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setCustomBgUrl(null)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          Clear Custom Background (Use Preset)
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white group">
                        <Upload className="w-7 h-7 text-slate-400 group-hover:text-blue-600 mb-2 transition-colors" />
                        <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                          Click to upload custom A4 flyer graphic
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, or WebP</span>
                        <input type="file" accept="image/*" onChange={handleCustomBgUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: HOSTING & PRO WHITELABEL POLICY */}
              {activeTab === 'hosting' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                      <Info className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Cloud Hosting & Archival Policy</span>
                    </div>
                    <p className="text-xs text-blue-800/90 leading-relaxed">
                      All digital flipbooks are deployed with an active cloud hosting lifecycle. When a document expires, our automated system transitions it to archival storage.
                    </p>
                  </div>

                  {/* Locked for Non-Pro Users */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">
                          Include Archival Notice on Printout
                        </span>
                        {!isProUser && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Pro Only</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {isProUser
                          ? 'Toggle Whizpoint verification notice on printout.'
                          : 'Mandatory on standard plan. Upgrade to Whizpoint Pro to whitelabel.'}
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={isProUser ? showHostingNotice : true}
                      disabled={!isProUser}
                      onChange={(e) => setShowHostingNotice(e.target.checked)}
                      className={`w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 ${
                        !isProUser ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                      }`}
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                    <h5 className="text-xs font-bold text-slate-900">
                      Reserve Permanent Hosting & Custom Domains:
                    </h5>
                    <div className="space-y-1.5 text-xs">
                      <a
                        href="https://wa.me/254754783683"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-emerald-700 font-semibold hover:underline"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp: +254 754 783 683</span>
                      </a>
                      <a
                        href="tel:+254718311345"
                        className="flex items-center gap-2 text-blue-700 font-semibold hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Phone: +254 718 311 345</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Actions inside Drawer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsEditMode(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-center cursor-pointer"
              >
                Done Editing
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={isExportingPDF}
                className="flex-[2] py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingPDF ? 'Generating...' : 'Download A4 PDF'}</span>
              </button>
            </div>
          </aside>
        )}

      </div>

    </div>
  );

  return createPortal(modalContent, document.body);
}
