'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isLoading, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 border border-slate-100"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={() => !isLoading && onClose()}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100"
          aria-label="Close"
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center sm:text-left sm:flex-row sm:items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-amber-50 text-amber-600 border border-amber-100'
            }`}
          >
            {isDestructive ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {description && (
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{description}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
