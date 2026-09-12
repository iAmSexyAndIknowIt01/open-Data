'use client';

import { useState, useEffect } from 'react';
import { 
  User, TrendingUp, Users, Database, ArrowUpRight, 
  Sparkles, Activity, FileText, ArrowRight, 
  ShieldCheck, CheckCircle2, BellRing 
} from 'lucide-react';
import LoadingComponent from '@/src/app/components/loading';
import Link from 'next/link';

interface DashboardStats {
  totalData: string;
  views: string;
  activeStatus: string;
  growthRate: string;
}

interface RecentSubmission {
  id: string;
  title: string;
  submittedAt: string;
  status: 'Шинэ' | 'Шалгасан' | 'Хүлээгдэж буй';
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalData: '1,284',
    views: '45.2k',
    activeStatus: '98%',
    growthRate: '+12.5%',
  });
  const [companyName, setCompanyName] = useState('Компанийн нэр');
  
  const [recentActivities] = useState<RecentSubmission[]>([
    { id: '1', title: 'Хүний нөөцийн судалгааны анкет #4', submittedAt: 'Өнөөдөр, 14:20', status: 'Шинэ' },
    { id: '2', title: 'Харилцагчийн сэтгэл ханамжийн санал асуулга', submittedAt: 'Өнөөдөр, 11:05', status: 'Шалгасан' },
    { id: '3', title: 'Санхүүгийн улирлын тайлангийн мэдээлэл', submittedAt: 'Өчигдөр, 16:45', status: 'Шалгасан' },
    { id: '4', title: 'Маркетингийн судалгааны бүртгэл', submittedAt: '2 өдрийн өмнө', status: 'Хүлээгдэж буй' },
  ]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch('/api/dashboard/company');
        const json = await res.json();

        if (json.success && json.data?.company_name) {
          setCompanyName(json.data.company_name);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingComponent text="Мэдээллийг ачаалж байна..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-20 font-sans antialiased text-slate-800">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wide uppercase">
            <Sparkles size={12} /> Хяналтын самбар
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Сайн байна уу! 👋</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Таны бизнесийн гол үзүүлэлт болон сүүлийн үеийн мэдээллийн тойм.</p>
        </div>
        
        {/* User Profile & Company Badge */}
        <div className="flex items-center gap-3 bg-slate-50/90 px-4 py-3 rounded-2xl border border-slate-200/60 shadow-xs self-start sm:self-auto relative z-10">
          <div className="w-10 h-10 bg-linear-to-tr from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <User size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Байгууллага</p>
            <span className="font-extrabold text-sm text-slate-800 truncate max-w-55 block">{companyName}</span>
          </div>
        </div>
      </div>

      {/* Notice & System Info Banner (Quick Action-ийн оронд нэмэгдсэн хэсэг) */}
      <div className="bg-linear-to-r from-blue-900 via-slate-900 to-indigo-950 p-5 sm:p-6 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-blue-400">
            <BellRing size={20} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide text-blue-300 uppercase">Системийн мэдээлэл</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-200">
              Шинэ өгөгдөл импортлох болон тайлан боловсруулах горим хэвийн ажиллаж байна.
            </p>
          </div>
        </div>

        <Link 
          href="/dashboard/settings" 
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all inline-flex items-center gap-2 shrink-0 relative z-10"
        >
          Тохиргоо шалгах <ArrowRight size={14} />
        </Link>
      </div>

      {/* Dashboard Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-4 group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Database size={22} />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <ArrowUpRight size={14} /> +4.2%
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Нийт өгөгдөл</h3>
            <p className="text-3xl sm:text-4xl font-black text-slate-900">{stats.totalData}</p>
          </div>
          <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
            <span>Өмнөх сартай харьцуулахад</span>
            <span className="font-semibold text-emerald-600">Өссөн</span>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-4 group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={22} />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <ArrowUpRight size={14} /> +18.5%
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Хандалт</h3>
            <p className="text-3xl sm:text-4xl font-black text-slate-900">{stats.views}</p>
          </div>
          <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
            <span>Үйлчлүүлэгчдийн хандалт</span>
            <span className="font-semibold text-emerald-600">Идэвхтэй</span>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-4 group sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity size={22} />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Тогтвортой
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Идэвхтэй статус</h3>
            <p className="text-3xl sm:text-4xl font-black text-slate-900">{stats.activeStatus}</p>
          </div>
          <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
            <span>Системийн хэвийн ажиллагаа</span>
            <span className="font-semibold text-blue-600">99.9%</span>
          </div>
        </div>

      </section>

      {/* Main Content & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-extrabold text-base text-slate-900">Бизнесийн үйл ажиллагааны тойм</h2>
                <p className="text-slate-500 text-xs mt-0.5">Сүүлийн 7 хоногийн өгөгдлийн хандалт болон урсгал</p>
              </div>
              <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 text-xs font-bold text-slate-700">
                <ShieldCheck size={14} className="text-emerald-500" /> Баталгаажсан
              </div>
            </div>

            <div className="mt-6 h-64 bg-linear-to-b from-slate-50/80 to-blue-50/30 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
              <div className="absolute inset-0 flex items-end justify-around px-8 opacity-20 pointer-events-none">
                <div className="w-12 bg-blue-600 rounded-t-lg h-24"></div>
                <div className="w-12 bg-blue-600 rounded-t-lg h-36"></div>
                <div className="w-12 bg-blue-600 rounded-t-lg h-28"></div>
                <div className="w-12 bg-blue-600 rounded-t-lg h-48"></div>
                <div className="w-12 bg-blue-600 rounded-t-lg h-40"></div>
                <div className="w-12 bg-blue-600 rounded-t-lg h-56"></div>
              </div>
              <div className="relative z-10 space-y-2 max-w-sm">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <TrendingUp size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Динамик график тайлан бэлэн байна</p>
                <p className="text-xs text-slate-400">Нарийвчилсан аналитик болон үзүүлэлтүүдийг Аналитик хэсгээс харна уу.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>Шинэчлэгдсэн: Саяхан</span>
            <Link href="/dashboard/analytics" className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
              Бүгдийг харах <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" /> Сүүлийн анкетууд
              </h2>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {recentActivities.length} шинэ
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {recentActivities.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 transition-colors border border-slate-100 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</p>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                      item.status === 'Шинэ' 
                        ? 'bg-blue-100 text-blue-700' 
                        : item.status === 'Шалгасан' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <CheckCircle2 size={12} /> {item.submittedAt}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link 
            href="/dashboard/my-anket" 
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            Бүх анкет удирдах <ArrowRight size={14} />
          </Link>
        </div>

      </div>

    </div>
  );
}