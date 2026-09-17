'use client';

import { useState, useEffect, use, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Mail, Phone, ShieldCheck, MapPin, Calendar, 
  CheckCircle2, XCircle, Edit3, Save, X, Loader
} from 'lucide-react';
import Loading from '@/src/app/components/loading'; // Эсвэл таны төслийн замналаас хамаарч: '@/app/components/loading'

interface UserDetail {
  [x: string]: ReactNode;
  user_id: string;
  company_id: string;
  email: string;
  first_name: string;
  last_name: string;
  male: string | null;
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
  const [editForm, setEditForm] = useState<UserDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/employees/${userId}`);
      const result = await res.json();
      
      if (result.success) {
        setUser(result.data);
        setEditForm(result.data);
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUserDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/employees/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const result = await res.json();
      if (result.success) {
        setUser(result.data);
        setEditForm(result.data);
        setIsEditing(false);
      } else {
        alert(result.error || 'Хадгалахад алдаа гарлаа.');
      }
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Сервертэй холбогдоход алдаа гарлаа.');
    } finally {
      setSaving(false);
    }
  };

  // Өгөгдөл ачаалж байх үед loading.tsx компонент ашиглах
  if (loading) {
    return <Loading />;
  }

  if (error || !user || !editForm) {
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

  // View mode helper to format values nicely
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-slate-400 italic">Байхгүй</span>;
    }
    if (key === 'male') {
      const valStr = String(value).toLowerCase();
      if (valStr === 'male' || valStr === 'эртэй' || valStr === 'эрэгтэй') {
        return <span className="text-slate-800 font-bold">Эрэгтэй</span>;
      }
      if (valStr === 'female' || valStr === 'эмэгтэй') {
        return <span className="text-slate-800 font-bold">Эмэгтэй</span>;
      }
      return <span className="text-slate-800 font-bold">{String(value)}</span>;
    }
    if (key === 'is_active') {
      return value ? (
        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
          <CheckCircle2 size={14} /> Тийм
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-rose-500 font-bold">
          <XCircle size={14} /> Үгүй
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
    male: 'Хүйс',
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
      {/* Top Bar: Back & Edit Mode Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft size={16} /> Буцах
        </button>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-2xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Edit3 size={16} /> Засах
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditForm(user);
                setIsEditing(false);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-2xl transition-all cursor-pointer"
            >
              <X size={16} /> Цуцлах
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
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
                  {!isEditing ? (
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                      {user.first_name} {user.last_name}
                    </h1>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={editForm.last_name || ''} 
                        onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                        placeholder="Овог"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-bold w-36"
                      />
                      <input 
                        type="text" 
                        value={editForm.first_name || ''} 
                        onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                        placeholder="Нэр"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-bold w-36"
                      />
                    </div>
                  )}
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                    user.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {user.is_active !== false ? 'Идэвхтэй' : 'Идэвхгүй'}
                  </span>
                </div>
                {!isEditing ? (
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold">{user.position || user.role || 'Ажилтан'}</p>
                ) : (
                  <input 
                    type="text" 
                    value={editForm.position || ''} 
                    onChange={(e) => setEditForm({...editForm, position: e.target.value})}
                    placeholder="Албан тушаал"
                    className="px-3 py-1 rounded-xl border border-slate-200 text-xs font-semibold mt-1 w-full"
                  />
                )}
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
              <div className="w-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Имэйл хаяг</p>
                {!isEditing ? (
                  <p className="font-bold text-slate-800">{user.email}</p>
                ) : (
                  <input 
                    type="email" 
                    value={editForm.email || ''} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full mt-1 px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-xs font-bold"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
              <Phone size={18} className="text-blue-600 shrink-0" />
              <div className="w-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Утасны дугаар</p>
                {!isEditing ? (
                  <p className="font-bold text-slate-800">{user.phone || 'Байхгүй'}</p>
                ) : (
                  <input 
                    type="text" 
                    value={editForm.phone || ''} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full mt-1 px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-xs font-bold"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
              <MapPin size={18} className="text-blue-600 shrink-0" />
              <div className="w-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Хаяг</p>
                {!isEditing ? (
                  <p className="font-bold text-slate-800">{user.address || 'Байхгүй'}</p>
                ) : (
                  <input 
                    type="text" 
                    value={editForm.address || ''} 
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    className="w-full mt-1 px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-xs font-bold"
                  />
                )}
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

        {/* Full Database Fields Card (mt_user бүх дата - Table хэлбэртэй) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-black text-base text-slate-900">mt_user хүснэгтийн бүрэн мэдээлэл</h3>
              <p className="text-xs text-slate-400">Өгөгдлийн санд хадгалагдсан бүх талбарууд</p>
            </div>
            <span className="text-[10px] font-black px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg uppercase">
              Database Table Data
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Талбар (Column)</th>
                  <th className="py-3 px-4">Утга (Value)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {Object.entries(editForm).map(([key, value]) => {
                  if (key === 'password_hash') return null;

                  const isReadOnly = ['user_id', 'company_id', 'company_name', 'create_date', 'update_date'].includes(key);

                  return (
                    <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-slate-500 w-1/3">
                        {columnLabels[key] || key}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 w-2/3 break-all">
                        {!isEditing || isReadOnly ? (
                          renderValue(key, user[key])
                        ) : (
                          key === 'male' ? (
                            <select
                              value={String(value ?? '')}
                              onChange={(e) => setEditForm({...editForm, male: e.target.value || null})}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
                            >
                              <option value="male">Эрэгтэй</option>
                              <option value="female">Эмэгтэй</option>
                              <option value="">Сонгоогүй</option>
                            </select>
                          ) : key === 'is_active' ? (
                            <select
                              value={value === true ? 'true' : 'false'}
                              onChange={(e) => {
                                const val = e.target.value === 'true';
                                setEditForm({...editForm, is_active: val});
                              }}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
                            >
                              <option value="true">Тийм</option>
                              <option value="false">Үгүй</option>
                            </select>
                          ) : key === 'role' ? (
                            <select
                              value={String(value ?? 'User')}
                              onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
                            >
                              <option value="Admin">Admin</option>
                              <option value="Manager">Manager</option>
                              <option value="User">User</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={value !== null && value !== undefined ? String(value) : ''}
                              onChange={(e) => setEditForm({...editForm, [key]: e.target.value})}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
                            />
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {isEditing && (
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditForm(user);
                  setIsEditing(false);
                }}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Цуцлах
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer inline-flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} Өөрчлөлтийг хадгалах
              </button>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
              <ShieldCheck size={14} /> mt_user table
            </span>
            <span>ID: {user.user_id}</span>
          </div>
        </div>
      </form>
    </div>
  );
}