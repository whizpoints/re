'use client'

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { StyledQR } from '@/components/styled-qr';
import { toast } from 'react-hot-toast';

type Step = 'upload' | 'preview' | 'configure' | 'success';

export default function UploadPage() {
  const [step, setStep] = useState<Step>('upload');
  
  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  
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
  const [publishProgress, setPublishProgress] = useState(0);
  const [finalUrl, setFinalUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (f.type !== 'application/pdf') {
      toast.error('Please upload a PDF file.');
      return;
    }
    setFile(f);
    setTitle(f.name.replace(/\.pdf$/i, ''));
    setSlug(f.name.replace(/\.pdf$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    processPdfFile(f);
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

  const [extractedPages, setExtractedPages] = useState<string[]>([]);

  const processPdfFile = async (f: File) => {
    setIsProcessing(true);
    setProgressMsg('Extracting pages...');
    
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const N = numPages * 2;
      const pagesArray: string[] = new Array(N).fill('');
      
      for (let i = 0; i < numPages; i++) {
        setProgressMsg(`Extracting spread ${i + 1} of ${numPages}...`);
        const page = await pdf.getPage(i + 1);
        
        // Normalize width to 1000px to maintain consistent A4-like sizes and avoid huge payloads
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const scale = 3200 / unscaledViewport.width; // Super crisp 1600px per page
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          
          // Split A3 canvas into two A4 canvases (Left and Right)
          const halfWidth = canvas.width / 2;
          const height = canvas.height;
          
          const leftCanvas = document.createElement('canvas');
          leftCanvas.width = halfWidth;
          leftCanvas.height = height;
          leftCanvas.getContext('2d')?.drawImage(canvas, 0, 0, halfWidth, height, 0, 0, halfWidth, height);
          
          const rightCanvas = document.createElement('canvas');
          rightCanvas.width = halfWidth;
          rightCanvas.height = height;
          rightCanvas.getContext('2d')?.drawImage(canvas, halfWidth, 0, halfWidth, height, 0, 0, halfWidth, height);
          
          const leftData = leftCanvas.toDataURL('image/jpeg', 0.95);
          const rightData = rightCanvas.toDataURL('image/jpeg', 0.95);

          // Imposition Logic: Reorder booklet spreads into sequential pages
          if (i % 2 === 0) { // Even spread (e.g. index 0 -> Left: N, Right: 1)
            pagesArray[N - i - 1] = leftData;
            pagesArray[i] = rightData;
          } else { // Odd spread (e.g. index 1 -> Left: 2, Right: N-1)
            pagesArray[i] = leftData;
            pagesArray[N - i - 1] = rightData;
          }
        }
      }
      
      setExtractedPages(pagesArray);
      setStep('preview');
      toast.success('PDF parsed successfully!');
    } catch (error) {
      console.error('PDF extraction failed:', error);
      toast.error('Failed to parse PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const [uploadProgressText, setUploadProgressText] = useState('');

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setUploadProgressText('Initializing upload...');
    
    try {
      const token = localStorage.getItem('auth_token');
      
      // Upload Logo
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

      // Upload Pages individually for accurate progress
      const finalPageUrls: string[] = new Array(extractedPages.length);
      let completed = 0;

      // We do parallel uploads but track progress
            // Parallel upload for maximum speed with progress tracking
      const uploadPromises = extractedPages.map(async (base64, index) => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ image: base64, folder: `documents/${slug}` })
          });
          const data = await res.json();
          if (data.url) {
            finalPageUrls[index] = data.url;
          }
        } catch (e) {
          console.error(`Failed to upload page ${index + 1}`, e);
        } finally {
          completed++;
          setUploadProgressText(`Uploading page ${completed} of ${extractedPages.length}...`);
          setPublishProgress(Math.floor((completed / extractedPages.length) * 8));
        }
      });
      await Promise.all(uploadPromises);

      setUploadProgressText('Finalizing document...');

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          slug,
          visibility,
          customExpiryDate: finalExpiryDate,
          logo_url: finalLogoUrl,
          pages: finalPageUrls, // Already uploaded R2 URLs!
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish document metadata');
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
    setStep('upload');
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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header & Stepper */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Upload Document</h1>
        
        <div className="flex items-center justify-between relative overflow-hidden px-4">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 transition-all duration-500"
            style={{ width: `${(currentIndex / (stepsList.length - 1)) * 100}%` }}
          ></div>
          
          {stepsList.map((s, idx) => {
            const isCompleted = idx < currentIndex;
            const isActive = idx === currentIndex;
            
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors border-2 ${
                  isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                  isActive ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200' : 
                  'bg-white border-slate-300 text-slate-400'
                }`}>
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`text-xs font-medium absolute -bottom-6 w-20 text-center hidden sm:block ${
                  isActive ? 'text-blue-700' : isCompleted ? 'text-green-600' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div 
          className={`mt-12 sm:mt-16 border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center transition-all duration-200 ${
            isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="animate-spin h-10 w-10 text-blue-600 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{progressMsg}</h3>
              <p className="text-slate-500">Preparing {file?.name}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 sm:py-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Drop your A3 PDF here</h3>
              <p className="text-slate-500 mb-8 text-sm sm:text-base">Files must be smaller than 50MB.</p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-white border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm"
              >
                Or click to browse
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-3">
              Preview Extracted Pages
              <span className="bg-blue-100 text-blue-700 text-xs sm:text-sm py-1 px-3 rounded-full font-semibold">{extractedPages.length} pages</span>
            </h2>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button 
                onClick={reset}
                className="flex-1 sm:flex-none px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors border sm:border-transparent"
              >
                Re-upload
              </button>
              <button 
                onClick={() => setStep('configure')}
                className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Looks Good &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {extractedPages.map((pageSrc, i) => (
              <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-slate-200 group bg-slate-50">
                <img src={pageSrc} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-slate-700 shadow-sm">
                  {i + 1}
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
                  <span className="bg-slate-50 px-3 sm:px-4 py-3 text-slate-500 border-r border-slate-200 select-none text-sm sm:text-base">
                    Whizpoint Flipbook.com/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-3 outline-none text-sm sm:text-base"
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
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'Public', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', desc: 'Anyone can view' },
                  { id: 'Pinned', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', desc: 'Featured on home' },
                  { id: 'Unlisted', icon: 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21', desc: 'Hidden from lists' }
                ].map((opt) => (
                  <div 
                    key={opt.id}
                    onClick={() => setVisibility(opt.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      visibility === opt.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <svg className={`w-6 h-6 mb-2 ${visibility === opt.id ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={opt.icon} />
                    </svg>
                    <div className="font-semibold text-slate-900">{opt.id}</div>
                    <div className="text-xs text-slate-500 mt-1">{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">Branding</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Document Logo / Favicon</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    )}
                  </div>
                  <div>
                    <input type="file" id="logoUpload" accept="image/*" onChange={handleLogoSelect} className="hidden" />
                    <label htmlFor="logoUpload" className="inline-block px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm transition-colors">
                      Upload Logo
                    </label>
                    <p className="text-xs text-slate-500 mt-2">Used for QR Code center and document favicon. (1:1 ratio recommended)</p>
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
                    <span className="text-slate-700 text-sm sm:text-base">{exp}</span>
                  </label>
                ))}
              </div>
              {expiry === 'Customized' && (
                <div className="mt-3 animate-in fade-in duration-300">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Custom Date</label>
                  <input
                    type="date"
                    value={customExpiryDate}
                    onChange={(e) => setCustomExpiryDate(e.target.value)}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
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
                Back
              </button>
              
              <button
                type="submit"
                disabled={isPublishing}
                className="w-full sm:w-auto order-1 sm:order-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2 min-w-[200px]"
              >
                {isPublishing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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
        <div className="mt-8 sm:mt-16 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Document Published!</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto text-sm sm:text-base px-4">
            "{title}" has been successfully processed and published. It is now ready to be shared.
          </p>
          
          <div className="max-w-md mx-auto bg-slate-50 p-2 sm:p-4 rounded-xl border border-slate-200 mb-8 flex items-center gap-2 sm:gap-3 mx-4 sm:mx-auto">
            <input 
              type="text" 
              readOnly 
              value={finalUrl} 
              className="flex-1 bg-transparent outline-none text-slate-700 font-medium text-xs sm:text-sm px-2"
            />
            <button 
              onClick={() => { navigator.clipboard.writeText(finalUrl); toast.success('Copied!'); }}
              className="px-3 sm:px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-700 whitespace-nowrap"
            >
              Copy
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
            <button 
              onClick={reset}
              className="w-full sm:w-auto px-6 py-3 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Upload Another
            </button>
            <Link
              href="/admin"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm block"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
