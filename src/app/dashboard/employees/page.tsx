'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Mail, Phone, ShieldCheck, X, Check, Filter, 
  LayoutGrid, List, Sparkles, Loader2 
} from 'lucide-react';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  male: boolean | null;
  is_active: boolean;
  created_at: string;
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Бүгд');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Ажилтан',
    address: '',
  });

  const [users, setUsers] = useState<User[]>([]);

  const roles = ['Бүгд', 'Админ', 'Ажилтан', 'Менежер'];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employees');
      const result = await res.json();
      if (result.success) {
        setUsers(result.data || []);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === 'Бүгд' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.first_name || !newUser.last_name || !newUser.email) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const result = await res.json();
      if (result.success) {
        setUsers([result.data, ...users]);
        setNewUser({ first_name: '', last_name: '', email: '', password: '', phone: '', role: 'Ажилтан', address: '' });
        setIsModalOpen(false);
      } else {
        alert(result.error || 'Алдаа гарлаа.');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Сервертэй холбогдоход алдаа гарлаа.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-24 font-sans antialiased text-slate-800 px-4 sm:px-6">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100/80 shadow-2xs relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-50/80 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-extrabold tracking-wider uppercase">
            <Sparkles size={13} /> mt_user удирдлага
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Компанийн хэрэглэгчид</h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl">
            mt_user хүснэгтээс тухайн компанийн бүртгэлтэй хэрэглэгчдийн жагсаалтыг харах болон шинээр бүртгэх.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="self-start md:self-auto px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer relative z-10 active:scale-95"
        >
          <UserPlus size={18} /> Хэрэглэгч нэмэх
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-2xs">
        <div className="relative w-full lg:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Нэр, имэйл, эрхээр хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 lg:pb-0 scrollbar-none">
            <Filter size={15} className="text-slate-400 shrink-0 ml-1 mr-1 hidden sm:block" />
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedRole === r 
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-3">
          <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Дата ачааллаж байна...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUsers.map((u) => (
              <div 
                key={u.id} 
                className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-2xs hover:shadow-md transition-all space-y-5 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm shrink-0">
                        {u.first_name ? u.first_name.charAt(0) : 'U'}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                          {u.first_name} {u.last_name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{u.role || 'Ажилтан'}</p>
                      </div>
                    </div>
                    
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                      u.is_active !== false 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {u.is_active !== false ? 'Идэвхтэй' : 'Идэвхгүй'}
                    </span>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-50 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <Mail size={15} className="text-slate-400 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone size={15} className="text-slate-400 shrink-0" />
                      <span>{u.phone || 'Дугаар байхгүй'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-600 inline-flex items-center gap-1">
                    <ShieldCheck size={14} /> mt_user
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Хэрэглэгч</th>
                    <th className="py-4 px-6">Эрх / Албан тушаал</th>
                    <th className="py-4 px-6">Холбоо барих</th>
                    <th className="py-4 px-6">Статус</th>
                    <th className="py-4 px-6 text-right">Бүртгэгдсэн огноо</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                            {u.first_name ? u.first_name.charAt(0) : 'U'}
                          </div>
                          <span className="font-extrabold text-slate-900">{u.first_name} {u.last_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{u.role || 'Ажилтан'}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs space-y-0.5">
                        <p>{u.email}</p>
                        <p className="text-slate-400">{u.phone || '-'}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-block ${
                          u.is_active !== false 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {u.is_active !== false ? 'Идэвхтэй' : 'Идэвхгүй'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-xs text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Users size={26} />
          </div>
          <p className="font-extrabold text-slate-800 text-base">Хэрэглэгч олдсонгүй</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Таны хайсан нэр эсвэл шүүлтүүрээр тохирох хэрэглэгч олдсонгүй.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="font-black text-lg text-slate-900">Шинэ хэрэглэгч нэмэх</h3>
                <p className="text-xs text-slate-400">mt_user хүснэгт рүү шинээр хэрэглэгч бүртгэх.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Овог</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Овог"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Нэр</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Нэр"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Имэйл хаяг</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@company.mn"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Нууц үг</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Утасны дугаар</label>
                  <input 
                    type="text" 
                    placeholder="+976 99..."
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Хэрэглэгчийн эрх (Role)</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Ажилтан">Ажилтан</option>
                  <option value="Менежер">Менежер</option>
                  <option value="Админ">Админ</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Цуцлах
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer inline-flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Бүртгэх
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}