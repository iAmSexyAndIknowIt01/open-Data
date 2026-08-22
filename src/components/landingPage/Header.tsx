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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100/60 w-full transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-linear-to-tr from-blue-600 to-sky-400 text-white p-2 sm:p-2.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            OD
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
            Open <span className="text-blue-600">Data</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#problem" className="hover:text-blue-600 transition-colors">Давуу тал</a>
          <a href="#features" className="hover:text-blue-600 transition-colors">Боломжууд</a>
          <a href="#testimonials" className="hover:text-blue-600 transition-colors">Сэтгэгдэл</a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-3 py-2"
          >
            Нэвтрэх
          </Link>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-sm font-extrabold px-5 py-2.5 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            Бизнесээ бүртгүүлэх <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
          aria-label="Цэс нээх"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xl px-6 py-6 space-y-5 animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-4 text-base font-bold text-slate-700">
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

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <Link 
              href="/login" 
              onClick={handleLinkClick}
              className="w-full text-center font-bold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 py-3.5 rounded-2xl transition-colors text-sm"
            >
              Нэвтрэх
            </Link>
            <Link 
              href="/register" 
              onClick={handleLinkClick}
              className="w-full inline-flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-sm"
            >
              Бизнесээ бүртгүүлэх <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}