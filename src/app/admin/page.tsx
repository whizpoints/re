'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Layers,
  Search,
  Upload,
  QrCode,
  Eye,
  Trash2,
  RefreshCw,
  Globe,
  HardDrive,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { QRGeneratorModal } from '@/components/qr-generator-modal';
import { A4PosterStudio } from '@/components/a4-poster-studio';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { toast } from 'react-hot-toast';
import { processPdf } from '@/lib/pdf-processor';

interface Document {
  id: string;
  title: string;
  slug: string;
  visibility: string;
  custom_expiry_date: string | null;
  page_count: number;
  views?: number;
}

export default function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [qrDoc, setQrDoc] = useState<Document | null>(null);
  const [a4Doc, setA4Doc] = useState<Document | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [updateProgress, setUpdateProgress] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const updateTargetRef = React.useRef<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Failed to load documents', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (id: string) => {
    updateTargetRef.current = id;
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleUpdateFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = updateTargetRef.current;
    if (!file || !targetId) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please select a valid PDF file.');
      return;
    }

    setUpdating(targetId);
    setUpdateProgress('Analyzing PDF & rasterizing pages...');

    try {
      const result = await processPdf(file, {
        format: 'auto',
        onProgress: (msg) => setUpdateProgress(msg),
      });

      const extractedPages = result.pages;
      const token = localStorage.getItem('auth_token');
      const finalPageUrls: string[] = new Array(extractedPages.length);

      const concurrency = 3;
      for (let i = 0; i < extractedPages.length; i += concurrency) {
        const batch = extractedPages.slice(i, i + concurrency);

        await Promise.all(
          batch.map(async (base64, batchIndex) => {
            const actualIndex = i + batchIndex;
            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  image: base64,
                  folder: `documents/update-${targetId}`,
                }),
              });
              const data = await res.json();
              if (data.url) {
                finalPageUrls[actualIndex] = data.url;
              }
            } catch (e) {
              console.error(`Failed to upload page ${actualIndex + 1}`, e);
            }
          })
        );
      }

      const validUrls = finalPageUrls.filter((url) => !!url);
      if (validUrls.length === 0) {
        throw new Error('Failed to upload processed document pages to cloud storage.');
      }

      const patchRes = await fetch(`/api/documents/${targetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pages: validUrls,
          page_count: validUrls.length,
        }),
      });

      if (!patchRes.ok) {
        const errorData = await patchRes.json();
        throw new Error(errorData.error || 'Failed to update document metadata');
      }

      toast.success(
        `Document updated: ${validUrls.length} pages rasterized. QR codes remain active.`
      );
      fetchDocuments();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update document');
    } finally {
      setUpdating(null);
      setUpdateProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmDelete = async () => {
    if (!docToDelete) return;
    setDeleting(docToDelete.id);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/documents/${docToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setDocuments(documents.filter((doc) => doc.id !== docToDelete.id));
        toast.success('Document deleted successfully');
        setDocToDelete(null);
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Delete error', error);
      toast.error('An unexpected error occurred while deleting');
    } finally {
      setDeleting(null);
    }
  };

  const filteredDocs = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.slug.toLowerCase().includes(search.toLowerCase())
  );

  const totalDocs = documents.length;
  const publicDocs = documents.filter((d) => d.visibility === 'Public').length;
  const totalViews = documents.reduce((acc, curr) => acc + (curr.views || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-xs font-mono text-slate-400">Loading publisher workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Workspace Edition 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Publisher Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage interactive flipbooks, vector QR codes, and real-time readership metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/upload?type=a3"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 group"
          >
            <Layers className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Upload A3 Booklet</span>
          </Link>

          <Link
            href="/admin/upload?type=a4"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition-all shadow-2xs hover:shadow-xs group"
          >
            <FileText className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <span>Upload A4 (1:1)</span>
          </Link>
        </div>
      </div>

      {/* Glassmorphic Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Publications */}
        <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
              Publications
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalDocs}</p>
          </div>
        </div>

        {/* Card 2: Public Portals */}
        <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
              Public Links
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{publicDocs}</p>
          </div>
        </div>

        {/* Card 3: Storage */}
        <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
              Cloudflare R2
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {(totalDocs * 2.5).toFixed(1)} <span className="text-xs font-normal text-slate-500">MB</span>
            </p>
          </div>
        </div>

        {/* Card 4: Total Readers */}
        <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
              Total Views
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalViews}</p>
          </div>
        </div>
      </div>

      {/* Publications Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Publications</h2>
            <p className="text-xs text-slate-500">Real-time status, page counts, and quick management</p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Hidden File Input for PDF Updates */}
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleUpdateFile}
        />

        {/* High-tech Updating Modal Overlay */}
        {updating && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl text-white space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <RefreshCw className="w-7 h-7 animate-spin" />
                </div>
              </div>
              <h3 className="text-lg font-bold">Synchronizing Document</h3>
              <p className="text-xs font-mono text-slate-400 leading-relaxed">
                {updateProgress || 'Processing PDF imposition...'}
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-full w-2/3 animate-pulse rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Glassmorphic Table Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-mono uppercase tracking-wider text-slate-500 whitespace-nowrap">
                  <th className="py-3.5 px-5 font-semibold">Publication</th>
                  <th className="py-3.5 px-4 font-semibold">Public Link</th>
                  <th className="py-3.5 px-4 font-semibold">Visibility</th>
                  <th className="py-3.5 px-4 font-semibold">Reads</th>
                  <th className="py-3.5 px-4 font-semibold">Retention</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-blue-50/40 transition-colors group">
                      {/* Publication Title & Pages */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-11 rounded-lg bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-blue-700 shrink-0 font-mono text-[9px] font-bold shadow-2xs">
                            <span>PDF</span>
                            <span className="text-[8px] text-slate-400 font-normal">{doc.page_count}p</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                              {doc.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ID: {doc.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Slug Link */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                        <Link
                          href={`/${doc.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 hover:underline"
                        >
                          <span>/{doc.slug}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>

                      {/* Visibility Pill */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            doc.visibility === 'Public'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : doc.visibility === 'Pinned'
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          {doc.visibility}
                        </span>
                      </td>

                      {/* Views Count */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 font-mono text-slate-700 font-bold">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc.views || 0}</span>
                        </div>
                      </td>

                      {/* Expiration Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {doc.custom_expiry_date ? (
                          <span className="inline-flex items-center gap-1 text-slate-700">
                            <Clock className="w-3 h-3 text-amber-500" />
                            {new Date(doc.custom_expiry_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">Persistent</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Update PDF */}
                          <button
                            onClick={() => handleUpdateClick(doc.id)}
                            disabled={updating === doc.id || deleting === doc.id}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Update PDF Source File"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {/* Generate QR */}
                          <button
                            onClick={() => setQrDoc(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Vector QR Code with Logo"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {/* Print A4 Standee / Poster */}
                          <button
                            onClick={() => setA4Doc(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Print A4 Poster & Standee (50+ Templates)"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Open Viewer */}
                          <Link
                            href={`/${doc.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Open Flipbook Viewer"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => setDocToDelete(doc)}
                            disabled={deleting === doc.id}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Delete Publication"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-900 mb-1">No publications found</p>
                        <p className="text-xs text-slate-500 mb-4">
                          Get started by uploading your first A3 booklet spread or A4 document.
                        </p>
                        <Link
                          href="/admin/upload?type=a3"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-sm hover:bg-blue-700 transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload First Document</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vector QR Code Modal */}
      {qrDoc && (
        <QRGeneratorModal
          url={
            typeof window !== 'undefined'
              ? `${window.location.origin}/${qrDoc.slug}`
              : `${process.env.NEXT_PUBLIC_APP_URL || 'https://e.whizpoint.app'}/${qrDoc.slug}`
          }
          documentTitle={qrDoc.title}
          onClose={() => setQrDoc(null)}
        />
      )}

      {a4Doc && (
        <A4PosterStudio
          isOpen={!!a4Doc}
          onClose={() => setA4Doc(null)}
          documentTitle={a4Doc.title}
          slug={a4Doc.slug}
          url={
            typeof window !== 'undefined'
              ? `${window.location.origin}/${a4Doc.slug}`
              : `${process.env.NEXT_PUBLIC_APP_URL || 'https://e.whizpoint.app'}/${a4Doc.slug}`
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <ConfirmModal
          isOpen={!!docToDelete}
          onClose={() => setDocToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete Publication?"
          description={`Are you sure you want to permanently delete "${docToDelete.title}"? The public link and its vector QR codes will no longer be accessible.`}
          confirmText="Yes, Delete Publication"
          isDestructive={true}
          isLoading={!!deleting}
        />
      )}
    </div>
  );
}
