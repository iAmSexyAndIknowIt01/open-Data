import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100/60 w-full transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-tr from-blue-600 to-sky-400 text-white p-2.5 rounded-2xl font-black text-sm tracking-wider shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            OD
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Open <span className="text-blue-600">Data</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#problem" className="hover:text-blue-600 transition-colors">Давуу тал</a>
          <a href="#features" className="hover:text-blue-600 transition-colors">Боломжууд</a>
          <a href="#testimonials" className="hover:text-blue-600 transition-colors">Сэтгэгдэл</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-3 py-2"
          >
            Нэвтрэх
          </Link>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-sm font-extrabold px-5 py-2.5 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            Бизнесээ бүртгүүлэх <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </header>
  );
}