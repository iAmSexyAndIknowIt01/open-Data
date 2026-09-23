'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface CommonModalProps {
  isOpen: boolean;
  type?: 'success' | 'error';
  title?: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
}

export default function CommonModal({
  isOpen,
  type = 'success',
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'Ойлголоо',
}: CommonModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Модал нээгдэх үед арын background scroll хийгдэхгүй болгох
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const isSuccess = type === 'success';

  // createPortal ашиглан body дээр шууд байрлуулж, fixed inset-0 ашиглан дэлгэцийг 100% бүрхэнэ
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md px-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4 relative animate-in zoom-in-95 duration-200">
        {/* Хаах товч */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Икон */}
        <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
          isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {isSuccess ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
        </div>

        {/* Гарчиг болон Мэдэгдэл */}
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900">
            {title || (isSuccess ? 'Амжилттай' : 'Анхааруулга')}
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Үйлдлийн товч */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              else onClose();
            }}
            className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
              isSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}