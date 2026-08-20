import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-blue-100/60 py-12 bg-white text-slate-500 text-sm w-full relative overflow-hidden">
      
      {/* Blueprint Grid Pattern (Цэнхэр зураасан торлог) */}
      <div 
        className="absolute inset-0 opacity-[0.25] pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #bae6fd 1px, transparent 1px),
            linear-gradient(to bottom, #bae6fd 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Logo & Brief Description */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Open <span className="text-blue-600">Data</span>
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="text-xs text-slate-500">
            Бизнесийн харилцагчийн ухаалаг менежментийн систем
          </span>
        </div>

        {/* Links or Copyright */}
        <div className="flex items-center gap-6 text-xs font-medium">
          <Link href="#problem" className="hover:text-blue-600 transition-colors">Давуу тал</Link>
          <Link href="#features" className="hover:text-blue-600 transition-colors">Боломжууд</Link>
          <Link href="#testimonials" className="hover:text-blue-600 transition-colors">Сэтгэгдэл</Link>
        </div>

        <div className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Open Data. Бүх эрх хуулиар хамгаалагдсан.
        </div>

      </div>
    </footer>
  );
}