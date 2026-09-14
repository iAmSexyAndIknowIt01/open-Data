'use client';

import { useState, useEffect } from 'react';
import { 
  User, TrendingUp, Users, Database, ArrowUpRight, 
  Sparkles, Activity, FileText, ArrowRight, 
  ShieldCheck, CheckCircle2, BellRing, 
  HelpCircle, CheckCheck, BarChart3
} from 'lucide-react';
import LoadingComponent from '@/src/app/components/loading';
import Link from 'next/link';

interface DashboardStats {
  totalData: string;
  views: string;
  growthRate: string; // Идэвхтэй статусын оронд өсөлтийн хурд ашиглахаар болгов
}

interface RecentSubmission {
  id: string;
  title: string;
  submittedAt: string;
  status: 'Шинэ' | 'Шалгасан' | 'Хүлээгдэж буй';
}

interface EmployeePerformance {
  id: string;
  name: string;
  role: string;
  resolvedCount: number;
  department: string;
  avatarBg: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats] = useState<DashboardStats>({
    totalData: '1,284',
    views: '45.2k',
    growthRate: '+12.5%', // Идэвхтэй статусын оронд харуулах шинэ контент
  });
  const [companyName, setCompanyName] = useState('Компанийн нэр');
  
  // Ажилтан бүрийн шийдвэрлэсэн асуудлын жагсаалт
  const [employeePerformances] = useState<EmployeePerformance[]>([
    { id: '1', name: 'Б. Тэмүүлэн', role: 'Ахлах систем хянагч', resolvedCount: 142, department: 'Харилцагчийн үйлчилгээ', avatarBg: 'bg-blue-600' },
    { id: '2', name: 'Д. Хулан', role: 'Техникийн дэмжлэг', resolvedCount: 118, department: 'МТ Департмент', avatarBg: 'bg-indigo-600' },
    { id: '3', name: 'Ө. Ганзориг', role: 'CRM Админ', resolvedCount: 95, department: 'Борлуулалтын хэлтэс', avatarBg: 'bg-emerald-600' },
    { id: '4', name: 'С. Намуун', role: 'Бүртгэл хариуцагч', resolvedCount: 76, department: 'Хүний нөөц', avatarBg: 'bg-amber-600' },
    { id: '5', name: 'Ц. Билгүүн', role: 'Аналитикч', resolvedCount: 64, department: 'Санхүү', avatarBg: 'bg-purple-600' },
  ]);

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

  const maxResolved = Math.max(...employeePerformances.map(e => e.resolvedCount), 1);

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-24 font-sans antialiased text-slate-800 px-4 sm:px-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-50/80 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-extrabold tracking-wider uppercase">
            <Sparkles size={13} /> Хяналтын самбар
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Сайн байна уу! 👋</h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl">
            Таны байгууллагын өгөгдлийн урсгал, идэвхтэй анкетууд болон багийн гүйцэтгэлийн нэгдсэн хяналт.
          </p>
        </div>
        
        {/* User Profile & Company Badge */}
        <div className="flex items-center gap-3.5 bg-slate-50/90 px-4 py-3.5 rounded-2xl border border-slate-200/60 shadow-xs self-start md:self-auto relative z-10">
          <div className="w-11 h-11 bg-linear-to-tr from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <User size={20} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Байгууллага</p>
            <span className="font-extrabold text-sm text-slate-900 truncate max-w-50 block">{companyName}</span>
          </div>
        </div>
      </div>

      {/* Notice & System Info Banner */}
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 p-5 sm:p-6 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-56 h-56 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-blue-400 shadow-inner">
            <BellRing size={20} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide text-blue-300 uppercase">Шуурхай анхааруулга</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-200">
              Системийн шинэчлэлт амжилттай хийгдсэн бөгөөд бүх API холболтууд хэвийн ажиллаж байна.
            </p>
          </div>
        </div>

        <Link 
          href="/dashboard/settings" 
          className="self-start sm:self-auto px-4.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all inline-flex items-center gap-2 shrink-0 relative z-10 shadow-xs"
        >
          Тохиргоо шалгах <ArrowRight size={14} />
        </Link>
      </div>

      {/* Dashboard Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-4 group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Database size={22} />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <ArrowUpRight size={14} /> +4.2%
            </span>
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Нийт өгөгдөл</h3>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{stats.totalData}</p>
          </div>
          <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
            <span>Өмнөх сартай харьцуулахад</span>
            <span className="font-bold text-emerald-600">Өссөн</span>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-4 group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Users size={22} />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <ArrowUpRight size={14} /> +18.5%
            </span>
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Хандалт</h3>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{stats.views}</p>
          </div>
          <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
            <span>Үйлчлүүлэгчдийн хандалт</span>
            <span className="font-bold text-emerald-600">Идэвхтэй</span>
          </div>
        </div>

        {/* Идэвхтэй статусын оронд Өсөлтийн хурд (Growth Rate) харуулах хэсэг */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-4 group sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <TrendingUp size={22} />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              <ArrowUpRight size={14} /> Эрчимтэй
            </span>
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Өсөлтийн хурд</h3>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{stats.growthRate}</p>
          </div>
          <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
            <span>Энэ сарын нийт өсөлт</span>
            <span className="font-bold text-purple-600">Өндөр</span>
          </div>
        </div>
      </section>

      {/* Main Content & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analytics Visual Box */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-extrabold text-base text-slate-900">Бизнесийн үйл ажиллагааны тойм</h2>
                <p className="text-slate-500 text-xs mt-0.5">Сүүлийн 7 хоногийн өгөгдлийн хандалт болон урсгал</p>
              </div>
              <div className="inline-flex items-center gap-2 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200/60 text-xs font-extrabold text-slate-700 shadow-xs">
                <ShieldCheck size={14} className="text-emerald-500" /> Баталгаажсан
              </div>
            </div>

            <div className="mt-6 h-64 bg-linear-to-b from-slate-50/80 to-blue-50/20 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
              <div className="absolute inset-0 flex items-end justify-around px-8 opacity-15 pointer-events-none">
                <div className="w-12 bg-blue-600 rounded-t-xl h-28"></div>
                <div className="w-12 bg-blue-600 rounded-t-xl h-40"></div>
                <div className="w-12 bg-blue-600 rounded-t-xl h-32"></div>
                <div className="w-12 bg-blue-600 rounded-t-xl h-52"></div>
                <div className="w-12 bg-blue-600 rounded-t-xl h-44"></div>
                <div className="w-12 bg-blue-600 rounded-t-xl h-60"></div>
              </div>
              <div className="relative z-10 space-y-3 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                  <TrendingUp size={22} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-extrabold text-slate-900">Динамик график тайлан бэлэн байна</p>
                  <p className="text-xs text-slate-500">Нарийвчилсан статистик болон дэлгэрэнгүй аналитикийг доорх холбоосоор орж харна уу.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span className="font-medium">Шинэчлэгдсэн: Саяхан</span>
            <Link href="/dashboard/analytics" className="font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1">
              Бүгдийг харах <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Recent Submissions List */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" /> Сүүлийн анкетууд
              </h2>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {recentActivities.length} шинэ
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {recentActivities.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/90 transition-all border border-slate-100 space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-extrabold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.title}</p>
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
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <CheckCircle2 size={12} className="text-slate-400" /> {item.submittedAt}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link 
            href="/dashboard/my-anket" 
            className="w-full py-3.5 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            Бүх анкет удирдах <ArrowRight size={14} />
          </Link>
        </div>

      </div>

      {/* EMPLOYEE ISSUES RESOLVED LEADERBOARD */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-wider mb-2">
              <BarChart3 size={13} /> Гүйцэтгэлийн статистик
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Ажилчдын шийдвэрлэсэн асуудлын тоо</h2>
            <p className="text-slate-500 text-xs mt-0.5">Багийн гишүүн бүрийн энэ сард амжилттай шийдвэрлэсэн асуудал болон хүсэлтийн жагсаалт</p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 self-start sm:self-auto">
            Нийт {employeePerformances.length} ажилтан идэвхтэй байна
          </span>
        </div>

        <div className="space-y-4">
          {employeePerformances.map((emp, index) => {
            const percentage = Math.round((emp.resolvedCount / maxResolved) * 100);
            return (
              <div key={emp.id} className="p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 transition-all border border-slate-100/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                      index === 0 ? 'bg-amber-500 text-white shadow-xs shadow-amber-500/30' :
                      index === 1 ? 'bg-slate-400 text-white' :
                      index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${emp.avatarBg} text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-xs`}>
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">{emp.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{emp.role} • <span className="text-slate-600">{emp.department}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs font-extrabold text-slate-500 uppercase">Шийдвэрлэсэн:</span>
                    <span className="text-base sm:text-lg font-black text-slate-900 bg-white px-3.5 py-1 rounded-xl border border-slate-200/60 shadow-2xs flex items-center gap-1.5">
                      <CheckCheck size={16} className="text-blue-600" /> {emp.resolvedCount}
                    </span>
                  </div>
                </div>

                {/* Прогресс бар */}
                <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      index === 0 ? 'bg-amber-500' : 'bg-blue-600'
                    }`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Additional Help / Support Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
            <HelpCircle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">Тусламж & Гарын авлага хэрэгтэй юу?</h3>
            <p className="text-xs sm:text-sm text-slate-500">Системийг ашиглах талаар дэлгэрэнгүй заавар болон түгээмэл асуултуудыг үзэх.</p>
          </div>
        </div>
        <Link 
          href="/dashboard/support" 
          className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shrink-0 inline-flex items-center gap-2"
        >
          Дэлгэрэнгүй үзэх <ArrowRight size={14} />
        </Link>
      </div>

    </div>
  );
}