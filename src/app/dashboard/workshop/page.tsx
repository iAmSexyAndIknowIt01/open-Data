'use client';

import { useState, useEffect } from 'react';
import { 
  Wrench, Plus, Search, Clock, CheckCircle2, 
  X, LayoutList, LayoutGrid, User, Briefcase, Calendar, ShieldAlert 
} from 'lucide-react';
import Loading from '@/src/app/components/loading';

interface WorkItem {
  work_id: string;
  title: string;
  customer_type: 'individual' | 'company';
  customer_name: string;
  service_name: string;
  employee_name: string;
  price: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  description: string;
}

interface OptionData {
  individuals: { id: string; first_name: string; last_name: string; phone: string }[];
  companies: { id: string; name: string; tax_number: string; phone: string }[];
  services: { service_id: number; name: string; price: number; duration: number }[];
  employees: { user_id: string; first_name: string; last_name: string; email: string }[];
}

export default function WorkshopPage() {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [options, setOptions] = useState<OptionData>({ individuals: [], companies: [], services: [], employees: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    customer_type: 'individual' as 'individual' | 'company',
    customer_id: '',
    service_id: '',
    assigned_employee: '',
    price: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/workshop');
      const result = await res.json();
      if (result.success) {
        setWorks(result.data);
      }

      // Dropdown сонголтуудыг татах
      const optRes = await fetch('/api/workshop?action=options');
      const optResult = await optRes.json();
      if (optResult.success) {
        setOptions(optResult.data);
      }
    } catch (err) {
      console.error('Failed to fetch workshop data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Үйлчилгээ сонгоход үнийг автоматаар бөглөх
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    const selectedService = options.services.find(s => s.service_id.toString() === sId);
    setFormData({
      ...formData,
      service_id: sId,
      price: selectedService ? selectedService.price.toString() : formData.price
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/workshop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          customer_type: 'individual',
          customer_id: '',
          service_id: '',
          assigned_employee: '',
          price: '',
          status: 'pending',
          priority: 'medium',
          due_date: '',
          description: ''
        });
        fetchData();
      } else {
        alert(result.error || 'Хадгалахад алдаа гарлаа');
      }
    } catch (err) {
      console.error('Error saving work:', err);
      alert('Сервертэй холбогдоход алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const filteredWorks = works.filter(w => 
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.customer_name && w.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (w.employee_name && w.employee_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={12} /> Дууссан</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600"><Wrench size={12} /> Хийгдэж байна</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-red-50 text-red-600"><X size={12} /> Цуцлагдсан</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600"><Clock size={12} /> Хүлээгдэж буй</span>;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Ажлын удирдлага (Workshop)</h1>
          <p className="text-xs text-slate-400 mt-0.5">Харилцагч, үйлчилгээ болон хариуцсан ажилтны хуваарилалт</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
        >
          <Plus size={16} /> Шинэ ажил бүртгэх
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-2xs sm:w-80">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input 
            type="text"
            placeholder="Ажил, харилцагч эсвэл ажилтнаар хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-2xs">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <LayoutList size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredWorks.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
          <Wrench size={40} className="mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-700">Ажил олдсонгүй</p>
          <p className="text-xs text-slate-400">Шинэ ажил бүртгэж эхлэнэ үү.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-4 px-6">Ажил / Гарчиг</th>
                  <th className="py-4 px-6">Харилцагч</th>
                  <th className="py-4 px-6">Үйлчилгээ</th>
                  <th className="py-4 px-6">Хариуцсан ажилтан</th>
                  <th className="py-4 px-6">Үнэ</th>
                  <th className="py-4 px-6">Төлөв</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {filteredWorks.map((work) => (
                  <tr key={work.work_id} className="hover:bg-slate-50/85 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">
                          <Wrench size={18} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{work.title}</span>
                          <span className="text-[10px] text-slate-400 truncate max-w-xs block">{work.description || 'Тайлбар байхгүй'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <User size={14} className="text-slate-400" /> {work.customer_name || 'Харилцагч байхгүй'}
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-normal">
                          {work.customer_type === 'company' ? 'Компани' : 'Хувь хүн'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                        <Briefcase size={12} /> {work.service_name || 'Үйлчилгээ сонгоогүй'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {work.employee_name?.trim() ? work.employee_name : 'Томилогдоогүй'}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {work.price ? `${Number(work.price).toLocaleString()} ₮` : '0 ₮'}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(work.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorks.map((work) => (
            <div key={work.work_id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4 hover:border-blue-200 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">{work.title}</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 mt-1">
                      <Briefcase size={10} /> {work.service_name || 'Үйлчилгээ сонгоогүй'}
                    </span>
                  </div>
                </div>
                {getStatusBadge(work.status)}
              </div>

              <p className="text-xs text-slate-500 line-clamp-2">{work.description || 'Тайлбар байхгүй'}</p>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 flex items-center gap-1"><User size={13} /> Харилцагч:</span>
                  <span className="font-bold">{work.customer_name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 flex items-center gap-1"><ShieldAlert size={13} /> Ажилтан:</span>
                  <span className="font-semibold">{work.employee_name?.trim() ? work.employee_name : 'Томилогдоогүй'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
                <span className="text-slate-400">Үнэ:</span>
                <span className="text-blue-600 text-sm">{work.price ? `${Number(work.price).toLocaleString()} ₮` : '0 ₮'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">Шинэ ажил бүртгэх</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Ажлын нэр / Гарчиг *</label>
                <input 
                  type="text"
                  required
                  placeholder="Жишээ: Засварын ажил..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Харилцагчийн төрөл *</label>
                  <select
                    value={formData.customer_type}
                    onChange={(e) => setFormData({...formData, customer_type: e.target.value as 'individual' | 'company', customer_id: ''})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="individual">Хувь хүн (mt_customer)</option>
                    <option value="company">Компани (mt_customerCompany)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Харилцагч сонгох *</label>
                  <select
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Сонгох --</option>
                    {formData.customer_type === 'individual' ? (
                      options.individuals.map(ind => (
                        <option key={ind.id} value={ind.id}>
                          {ind.last_name} {ind.first_name} ({ind.phone || 'Утасгүй'})
                        </option>
                      ))
                    ) : (
                      options.companies.map(comp => (
                        <option key={comp.id} value={comp.id}>
                          {comp.name} (Регистр: {comp.tax_number})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Үйлчилгээ сонгох (mt_services)</label>
                  <select
                    value={formData.service_id}
                    onChange={handleServiceChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Үйлчилгээ сонгох --</option>
                    {options.services.map(ser => (
                      <option key={ser.service_id} value={ser.service_id}>
                        {ser.name} ({Number(ser.price).toLocaleString()} ₮)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Хариуцсан ажилтан (mt_user)</label>
                  <select
                    value={formData.assigned_employee}
                    onChange={(e) => setFormData({...formData, assigned_employee: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Ажилтан сонгох --</option>
                    {options.employees.map(emp => (
                      <option key={emp.user_id} value={emp.user_id}>
                        {emp.last_name} {emp.first_name} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Үнэ (₮)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Дуусах хугацаа</label>
                  <input 
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Тайлбар</label>
                <textarea 
                  rows={3}
                  placeholder="Ажлын дэлгэрэнгүй тэмдэглэл..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Цуцлах
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )} Хадгалах
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}