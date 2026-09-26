/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, UserPlus, Search, X, Check, Filter, 
  Sparkles, Loader2 
} from 'lucide-react';
// Loading компонент оруулж ирэх хэсэг (зам болон нэрийг өөрийн төслийн бүтцээр шалгаарай)
import Loading from '@/src/app/components/loading';

interface User {
  user_id?: string;
  id?: string;
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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Бүгд');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user', 
    address: '',
    male: '',
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
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesRole = selectedRole === 'Бүгд';
    if (!matchesRole) {
      const targetRole = user.role?.toLowerCase();
      if (selectedRole === 'Админ' && targetRole === 'admin') matchesRole = true;
      if (selectedRole === 'Менежер' && targetRole === 'manager') matchesRole = true;
      if (selectedRole === 'Ажилтан' && (targetRole === 'user' || targetRole === 'ажилтан')) matchesRole = true;
    }

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
        setNewUser({ 
          first_name: '', 
          last_name: '', 
          email: '', 
          password: '', 
          phone: '', 
          role: 'user', 
          address: '', 
          male: '' 
        });
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

  const getRoleDisplayName = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'Админ';
      case 'manager': return 'Менежер';
      case 'user': 
      case 'ажилтан': return 'Ажилтан';
      default: return role || 'Ажилтан';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-24 font-sans antialiased text-slate-800 dark:text-slate-100 px-4 sm:px-6">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100/80 dark:border-slate-800 shadow-2xs relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-50/80 dark:bg-blue-950/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-extrabold tracking-wider uppercase">
            <Sparkles size={13} /> Хэрэглэгчийн удирдлага
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Компанийн хэрэглэгчид</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xl">
            Бүртгэлтэй хэрэглэгчдийн жагсаалтыг харах болон шинээр бүртгэх.
          </p>
        </div>

        <button 
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="self-start md:self-auto px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer relative z-10 active:scale-95"
        >
          <UserPlus size={18} /> Хэрэглэгч нэмэх
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs">
        <div className="relative w-full lg:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Нэр, имэйл, эрхээр хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 lg:pb-0 scrollbar-none">
            <Filter size={15} className="text-slate-400 dark:text-slate-500 shrink-0 ml-1 mr-1 hidden sm:block" />
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedRole === r 
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs flex items-center justify-center">
          <Loading />
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  <th className="py-4 px-6">Хэрэглэгч</th>
                  <th className="py-4 px-6">Эрх / Албан тушаал</th>
                  <th className="py-4 px-6">Холбоо барих</th>
                  <th className="py-4 px-6">Статус</th>
                  <th className="py-4 px-6 text-right">Бүртгэгдсэн огноо</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                {filteredUsers.map((u, index) => {
                  const userId = u.user_id || u.id;
                  return (
                    <tr 
                      key={userId || index} 
                      onClick={() => {
                        if (userId) {
                          router.push(`/dashboard/employees/${userId}`);
                        } else {
                          alert('Хэрэглэгчийн ID олдсонгүй.');
                        }
                      }}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                            {u.first_name ? u.first_name.charAt(0) : 'U'}
                          </div>
                          <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {u.first_name} {u.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{getRoleDisplayName(u.role)}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs space-y-0.5">
                        <p>{u.email}</p>
                        <p className="text-slate-400 dark:text-slate-500">{u.phone || '-'}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-block ${
                          u.is_active !== false 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {u.is_active !== false ? 'Идэвхтэй' : 'Идэвхгүй'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-xs text-slate-400 dark:text-slate-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
            <Users size={26} />
          </div>
          <p className="font-extrabold text-slate-800 dark:text-slate-200 text-base">Хэрэглэгч олдсонгүй</p>
          <p className="text-xs text-slate-400 dark:text-slate-400 max-w-sm mx-auto">Таны хайсан нэр эсвэл шүүлтүүрээр тохирох хэрэглэгч олдсонгүй.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h3 className="font-black text-lg text-slate-900 dark:text-white">Шинэ хэрэглэгч нэмэх</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400">Системд шинээр хэрэглэгч бүртгэх.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Овог</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Овог"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Нэр</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Нэр"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Имэйл хаяг</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@company.mn"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Нууц үг</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Утасны дугаар</label>
                  <input 
                    type="text" 
                    placeholder="+976 99..."
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Хаяг</label>
                <input 
                  type="text" 
                  placeholder="Гэрийн хаяг"
                  value={newUser.address}
                  onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Хэрэглэгчийн эрх (Role)</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all cursor-pointer"
                >
                  <option value="user">Ажилтан</option>
                  <option value="manager">Менежер</option>
                  <option value="admin">Админ</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
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