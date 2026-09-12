'use client';

import { useState, useEffect } from 'react';
import { User, TrendingUp, Users, Database, ArrowUpRight, Sparkles, Activity } from 'lucide-react';
import LoadingComponent from '@/src/app/components/loading';

interface DashboardStats {
  totalData: string;
  views: string;
  activeStatus: string;
  growthRate: string;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wide uppercase">
            <Sparkles size={12} /> Хяналтын самбар
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Сайн байна уу! 👋</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Өнөөдрийн бизнесийн гол үзүүлэлт болон тойм мэдээлэл.</p>
        </div>
        
        {/* User Profile Badge */}
        <div className="flex items-center gap-3 bg-slate-50/80 px-4 py-3 rounded-2xl border border-slate-200/60 shadow-xs self-start sm:self-auto">
          <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <User size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Байгууллага</p>
            <span className="font-bold text-sm text-slate-800 truncate max-w-50 block">{companyName}</span>
          </div>
        </div>
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
        </div>

      </section>

      {/* Main Analytics Area */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-base text-slate-900">Бизнесийн үйл ажиллагааны тойм</h2>
            <p className="text-slate-500 text-xs mt-0.5">Сүүлийн үеийн өгөгдөл болон хүснэгтийн мэдээлэл</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-600">Систем хэвийн ажиллаж байна</span>
          </div>
        </div>

        <div className="min-h-75 sm:min-h-87.5 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-200/60 text-slate-400 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div className="max-w-xs space-y-1">
            <p className="text-sm font-bold text-slate-700">Дата болон график мэдээлэл хоосон байна</p>
            <p className="text-xs text-slate-400">Энд та өөрийн хүссэн хүснэгт, график эсвэл жагсаалт компонентээ байрлуулах боломжтой.</p>
          </div>
        </div>
      </div>

    </div>
  );
}