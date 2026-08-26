'use client';

import { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Database, Settings, LogOut, User, BarChart3, ChevronDown, Menu, X, FileText } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Удирдлага' },
    { href: '/dashboard/data', icon: Database, label: 'Өгөгдөл' },
    { href: '/dashboard/my-anket', icon: FileText, label: 'Анкет' }, // Шинээр нэмэгдсэн хэсэг
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Аналитик' },
    { href: '/dashboard/settings', icon: Settings, label: 'Тохиргоо' },
  ];

  // Dropdown цэснээс гадна дархад хаагдах логик
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header дээр relative класс нэмэх нь mobileMenu-г зөв байрлуулахад тусална */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4 sm:gap-8">
          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="flex items-center gap-2">
            <div className="bg-linear-to-tr from-blue-600 to-sky-400 text-white p-2 rounded-xl font-black text-sm">OD</div>
            <span className="font-extrabold text-lg text-slate-900 hidden sm:inline">OpenData</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  pathname === item.href 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Компанийн мэдээлэл болон Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 sm:gap-3 bg-slate-50 hover:bg-slate-100 px-2.5 sm:px-3 py-2 rounded-2xl border border-slate-200/80 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              КО
            </div>
            <span className="font-bold text-sm text-slate-700 hidden sm:inline max-w-37.5 truncate">Компанийн Нэр ХХК</span>
            <ChevronDown size={16} className={`text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Box */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs text-slate-400 font-medium">Нэвтэрсэн хэрэглэгч</p>
                <p className="text-sm font-bold text-slate-800 truncate">info@company.mn</p>
              </div>

              <Link 
                href="/dashboard/profile" 
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User size={16} className="text-slate-500" /> Профайл
              </Link>

              <div className="h-px bg-slate-100 my-1" />

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} /> Гарах
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  pathname === item.href 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>
      
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}