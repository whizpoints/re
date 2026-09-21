'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRGeneratorModal } from '@/components/qr-generator-modal';
import { toast } from 'react-hot-toast';

interface Document {
  id: string;
  title: string;
  slug: string;
  visibility: string;
  custom_expiry_date: string | null;
  page_count: number;
}

export default function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [qrDoc, setQrDoc] = useState<Document | null>(null);
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
        headers: { 'Authorization': `Bearer ${token}` }
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
    
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file.');
      return;
    }

    setUpdating(targetId);
    setUpdateProgress('Extracting PDF pages...');

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const extractedPages: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        setUpdateProgress(`Extracting page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const scale = 1600 / unscaledViewport.width; // Super crisp 1600px
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        if (context) {
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          extractedPages.push(canvas.toDataURL('image/jpeg', 0.95));
        }
      }

      const token = localStorage.getItem('auth_token');
      const finalPageUrls: string[] = new Array(extractedPages.length);
      let completed = 0;

      const uploadPromises = extractedPages.map(async (pageStr, index) => {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ image: pageStr, folder: `documents/update-${targetId}` })
        });
        if (!res.ok) throw new Error('Failed to upload a page');
        const data = await res.json();
        finalPageUrls[index] = data.url;
        completed++;
        setUpdateProgress(`Uploading page ${completed}/${extractedPages.length}...`);
      });

      await Promise.all(uploadPromises);
      setUpdateProgress('Saving changes...');

      const patchRes = await fetch(`/api/documents/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ pages: finalPageUrls, page_count: numPages })
      });
      if (!patchRes.ok) throw new Error('Failed to update document');

      toast.success('Document updated successfully!');
      fetchDocuments();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update document.');
    } finally {
      setUpdating(null);
      setUpdateProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      updateTargetRef.current = null;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    setDeleting(id);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDocuments(docs => docs.filter(d => d.id !== id));
        toast.success('Document deleted');
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Delete error', error);
      toast.error('An error occurred');
    } finally {
      setDeleting(null);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(search.toLowerCase()) || 
    doc.slug.toLowerCase().includes(search.toLowerCase())
  );

  const totalDocs = documents.length;
  const publicDocs = documents.filter(d => d.visibility === 'Public').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <Link
          href="/admin/upload"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Document
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white rounded-2xl p-3 md:p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-slate-500">Docs</p>
            <p className="text-xl md:text-2xl font-bold text-slate-900">{totalDocs}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-3 md:p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-slate-500">Public</p>
            <p className="text-xl md:text-2xl font-bold text-slate-900">{publicDocs}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 shrink-0">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-slate-500">Storage</p>
            <p className="text-xl md:text-2xl font-bold text-slate-900">{(totalDocs * 2.5).toFixed(1)} MB</p>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800">Recent Documents</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Table */}
        <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleUpdateFile} />
        {updating && (
          <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg font-bold text-slate-900">{updateProgress}</p>
          </div>
        )}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600 whitespace-nowrap">
                  <th className="py-4 px-6 font-medium">Document</th>
                  <th className="py-4 px-6 font-medium">Slug</th>
                  <th className="py-4 px-6 font-medium">Visibility</th>
                  <th className="py-4 px-6 font-medium">Expiry</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 rounded shadow-sm flex-shrink-0 bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                            PDF
                          </div>
                          <span className="font-medium text-slate-900">{doc.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
                        <Link href={`/${doc.slug}`} target="_blank" className="hover:text-blue-600 hover:underline">
                          /{doc.slug}
                        </Link>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doc.visibility === 'Public' ? 'bg-green-100 text-green-700' :
                          doc.visibility === 'Pinned' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {doc.visibility}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
                        {doc.custom_expiry_date ? new Date(doc.custom_expiry_date).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                                                    <button 
                            onClick={() => handleUpdateClick(doc.id)}
                            disabled={updating === doc.id || deleting === doc.id}
                            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50" 
                            title="Update PDF File"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </button>
<button 
                            onClick={() => setQrDoc(doc)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Generate QR Code"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                          </button>
                          <Link href={`/${doc.slug}`} target="_blank" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            disabled={deleting === doc.id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" 
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium text-slate-900 mb-1">No documents found</p>
                        <p className="text-sm">Get started by uploading your first PDF.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {qrDoc && (
        <QRGeneratorModal
          url={typeof window !== 'undefined' ? `${window.location.origin}/${qrDoc.slug}` : `${process.env.NEXT_PUBLIC_APP_URL || 'https://api.whizpoint.app'}/${qrDoc.slug}`}
          documentTitle={qrDoc.title}
          onClose={() => setQrDoc(null)}
        />
      )}
    </div>
  );
}
