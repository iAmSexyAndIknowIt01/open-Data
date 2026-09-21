'use client';

import { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Database, Settings, LogOut, User, BarChart3, ChevronDown, Menu, X, FileText, Users, UserCheck, Briefcase, Wrench } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  email: string;
  first_name: string;
  last_name: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [userData, setUserData] = useState<UserData | null>(null);

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Удирдлага' },
    { href: '/dashboard/data', icon: Database, label: 'Өгөгдөл' },
    { href: '/dashboard/my-anket', icon: FileText, label: 'Анкет' },
    { href: '/dashboard/employees', icon: Users, label: 'Ажилчид' },
    { href: '/dashboard/customers', icon: UserCheck, label: 'Харилцагч' },
    { href: '/dashboard/services', icon: Briefcase, label: 'Үйлчилгээ' },
    { href: '/dashboard/workshop', icon: Wrench, label: 'Ажил' }, // Ажил цэсийг workshop замтай нь нэмэв
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Аналитик' },
    { href: '/dashboard/settings', icon: Settings, label: 'Тохиргоо' },
  ];

  // Хэрэглэгчийн мэдээллийг API-аас татах
  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch('/api/user');
        const json = await res.json();
        if (json.success && json.data) {
          setUserData(json.data);
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
      }
    }
    fetchUserData();
  }, []);

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

  // Овог нэрийн эхний үсгийг гаргах
  const getInitials = () => {
    if (!userData) return 'КО';
    const lastInitial = userData.last_name ? userData.last_name.charAt(0) : '';
    const firstInitial = userData.first_name ? userData.first_name.charAt(0) : '';
    const initials = (lastInitial + firstInitial).toUpperCase();
    return initials || 'КО';
  };

  // Хэрэглэгчийн бүтэн нэрийг гаргах
  const getFullName = () => {
    if (!userData) return 'Хэрэглэгч';
    const last = userData.last_name || '';
    const first = userData.first_name || '';
    return `${last} ${first}`.trim() || 'Хэрэглэгч';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4 sm:gap-6">
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

          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl text-sm font-bold transition-all ${
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

        {/* User Profile & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 sm:gap-3 bg-slate-50 hover:bg-slate-100 px-2.5 sm:px-3 py-2 rounded-2xl border border-slate-200/80 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              {getInitials()}
            </div>
            <ChevronDown size={16} className={`text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 space-y-0.5">
                <p className="text-xs text-slate-400 font-medium">Нэвтэрсэн хэрэглэгч</p>
                <p className="text-sm font-extrabold text-slate-900 truncate">
                  {getFullName()}
                </p>
                <p className="text-xs font-medium text-slate-500 truncate">
                  {userData?.email || 'info@company.mn'}
                </p>
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