'use client';

import { useState, useEffect, use, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, ShieldCheck, MapPin, Calendar, Loader2 } from 'lucide-react';

interface UserDetail {
  [x: string]: ReactNode;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  company_name?: string; 
  is_active: boolean;
  created_at: string;
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
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">{user.role || 'Ажилтан'}</p>
              {user.company_name && (
                <p className="text-xs text-blue-600 font-bold">Компани: {user.company_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Бүртгэгдсэн огноо</p>
              <p className="font-bold text-slate-800">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Тодорхойгүй'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
          <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
            <ShieldCheck size={14} /> mt_user table
          </span>
          <span>ID: {user.user_id}</span>
        </div>
      </div>
    </div>
  );
}