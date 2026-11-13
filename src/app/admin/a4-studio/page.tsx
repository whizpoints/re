'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Printer,
  Sparkles,
  BookOpen,
  ArrowRight,
  FileText,
  Search,
  Check,
  Download,
  Info,
  Layers,
} from 'lucide-react';
import { A4PosterStudio } from '@/components/a4-poster-studio';

interface Document {
  id: string;
  title: string;
  slug: string;
  page_count: number;
  logo_url?: string;
  views?: number;
}

export default function AdminA4StudioPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        if (data.documents && data.documents.length > 0) {
          setSelectedDoc(data.documents[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load documents:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/80">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Whizpoint Print & Imposition Engine</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            A4 Print & Standee Studio
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            Generate ultra-crisp 300 DPI A4 posters and table standees for your publications. Choose from over 50 curated templates across Memorials, Weddings, Corporate Galas, Restaurant Menus, and Real Estate showcases with centered vector QR codes and customizable headers.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {selectedDoc && (
            <button
              onClick={() => setIsStudioOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Launch A4 Studio (50 Presets)</span>
            </button>
          )}

          <Link
            href="/admin/upload?type=a4"
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-colors text-center"
          >
            Upload New Document
          </Link>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Document Selection Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Select a Publication to Design
            </h2>
            <p className="text-xs text-slate-500">
              Pick the digital flipbook you want to generate a printable A4 poster for.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search your publications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs">Loading publications...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No documents found</p>
            <p className="text-xs text-slate-500 mt-1">Upload a PDF to get started with A4 posters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-44 relative group ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                        {doc.page_count} Pages
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {doc.title}
                    </h3>

                    <p className="text-xs text-slate-400 font-mono mt-1 truncate">
                      e.whizpoint.app/{doc.slug}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {doc.views || 0} reads recorded
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoc(doc);
                        setIsStudioOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Design A4</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feature Explanations & Temporary Hosting Policy Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Memorial & Eulogy Tributes</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Customize Sunrise (Date of Birth) and Sunset (Date of Resting) dates, upload high-res church arch portraits, and add comforting scripture quotes for funeral services and programs.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-2">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">300 DPI Vector PDF Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every document prints at exact ISO-216 A4 dimensions (2480 × 3508 pixels) with custom Whizpoint metadata properties and vector-sharp QR codes. Ready for any cyber cafe or commercial printing press.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-2">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Cloud Hosting & Archival Notice</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Standard cloud hosting windows keep publications active. Need permanent archival or custom domain binding? Users can reach Whizpoint support directly via WhatsApp (+254 754 783 683) to reserve permanent hosting.
          </p>
        </div>
      </div>

      {/* Full Screen A4 Studio Modal */}
      {isStudioOpen && selectedDoc && (
        <A4PosterStudio
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          documentTitle={selectedDoc.title}
          slug={selectedDoc.slug}
          url={typeof window !== 'undefined' ? `${window.location.origin}/${selectedDoc.slug}` : `https://e.whizpoint.app/${selectedDoc.slug}`}
          initialLogoUrl={selectedDoc.logo_url}
        />
      )}

    </div>
  );
}
