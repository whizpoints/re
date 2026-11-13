'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Download,
  Printer,
  Sparkles,
  Search,
  Upload,
  Calendar,
  Layers,
  Sliders,
  Maximize2,
  FileText,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Info,
  Phone,
  MessageSquare,
} from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';
import { A4_TEMPLATES, A4Template, TemplateCategory } from '@/lib/templates/a4-templates';
import {
  A4PosterData,
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
}

export function A4PosterStudio({
  isOpen,
  onClose,
  documentTitle,
  slug,
  url,
  initialLogoUrl,
}: A4PosterStudioProps) {
  // Active Tab
  const [activeTab, setActiveTab] = useState<'templates' | 'content' | 'photo' | 'background' | 'hosting'>('templates');

  // Selected Template
  const [selectedTemplate, setSelectedTemplate] = useState<A4Template>(A4_TEMPLATES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Customizable Fields
  const [customTitle, setCustomTitle] = useState(documentTitle || A4_TEMPLATES[0].defaultTitle);
  const [customSubtitle, setCustomSubtitle] = useState(A4_TEMPLATES[0].defaultSubtitle);
  const [badgeText, setBadgeText] = useState(A4_TEMPLATES[0].badgeText);
  const [personName, setPersonName] = useState('');
  const [sunriseDate, setSunriseDate] = useState('12 Jan 1954');
  const [sunsetDate, setSunsetDate] = useState('08 Nov 2026');
  const [bottomNote, setBottomNote] = useState(A4_TEMPLATES[0].defaultBottomNote);
  const [showHostingNotice, setShowHostingNotice] = useState(true);

  // Photo
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoShape, setPhotoShape] = useState<'circle' | 'arch' | 'rounded' | 'none'>('arch');

  // Custom Background
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);

  // Center Logo
  const [centerLogoUrl, setCenterLogoUrl] = useState<string | undefined>(initialLogoUrl);

  // Loading States
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // QR Code Instance & Data URL
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Generate QR Code data URL when url, color, or logo changes
  useEffect(() => {
    if (!isOpen) return;

    const qr = new QRCodeStyling({
      width: 1200,
      height: 1200,
      type: 'canvas',
      data: url,
      margin: 15,
      image: centerLogoUrl || '/logo.png',
      dotsOptions: {
        color: selectedTemplate.qrColor || '#0f172a',
        type: 'extra-rounded',
      },
      cornersSquareOptions: {
        color: selectedTemplate.qrColor || '#0f172a',
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        color: selectedTemplate.qrColor || '#0f172a',
        type: 'dot',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10,
        imageSize: 0.38,
      },
      backgroundOptions: {
        color: '#ffffff',
      },
    });

    qrCodeInstance.current = qr;

    // Render to invisible container to grab dataURL
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qr.append(qrRef.current);

      // Give canvas a frame to render
      setTimeout(() => {
        const canvas = qrRef.current?.querySelector('canvas') as HTMLCanvasElement;
        if (canvas) {
          setQrDataUrl(canvas.toDataURL('image/png'));
        }
      }, 100);
    }
  }, [isOpen, url, selectedTemplate.qrColor, centerLogoUrl]);

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

  // Template switch handler
  const handleSelectTemplate = (tpl: A4Template) => {
    setSelectedTemplate(tpl);
    setBadgeText(tpl.badgeText);
    setCustomTitle(tpl.defaultTitle);
    setCustomSubtitle(tpl.defaultSubtitle);
    setBottomNote(tpl.defaultBottomNote);
  };

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
        if (photoShape === 'none') setPhotoShape('arch');
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

  // Build payload
  const buildPosterData = (): A4PosterData => ({
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
    photoUrl,
    photoShape,
    customBgUrl,
    qrDataUrl,
    showHostingNotice,
  });

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      {/* Hidden container for QR canvas generation */}
      <div ref={qrRef} className="hidden" />

      {/* Main Studio Frame */}
      <div className="bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-7xl h-[96vh] flex flex-col overflow-hidden">
        
        {/* Top Control Bar */}
        <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Whizpoint A4 Print & Standee Studio
                </h2>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  ISO-216 300 DPI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-xs md:max-w-md">
                Publishing Standee for: <span className="font-semibold text-slate-700">{documentTitle}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              title="Send to physical printer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isPrinting ? 'Preparing...' : 'Print Direct'}</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={isExportingPNG}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Poster PNG</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPDF ? 'Generating...' : 'Download A4 PDF'}</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Studio Workspace: Split Layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* LEFT: Live WYSIWYG A4 Canvas Preview */}
          <div className="flex-1 bg-slate-200/70 p-4 sm:p-6 lg:p-8 flex items-center justify-center overflow-y-auto custom-scrollbar relative">
            <div className="w-full max-w-[480px] lg:max-w-[440px] xl:max-w-[490px] aspect-[210/297] bg-white rounded-2xl shadow-2xl border border-slate-300/80 relative overflow-hidden flex flex-col justify-between p-6 sm:p-7 select-none transition-all duration-300"
              style={{
                background: customBgUrl
                  ? `url(${customBgUrl}) center / cover no-repeat`
                  : selectedTemplate.bgGradient,
              }}
            >
              {/* Outer Decorative Inset Border */}
              <div
                className="absolute inset-2 sm:inset-3 border rounded-xl pointer-events-none"
                style={{
                  borderColor: selectedTemplate.accentColor,
                  opacity: 0.35,
                }}
              />
              <div
                className="absolute inset-3 sm:inset-4 border rounded-lg pointer-events-none"
                style={{
                  borderColor: selectedTemplate.accentColor,
                  opacity: 0.18,
                }}
              />

              {/* Top Section */}
              <div className="relative z-10 text-center space-y-2 mt-1">
                {badgeText && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase border shadow-2xs"
                    style={{
                      backgroundColor: `${selectedTemplate.accentColor}18`,
                      borderColor: selectedTemplate.accentColor,
                      color: selectedTemplate.accentColor,
                    }}
                  >
                    <span>{badgeText}</span>
                  </div>
                )}

                <h1
                  className={`text-lg sm:text-xl font-bold leading-tight px-2 ${
                    selectedTemplate.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                  }`}
                  style={{ color: selectedTemplate.titleColor }}
                >
                  {customTitle}
                </h1>

                {personName && (
                  <p
                    className="text-sm sm:text-base font-bold italic"
                    style={{ color: selectedTemplate.accentColor }}
                  >
                    {personName}
                  </p>
                )}

                <p
                  className="text-[10px] sm:text-xs leading-relaxed max-w-[90%] mx-auto"
                  style={{ color: selectedTemplate.subtitleColor }}
                >
                  {customSubtitle}
                </p>

                {/* Portrait Photo (if enabled) */}
                {photoUrl && photoShape !== 'none' && (
                  <div className="flex justify-center pt-1">
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border-2 shadow-md bg-white ${
                        photoShape === 'circle'
                          ? 'rounded-full'
                          : photoShape === 'arch'
                          ? 'rounded-t-full rounded-b-lg'
                          : 'rounded-xl'
                      }`}
                      style={{ borderColor: selectedTemplate.accentColor }}
                    >
                      <img src={photoUrl} alt="Portrait" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              {/* Center: High-Res QR Hero Card */}
              <div className="relative z-10 my-auto flex flex-col items-center">
                <div
                  className="p-3.5 sm:p-4 rounded-2xl shadow-xl border flex flex-col items-center max-w-[240px] sm:max-w-[270px] w-full"
                  style={{
                    backgroundColor: selectedTemplate.cardBg,
                    borderColor: selectedTemplate.cardBorder,
                  }}
                >
                  <span
                    className="text-[8px] sm:text-[9px] font-bold tracking-wider uppercase mb-1.5"
                    style={{ color: selectedTemplate.accentColor }}
                  >
                    ⚡ Point Camera to Read
                  </span>

                  {qrDataUrl ? (
                    <div className="w-36 h-36 sm:w-44 sm:h-44 bg-white p-1 rounded-xl shadow-2xs">
                      <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-36 h-36 sm:w-44 sm:h-44 bg-slate-100 animate-pulse rounded-xl" />
                  )}

                  <div className="mt-2 px-2.5 py-1 rounded-full bg-slate-900/5 border border-slate-900/10 text-[9px] font-mono font-bold text-slate-800 truncate max-w-full">
                    {url.replace(/^https?:\/\//, '')}
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="relative z-10 text-center space-y-1.5 mb-1">
                {/* Memorial Sunrise & Sunset */}
                {(selectedTemplate.category === 'memorial' || selectedTemplate.showSunriseSunset) && (
                  <div
                    className="text-[10px] sm:text-xs font-bold tracking-wide flex items-center justify-center gap-3"
                    style={{ color: selectedTemplate.accentColor }}
                  >
                    <span>🌅 Sunrise: {sunriseDate}</span>
                    <span>•</span>
                    <span>🌇 Sunset: {sunsetDate}</span>
                  </div>
                )}

                {bottomNote && (
                  <p
                    className="text-[9px] sm:text-[10px] italic max-w-[92%] mx-auto line-clamp-2"
                    style={{ color: selectedTemplate.textColor }}
                  >
                    {bottomNote}
                  </p>
                )}

                {/* Whizpoint Archival & Temporary Hosting Notice */}
                {showHostingNotice && (
                  <div className="pt-2 border-t border-slate-400/25 mt-2 space-y-0.5">
                    <p className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wider text-slate-600">
                      Whizpoint Flipbook Digital Engine • Official Publication
                    </p>
                    <p className="text-[7px] sm:text-[7.5px] text-slate-500 leading-tight">
                      Active Cloud Hosting Window. For Permanent Archival or Re-Hosting inquiries: WhatsApp +254 754 783 683 • support@whizpoint.app
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Studio Control & Customization Tabs */}
          <div className="w-full lg:w-[460px] xl:w-[500px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-auto lg:h-full shrink-0">
            
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 shrink-0 overflow-x-auto">
              {[
                { id: 'templates', label: '50 Templates', icon: Layers },
                { id: 'content', label: 'Text & Details', icon: Sliders },
                { id: 'photo', label: 'Photo', icon: ImageIcon },
                { id: 'background', label: 'Background', icon: Sparkles },
                { id: 'hosting', label: 'Hosting Policy', icon: Info },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body (Scrollable) */}
            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-5">
              
              {/* TAB 1: 50 TEMPLATES */}
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', label: 'All (50)' },
                      { id: 'memorial', label: 'Memorial & Life' },
                      { id: 'wedding', label: 'Weddings' },
                      { id: 'corporate', label: 'Corporate & Reports' },
                      { id: 'restaurant', label: 'Menus & Cafes' },
                      { id: 'realestate', label: 'Real Estate' },
                      { id: 'events', label: 'Galas & Events' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search templates (e.g. sunrise, marble, bistro, cross)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Template Grid */}
                  <div className="grid grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredTemplates.map((tpl) => {
                      const isSelected = selectedTemplate.id === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          onClick={() => handleSelectTemplate(tpl)}
                          className={`text-left p-3 rounded-2xl border transition-all relative flex flex-col justify-between h-28 group overflow-hidden ${
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
                            <div className="text-xs font-bold text-slate-900 mt-1.5 leading-snug line-clamp-1">
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

              {/* TAB 2: TEXT & DETAILS */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Top Badge Banner
                    </label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g. IN LOVING MEMORY, OFFICIAL PUBLICATION"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Main Header Title
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g. In Loving Memory, Annual Report 2026"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Person Name / Couple / Author (Optional)
                    </label>
                    <input
                      type="text"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g. Elder Margaret W. Kamau"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Subtitle / Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={customSubtitle}
                      onChange={(e) => setCustomSubtitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>

                  {/* Memorial Dates */}
                  {(selectedTemplate.category === 'memorial' || selectedTemplate.showSunriseSunset) && (
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                      <div>
                        <label className="text-[11px] font-semibold text-amber-900 flex items-center gap-1 mb-1">
                          🌅 Sunrise (Birth)
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
                        <label className="text-[11px] font-semibold text-amber-900 flex items-center gap-1 mb-1">
                          🌇 Sunset (Resting)
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

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Bottom Note / Memorial Scripture / Venue
                    </label>
                    <textarea
                      rows={2}
                      value={bottomNote}
                      onChange={(e) => setBottomNote(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: PHOTO & PORTRAIT */}
              {activeTab === 'photo' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">Portrait or Ceremony Photo</h4>
                    <p className="text-xs text-slate-500">
                      Upload a photo of the deceased, wedding couple, keynote speaker, or venue for the A4 poster.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
                    {photoUrl ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                        <img src={photoUrl} alt="Uploaded" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-200/70 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>{photoUrl ? 'Replace Photo' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>

                      {photoUrl && (
                        <button
                          onClick={() => setPhotoUrl(null)}
                          className="block text-[11px] font-semibold text-red-600 hover:text-red-700"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>

                  {photoUrl && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 block">Frame Shape</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'arch', label: 'Church Arch' },
                          { id: 'circle', label: 'Circle' },
                          { id: 'rounded', label: 'Rounded' },
                          { id: 'none', label: 'Hidden' },
                        ].map((shape) => (
                          <button
                            key={shape.id}
                            onClick={() => setPhotoShape(shape.id as any)}
                            className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-colors ${
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
                  )}
                </div>
              )}

              {/* TAB 4: BACKGROUND & CUSTOM UPLOAD */}
              {activeTab === 'background' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">Custom Background Graphic</h4>
                    <p className="text-xs text-slate-500">
                      Already have an A4 background flyer designed by your graphics team? Upload it here and our system will overlay the high-res QR code and metadata on top.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                    {customBgUrl ? (
                      <div className="space-y-2">
                        <div className="h-28 rounded-xl overflow-hidden border border-slate-300">
                          <img src={customBgUrl} alt="Custom Background" className="w-full h-full object-cover" />
                        </div>
                        <button
                          onClick={() => setCustomBgUrl(null)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700"
                        >
                          Clear Custom Background (Use Preset)
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white group">
                        <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600 mb-2 transition-colors" />
                        <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                          Click to upload custom A4 background
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, or WebP</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCustomBgUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: HOSTING POLICY & PERMANENT ARCHIVAL */}
              {activeTab === 'hosting' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                      <Info className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Temporary Hosting & Archival Policy</span>
                    </div>
                    <p className="text-xs text-blue-800/90 leading-relaxed">
                      By default, all digital flipbooks are provisioned with an active temporary cloud hosting window. When a document expires, our automated system schedules it for archiving.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white">
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">
                        Include Archival Notice on Printout
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Shows hosting status and contact for permanent retention.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showHostingNotice}
                      onChange={(e) => setShowHostingNotice(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <h5 className="text-xs font-bold text-slate-900">
                      Need Permanent Archival Hosting?
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Contact Whizpoint Solutions to lock in permanent 10-year archival hosting or custom domains for your publication:
                    </p>

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
                        <span>Phone / Call: +254 718 311 345</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={isExportingPDF}
                className="flex-[2] py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingPDF ? 'Generating PDF...' : 'Download A4 PDF (300 DPI)'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
