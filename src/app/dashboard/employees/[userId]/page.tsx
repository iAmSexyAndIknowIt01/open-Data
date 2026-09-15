'use client';

import { useState, useEffect, use, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Mail, Phone, ShieldCheck, MapPin, Calendar, 
  Loader2, CheckCircle2, XCircle
} from 'lucide-react';

interface UserDetail {
  [x: string]: ReactNode;
  user_id: string;
  company_id: string;
  email: string;
  first_name: string;
  last_name: string;
  male: boolean | null;
  phone: string | null;
  address: string | null;
  is_active: boolean | null;
  create_date: string | null;
  update_date: string | null;
  role: string | null;
  position: string | null;
  company_name?: string | null;
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const router = useRouter();
  
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/employees/${userId}`);
        const result = await res.json();
        
        if (result.success) {
          setUser(result.data);
        } else {
          setError(result.error || 'Мэдээлэл олдсонгүй');
        }
      } catch (err) {
        console.error('Error fetching user detail:', err);
        setError('Сервертэй холбогдоход алдаа гарлаа.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-28 text-center space-y-3">
        <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Хэрэглэгчийн мэдээллийг ачааллаж байна...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4 px-4">
        <p className="text-base font-bold text-slate-800">{error || 'Хэрэглэгч олдсонгүй.'}</p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Буцах
        </button>
      </div>
    );
  }

  // Helper function to format raw database values nicely
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-slate-400 italic">Байхгүй</span>;
    }
    if (typeof value === 'boolean') {
      return value ? (
        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
          <CheckCircle2 size={14} /> Тийм (True)
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-rose-500 font-bold">
          <XCircle size={14} /> Үгүй (False)
        </span>
      );
    }
    if (key.includes('date') && typeof value === 'string') {
      return new Date(value).toLocaleString();
    }
    return String(value);
  };

  // Human-readable labels for mt_user columns
  const columnLabels: { [key: string]: string } = {
    user_id: 'Хэрэглэгчийн ID (UUID)',
    company_id: 'Компанийн ID',
    email: 'Имэйл хаяг',
    first_name: 'Нэр',
    last_name: 'Овог',
    male: 'Хүйс (Эрэгтэй эсэх)',
    phone: 'Утасны дугаар',
    address: 'Гэрийн хаяг',
    is_active: 'Идэвхтэй эсэх',
    create_date: 'Үүсгэсэн огноо',
    update_date: 'Шинэчилсэн огноо',
    role: 'Хэрэглэгчийн эрх (Role)',
    position: 'Албан тушаал (Position)',
    company_name: 'Компанийн нэр'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 font-sans antialiased text-slate-800 px-4 sm:px-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-2xs transition-all cursor-pointer"
      >
        <ArrowLeft size={16} /> Буцах
      </button>

      {/* Profile Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-2xs relative overflow-hidden space-y-6">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-50/80 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              {user.first_name ? user.first_name.charAt(0) : 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {user.first_name} {user.last_name}
                </h1>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                  user.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {user.is_active !== false ? 'Идэвхтэй' : 'Идэвхгүй'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">{user.position || user.role || 'Ажилтан'}</p>
              {user.company_name && (
                <p className="text-xs text-blue-600 font-bold">Компани: {user.company_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Details Grid (Key Info) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 relative z-10 text-xs sm:text-sm">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
            <Mail size={18} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Имэйл хаяг</p>
              <p className="font-bold text-slate-800">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
            <Phone size={18} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Утасны дугаар</p>
              <p className="font-bold text-slate-800">{user.phone || 'Байхгүй'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
            <MapPin size={18} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Хаяг</p>
              <p className="font-bold text-slate-800">{user.address || 'Байхгүй'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
            <Calendar size={18} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Үүсгэсэн огноо</p>
              <p className="font-bold text-slate-800">
                {user.create_date ? new Date(user.create_date).toLocaleDateString() : 'Тодорхойгүй'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Database Fields Card (mt_user бүх дата жагсаалт) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-black text-base text-slate-900">mt_user хүснэгтийн бүрэн мэдээлэл</h3>
            <p className="text-xs text-slate-400">Өгөгдлийн санд хадгалагдсан бүх талбарууд</p>
          </div>
          <span className="text-[10px] font-black px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg uppercase">
            Database Raw Data
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(user).map(([key, value]) => {
            // Нууц үгийн hash эсвэл хүсээгүй талбаруудыг нуух бол энд нэмж болно
            if (key === 'password_hash') return null;

            return (
              <div key={key} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between gap-1">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {columnLabels[key] || key}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 break-all">
                  {renderValue(key, value)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
          <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
            <ShieldCheck size={14} /> mt_user table
          </span>
          <span>ID: {user.user_id}</span>
        </div>
      </div>
    </div>
  );
}