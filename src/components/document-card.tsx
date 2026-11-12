'use client'

import Link from 'next/link';
import { Book, ArrowRight } from 'lucide-react';

interface DocumentCardProps {
  title: string;
  slug: string;
  coverUrl?: string;
  pageCount: number;
  createdAt: string;
  isPinned?: boolean;
}

export function DocumentCard({
  title,
  slug,
  coverUrl,
  pageCount,
  createdAt,
  isPinned,
}: DocumentCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString();
  const docUrl = typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : `${process.env.NEXT_PUBLIC_APP_URL || 'https://e.whizpoint.app'}/${slug}`;

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 block flex flex-col">
      <Link href={`/${slug}`} className="block flex-1">
        <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 relative">
          {coverUrl ? (
            <img src={coverUrl} alt={`${title} cover`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
              <Book className="w-12 h-12 mb-2" />
              <span className="text-sm font-medium">{pageCount} pages</span>
            </div>
          )}
          {isPinned && (
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-bl-lg font-medium">
              Featured
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-slate-900 truncate" title={title}>{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{formattedDate}</p>
        </div>
      </Link>
      <div className="px-3 pb-3 flex items-center justify-between">
        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">
          {pageCount} pages
        </span>
        <div className="flex gap-2 items-center">
          <Link href={`/${slug}`} className="text-blue-600 text-xs font-medium hover:text-blue-700 flex items-center">
            Read <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
