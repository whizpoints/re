'use client'

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { BookOpen, FileText, Sparkles, UploadCloud, ArrowRight, RotateCcw, Check, CheckCircle2, Shield, Eye, Calendar, Image as ImageIcon } from 'lucide-react';
import { processPdf, DocumentFormatMode } from '@/lib/pdf-processor';

type Step = 'upload' | 'preview' | 'configure' | 'success';

function UploadContent() {
  const searchParams = useSearchParams();
  const formatParam = searchParams.get('type') || searchParams.get('format');
  
  const [step, setStep] = useState<Step>('upload');
  const [docFormat, setDocFormat] = useState<DocumentFormatMode>(
    formatParam === 'a4' ? 'a4-direct' : formatParam === 'a3' ? 'a3-booklet' : 'auto'
  );
  const [detectedFormat, setDetectedFormat] = useState<'a3-booklet' | 'a4-direct' | null>(null);
  const [originalSheetCount, setOriginalSheetCount] = useState<number>(0);
  
  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  
  // Extracted pages (Base64)
  const [extractedPages, setExtractedPages] = useState<string[]>([]);
  
  // Configure State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [expiry, setExpiry] = useState('5 Days');
  const [customExpiryDate, setCustomExpiryDate] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [addPdfExt, setAddPdfExt] = useState(false);
  
  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [publishProgress, setPublishProgress] = useState(0);
  const [finalUrl, setFinalUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync format if query param changes
  useEffect(() => {
    if (formatParam === 'a4') {
      setDocFormat('a4-direct');
    } else if (formatParam === 'a3') {
      setDocFormat('a3-booklet');
    }
  }, [formatParam]);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && step === 'configure') {
      const generated = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  }, [title, step]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => setIsDragging(false);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (f: File) => {
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF file.');
      return;
    }
    setFile(f);
    const cleanName = f.name.replace(/\.pdf$/i, '');
    setTitle(cleanName);
    setSlug(cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    processPdfFile(f, docFormat);
  };

  const processPdfFile = async (f: File, chosenMode: DocumentFormatMode) => {
    setIsProcessing(true);
    setProgressMsg('Analyzing and parsing PDF...');
    
    try {
      const result = await processPdf(f, {
        format: chosenMode,
        onProgress: (msg) => setProgressMsg(msg)
      });
      
      setExtractedPages(result.pages);
      setDetectedFormat(result.detectedFormat);
      setOriginalSheetCount(result.originalSheetCount);
      setStep('preview');

      if (result.detectedFormat === 'a3-booklet') {
        toast.success(`A3 Booklet parsed: ${result.originalSheetCount} spreads split into ${result.pages.length} sequential A4 pages!`);
      } else {
        toast.success(`Standard A4 parsed: ${result.pages.length} pages extracted directly 1:1!`);
      }
    } catch (error: any) {
      console.error('PDF extraction failed:', error);
      toast.error(error.message || 'Failed to parse PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setLogoPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractedPages.length) {
      toast.error('No pages to publish.');
      return;
    }

    setIsPublishing(true);
    setUploadProgressText('Initializing upload...');
    setPublishProgress(0);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      // Upload Logo if provided
      let finalLogoUrl = logoPreview;
      if (logoPreview && logoPreview.startsWith('data:image')) {
        setUploadProgressText('Uploading logo...');
        const logoRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ image: logoPreview, folder: `logos/${slug}` })
        });
        if (logoRes.ok) {
          const logoData = await logoRes.json();
          finalLogoUrl = logoData.url;
        }
      }

      // Compute expiry date
      let finalExpiryDate = null;
      if (expiry === 'Customized' && customExpiryDate) {
        finalExpiryDate = customExpiryDate;
      } else if (expiry === '5 Days') {
        const d = new Date(); d.setDate(d.getDate() + 5);
        finalExpiryDate = d.toISOString();
      } else if (expiry === '1 Month') {
        const d = new Date(); d.setMonth(d.getMonth() + 1);
        finalExpiryDate = d.toISOString();
      } else if (expiry === '1 Year') {
        const d = new Date(); d.setFullYear(d.getFullYear() + 1);
        finalExpiryDate = d.toISOString();
      }

      // Upload Pages individually with concurrency
      const finalPageUrls: string[] = new Array(extractedPages.length);
      let completed = 0;
      const concurrency = 3;

      for (let i = 0; i < extractedPages.length; i += concurrency) {
        const batch = extractedPages.slice(i, i + concurrency);
        
        await Promise.all(batch.map(async (base64, batchIndex) => {
          const actualIndex = i + batchIndex;
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ image: base64, folder: `documents/${slug}` })
            });
            const data = await res.json();
            if (data.url) {
              finalPageUrls[actualIndex] = data.url;
            }
          } catch (e) {
            console.error(`Failed to upload page ${actualIndex + 1}`, e);
          } finally {
            completed++;
            setUploadProgressText(`Uploading page ${completed} of ${extractedPages.length}...`);
            setPublishProgress(Math.floor((completed / extractedPages.length) * 100));
          }
        }));
      }

      setUploadProgressText('Finalizing document...');

      const finalSlug = addPdfExt && !slug.endsWith('.pdf') ? `${slug}.pdf` : slug;

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          slug: finalSlug,
          visibility,
          customExpiryDate: finalExpiryDate,
          logo_url: finalLogoUrl,
          pages: finalPageUrls.filter(Boolean),
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish document');
      }

      setFinalUrl(`${window.location.origin}/${data.document.slug}`);
      setStep('success');
      toast.success('Document published successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsPublishing(false);
      setUploadProgressText('');
    }
  };

  const reset = () => {
    setFile(null);
    setTitle('');
    setSlug('');
    setExtractedPages([]);
    setDetectedFormat(null);
    setStep('upload');
  };

  const reprocessWithFormat = (newFormat: DocumentFormatMode) => {
    setDocFormat(newFormat);
    if (file) {
      processPdfFile(file, newFormat);
    }
  };

  // UI Helpers
  const stepsList = [
    { id: 'upload', label: 'Upload' },
    { id: 'preview', label: 'Preview' },
    { id: 'configure', label: 'Configure' },
    { id: 'success', label: 'Published' }
  ];
  
  const getStepIndex = (s: Step) => stepsList.findIndex(x => x.id === s);
  const currentIndex = getStepIndex(step);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 font-sans">
      {/* Header & Stepper */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Upload Document</h1>
            <p className="text-sm text-slate-500 mt-1">
              Convert print booklets (A3 spreads) or standard multi-page documents (A4) into interactive digital flipbooks.
            </p>
          </div>
          <Link
            href="/admin"
            className="self-start sm:self-auto text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
        
        <div className="flex items-center justify-between relative overflow-hidden px-4 mt-6">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0 transition-all duration-500"
            style={{ width: `${(currentIndex / (stepsList.length - 1)) * 100}%` }}
          ></div>
          
          {stepsList.map((s, idx) => {
            const isCompleted = idx < currentIndex;
            const isActive = idx === currentIndex;
            
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors border-2 ${
                  isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 
                  isActive ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200' : 
                  'bg-white border-slate-300 text-slate-400'
                }`}>
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`text-xs font-medium absolute -bottom-6 w-20 text-center hidden sm:block ${
                  isActive ? 'text-blue-700 font-semibold' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="mt-12 sm:mt-14 space-y-6">
          {/* Format Selection Selector */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <label className="block text-sm font-semibold text-slate-800 mb-3">
              Select Document Formatting Mode:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDocFormat('auto')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  docFormat === 'auto'
                    ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${docFormat === 'auto' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Auto-Detect</div>
                  <div className="text-xs text-slate-500 mt-0.5">Detects A3 spreads vs A4 pages automatically by page dimensions</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDocFormat('a3-booklet')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  docFormat === 'a3-booklet'
                    ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${docFormat === 'a3-booklet' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">A3 Booklet (Spreads)</div>
                  <div className="text-xs text-slate-500 mt-0.5">Splits landscape 2-page spreads into individual A4 pages with imposition</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDocFormat('a4-direct')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  docFormat === 'a4-direct'
                    ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${docFormat === 'a4-direct' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Standard A4 (1:1 Direct)</div>
                  <div className="text-xs text-slate-500 mt-0.5">Uploads single pages directly without cutting or splitting in half</div>
                </div>
              </button>
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div 
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-14 text-center transition-all duration-200 bg-white ${
              isDragging ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/70 shadow-sm'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{progressMsg}</h3>
                <p className="text-slate-500 text-sm">Formatting pages into high-resolution images...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm border border-blue-100">
                  <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                  {docFormat === 'a3-booklet' ? 'Drop your A3 Booklet PDF here' : docFormat === 'a4-direct' ? 'Drop your Standard A4 PDF here' : 'Drop your PDF here'}
                </h3>
                <p className="text-slate-500 mb-6 text-sm sm:text-base max-w-md">
                  {docFormat === 'a3-booklet' 
                    ? 'Booklet spreads will be split into sequential A4 pages automatically.' 
                    : docFormat === 'a4-direct'
                    ? 'All pages will be preserved 1:1 directly without splitting in half.'
                    : 'We automatically detect whether your PDF is an A3 booklet spread or standard A4 document.'}
                </p>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,application/pdf" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-md shadow-blue-200"
                >
                  Browse PDF File
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-slate-900">Extracted Pages Preview</h2>
                  <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold">
                    {extractedPages.length} Pages
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {detectedFormat === 'a3-booklet' ? (
                    <span className="text-emerald-700 font-medium">
                      ✓ A3 Booklet Mode: {originalSheetCount} sheets split and imposed into {extractedPages.length} sequential A4 pages
                    </span>
                  ) : (
                    <span className="text-blue-700 font-medium">
                      ✓ Standard A4 Mode: {extractedPages.length} pages preserved 1:1 directly
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => reprocessWithFormat(detectedFormat === 'a3-booklet' ? 'a4-direct' : 'a3-booklet')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {detectedFormat === 'a3-booklet' ? 'Switch to A4 Direct (No Split)' : 'Switch to A3 Booklet (Split Spreads)'}
                </button>
                <button 
                  onClick={reset}
                  className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  Re-upload
                </button>
                <button 
                  onClick={() => setStep('configure')}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  Looks Good <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {extractedPages.map((pageSrc, i) => (
              <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-slate-200 group bg-slate-50">
                <img src={pageSrc} alt={`Page ${i + 1}`} className="w-full h-full object-contain bg-white" />
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs font-bold shadow-sm">
                  Page {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Configure */}
      {step === 'configure' && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
          <form onSubmit={handlePublish} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">Document Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Custom URL Slug</label>
                <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="bg-slate-50 px-3 sm:px-4 py-3 text-slate-500 border-r border-slate-200 select-none text-sm">
                    flipbook/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-3 outline-none text-sm font-medium text-slate-800"
                    required
                  />
                </div>
                <div className="mt-2 flex items-center">
                  <input 
                    type="checkbox" 
                    id="addExt" 
                    checked={addPdfExt} 
                    onChange={(e) => setAddPdfExt(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <label htmlFor="addExt" className="ml-2 text-sm text-slate-600">Append .pdf extension to URL</label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">Visibility & Access</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'Public', title: 'Public', desc: 'Listed in gallery' },
                  { id: 'Pinned', title: 'Pinned', desc: 'Featured on top' },
                  { id: 'Unlisted', title: 'Unlisted', desc: 'Only via direct link' }
                ].map((opt) => (
                  <div 
                    key={opt.id}
                    onClick={() => setVisibility(opt.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      visibility === opt.id ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 text-sm">{opt.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">Branding</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Document Logo / Favicon (Optional)</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <input type="file" id="logoUpload" accept="image/*" onChange={handleLogoSelect} className="hidden" />
                    <label htmlFor="logoUpload" className="inline-block px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm transition-colors">
                      Upload Logo
                    </label>
                    <p className="text-xs text-slate-500 mt-1">Embedded in QR code center and browser tab favicon.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">Auto-Expiry</h3>
              
              <div className="flex flex-wrap gap-4">
                {['5 Days', '1 Month', '1 Year', 'Never', 'Customized'].map(exp => (
                  <label key={exp} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="expiry" 
                      checked={expiry === exp}
                      onChange={() => setExpiry(exp)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 text-sm">{exp}</span>
                  </label>
                ))}
              </div>
              {expiry === 'Customized' && (
                <div className="mt-3 animate-in fade-in duration-300">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Custom Expiry Date</label>
                  <input
                    type="date"
                    value={customExpiryDate}
                    onChange={(e) => setCustomExpiryDate(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button 
                type="button" 
                onClick={() => setStep('preview')}
                className="w-full sm:w-auto px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors order-2 sm:order-1"
                disabled={isPublishing}
              >
                Back to Preview
              </button>
              
              <button
                type="submit"
                disabled={isPublishing}
                className="w-full sm:w-auto order-1 sm:order-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-md shadow-blue-200 disabled:opacity-70 flex items-center justify-center gap-2 min-w-[200px]"
              >
                {isPublishing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {uploadProgressText || 'Publishing...'}
                  </>
                ) : (
                  'Publish Document'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 'success' && (
        <div className="mt-8 sm:mt-16 text-center animate-in zoom-in-95 duration-500 max-w-lg mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-5 text-emerald-600">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Document Published!</h2>
          <p className="text-slate-600 mb-6 text-sm">
            <span className="font-semibold text-slate-800">"{title}"</span> is live with all {extractedPages.length} pages in {detectedFormat === 'a3-booklet' ? 'A3 Booklet format' : 'Standard A4 format'}.
          </p>
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-6 flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={finalUrl} 
              className="flex-1 bg-transparent outline-none text-slate-700 font-medium text-xs sm:text-sm px-2 select-all"
            />
            <button 
              onClick={() => { navigator.clipboard.writeText(finalUrl); toast.success('Link copied!'); }}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm text-slate-700 whitespace-nowrap"
            >
              Copy Link
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
            >
              Open Live Flipbook &rarr;
            </a>
            <button 
              onClick={reset}
              className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Loading upload studio...</p>
      </div>
    }>
      <UploadContent />
    </Suspense>
  );
}
