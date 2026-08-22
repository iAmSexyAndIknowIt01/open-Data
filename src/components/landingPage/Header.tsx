'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    // bg-white/80 backdrop-blur-md гэснийг bg-white болгон өөрчлөв
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 w-full transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-linear-to-tr from-blue-600 to-sky-400 text-white p-1.5 sm:p-2 rounded-xl font-black text-xs tracking-wider shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            OD
          </div>
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
            Open <span className="text-blue-600">Data</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <a href="#problem" className="hover:text-blue-600 transition-colors">Давуу тал</a>
          <a href="#features" className="hover:text-blue-600 transition-colors">Боломжууд</a>
          <a href="#testimonials" className="hover:text-blue-600 transition-colors">Сэтгэгдэл</a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link 
            href="/login" 
            className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-3 py-1.5"
          >
            Нэвтрэх
          </Link>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-1.5 bg-linear-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs sm:text-sm font-extrabold px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            Бүртгүүлэх <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Цэс нээх"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl px-6 py-5 space-y-4 animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3 text-sm font-bold text-slate-700">
            <a 
              href="#problem" 
              onClick={handleLinkClick}
              className="hover:text-blue-600 transition-colors py-1"
            >
              Давуу тал
            </a>
            <a 
              href="#features" 
              onClick={handleLinkClick}
              className="hover:text-blue-600 transition-colors py-1"
            >
              Боломжууд
            </a>
            <a 
              href="#testimonials" 
              onClick={handleLinkClick}
              className="hover:text-blue-600 transition-colors py-1"
            >
              Сэтгэгдэл
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <Link 
              href="/login" 
              onClick={handleLinkClick}
              className="w-full text-center font-bold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 py-3 rounded-xl transition-colors text-sm"
            >
              Нэвтрэх
            </Link>
            <Link 
              href="/register" 
              onClick={handleLinkClick}
              className="w-full inline-flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm"
            >
              Бүртгүүлэх <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}