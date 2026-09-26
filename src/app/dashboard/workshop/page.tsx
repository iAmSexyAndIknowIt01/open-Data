'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Wrench, Plus, Search, Clock, CheckCircle2, 
  X, LayoutList, LayoutGrid, User, Briefcase, ShieldAlert, RotateCcw, ChevronLeft, ChevronRight 
} from 'lucide-react';
import Loading from '@/src/app/components/loading';

interface WorkItem {
  work_id: string;
  title: string;
  customer_type: 'individual' | 'company';
  customer_name: string;
  service_name: string;
  assigned_employee: string;
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [works, setWorks] = useState<WorkItem[]>([]);
  const [options, setOptions] = useState<OptionData>({ individuals: [], companies: [], services: [], employees: [] });
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');

  // Pagination states - URL-аас page параметрийг уншиж анхны утгыг оноох
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) || 1 : 1;
  });
  const itemsPerPage = 9;

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Шүүлтүүр эсвэл хайлт өөрчлөгдөхөд хуудасны дугаар 1 рүү шилжих бөгөөд URL-ийг мөн шинэчилнэ
  useEffect(() => {
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchQuery, statusFilter, priorityFilter, customerTypeFilter, employeeFilter]);

  // currentPage өөрчлөгдөх бүрт URL рүү хуудасны дугаарыг хадгалах
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  };

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

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCustomerTypeFilter('all');
    setEmployeeFilter('all');
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    statusFilter !== 'all' || 
    priorityFilter !== 'all' || 
    customerTypeFilter !== 'all' || 
    employeeFilter !== 'all';

  const filteredWorks = works.filter(w => {
    const matchesSearch = 
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.customer_name && w.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.employee_name && w.employee_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || w.priority === priorityFilter;
    const matchesCustomerType = customerTypeFilter === 'all' || w.customer_type === customerTypeFilter;
    const matchesEmployee = employeeFilter === 'all' || w.assigned_employee === employeeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCustomerType && matchesEmployee;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWorks = filteredWorks.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100/50 dark:border-emerald-800"><CheckCircle2 size={11} /> Дууссан</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100/50 dark:border-blue-800"><Wrench size={11} /> Хийгдэж байна</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0 border border-rose-100/50 dark:border-rose-800"><X size={11} /> Цуцлагдсан</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-100/50 dark:border-amber-800"><Clock size={11} /> Хүлээгдэж буй</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800">Яаралтай</span>;
      case 'medium':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">Дунд</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Энгийн</span>;
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-20 text-slate-800 dark:text-slate-100">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ажлын удирдлага</h1>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 mt-0.5">Харилцагч, үйлчилгээ болон ажилтны гүйцэтгэлийг хянах</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl sm:rounded-2xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> Шинэ ажил бүртгэх
        </button>
      </div>

      {/* Filter & Search Section */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700 w-full lg:w-88 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input 
              type="text"
              placeholder="Ажил, харилцагч эсвэл ажилтнаар хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-2">
            <span className="text-xs font-bold text-slate-400">
              Үр дүн: <span className="text-slate-800 dark:text-slate-200">{filteredWorks.length}</span>
            </span>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Жагсаалтаар харах"
              >
                <LayoutList size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Хэсгээр харах"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Төлөв</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700 outline-none cursor-pointer focus:border-blue-500 transition-all"
            >
              <option value="all">Бүх төлөв</option>
              <option value="pending">Хүлээгдэж буй</option>
              <option value="in_progress">Хийгдэж байна</option>
              <option value="completed">Дууссан</option>
              <option value="cancelled">Цуцлагдсан</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Зэрэглэл</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700 outline-none cursor-pointer focus:border-blue-500 transition-all"
            >
              <option value="all">Бүх зэрэглэл</option>
              <option value="low">Энгийн</option>
              <option value="medium">Дунд</option>
              <option value="high">Яаралтай</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Харилцагчийн төрөл</label>
            <select
              value={customerTypeFilter}
              onChange={(e) => setCustomerTypeFilter(e.target.value)}
              className="w-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700 outline-none cursor-pointer focus:border-blue-500 transition-all"
            >
              <option value="all">Бүх харилцагч</option>
              <option value="individual">Хувь хүн</option>
              <option value="company">Компани</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Хариуцсан ажилтан</label>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700 outline-none cursor-pointer focus:border-blue-500 transition-all"
            >
              <option value="all">Бүх ажилтан</option>
              {options.employees.map(emp => (
                <option key={emp.user_id} value={emp.user_id}>
                  {emp.last_name} {emp.first_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">Идэвхтэй шүүлтүүрүүд</span>
            </div>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              <RotateCcw size={12} /> Шүүлтүүрийг цэвэрлэх
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : filteredWorks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-2xl flex items-center justify-center mx-auto">
            <Wrench size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Ажил олдсонгүй</p>
            <p className="text-xs text-slate-400 mt-0.5">Хайлт эсвэл шүүлтүүрийн утгыг өөрчилж үзнэ үү.</p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer mt-2"
            >
              <RotateCcw size={12} /> Бүх шүүлтүүрийг арилгах
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-180">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-6">Ажил / Гарчиг</th>
                  <th className="py-3.5 px-6">Харилцагч</th>
                  <th className="py-3.5 px-6">Үйлчилгээ</th>
                  <th className="py-3.5 px-6">Ажилтан</th>
                  <th className="py-3.5 px-6">Зэрэглэл</th>
                  <th className="py-3.5 px-6">Үнэ</th>
                  <th className="py-3.5 px-6">Төлөв</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {currentWorks.map((work) => (
                  <tr 
                    key={work.work_id} 
                    onClick={() => router.push(`/dashboard/workshop/${work.work_id}`)}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center font-black transition-all shrink-0">
                          <Wrench size={16} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block">{work.title}</span>
                          <span className="text-[11px] text-slate-400 truncate max-w-55 block">{work.description || 'Тайлбар байхгүй'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-bold">
                        <User size={13} className="text-slate-400 shrink-0" /> 
                        <span className="truncate max-w-32">{work.customer_name || 'Харилцагч байхгүй'}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-normal shrink-0">
                          {work.customer_type === 'company' ? 'Компани' : 'Хувь хүн'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-35">
                        <Briefcase size={11} className="shrink-0" /> {work.service_name || 'Үйлчилгээ сонгоогүй'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300 truncate max-w-30">
                      {work.employee_name?.trim() ? work.employee_name : <span className="text-slate-300 dark:text-slate-600 italic">Томилогдоогүй</span>}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getPriorityBadge(work.priority)}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {work.price ? `${Number(work.price).toLocaleString()} ₮` : '0 ₮'}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getStatusBadge(work.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentWorks.map((work) => (
            <div 
              key={work.work_id} 
              onClick={() => router.push(`/dashboard/workshop/${work.work_id}`)}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-3.5 hover:border-blue-300 dark:hover:border-slate-700 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center font-black transition-all shrink-0">
                    <Wrench size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{work.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Briefcase size={10} /> {work.service_name || 'Үйлчилгээ сонгоогүй'}
                      </span>
                      {getPriorityBadge(work.priority)}
                    </div>
                  </div>
                </div>
                {getStatusBadge(work.status)}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{work.description || 'Тайлбар байхгүй'}</p>

              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1"><User size={13} /> Харилцагч:</span>
                  <span className="font-bold truncate max-w-40">{work.customer_name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1"><ShieldAlert size={13} /> Ажилтан:</span>
                  <span className="font-semibold truncate max-w-40">{work.employee_name?.trim() ? work.employee_name : 'Томилогдоогүй'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
                <span className="text-slate-400">Нийт үнэ:</span>
                <span className="text-blue-600 dark:text-blue-400 text-sm">{work.price ? `${Number(work.price).toLocaleString()} ₮` : '0 ₮'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Component */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-400">
            Нийт <span className="font-bold text-slate-700 dark:text-slate-200">{filteredWorks.length}</span> өгөгдлөөс <span className="font-bold text-slate-700 dark:text-slate-200">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredWorks.length)}</span> хүртэл харуулж байна
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1 px-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white">{currentPage}</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-bold text-slate-400">{totalPages}</span>
            </div>

            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white">Шинэ ажил бүртгэх</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Ажлын нэр / Гарчиг *</label>
                <input 
                  type="text"
                  required
                  placeholder="Жишээ: Засварын ажил..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Харилцагчийн төрөл *</label>
                  <select
                    value={formData.customer_type}
                    onChange={(e) => setFormData({...formData, customer_type: e.target.value as 'individual' | 'company', customer_id: ''})}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 bg-white dark:bg-slate-800 cursor-pointer"
                  >
                    <option value="individual">Хувь хүн</option>
                    <option value="company">Компани</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Харилцагч сонгох *</label>
                  <select
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 bg-white dark:bg-slate-800 cursor-pointer"
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
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Үйлчилгээ сонгох</label>
                  <select
                    value={formData.service_id}
                    onChange={handleServiceChange}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 bg-white dark:bg-slate-800 cursor-pointer"
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
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Хариуцсан ажилтан</label>
                  <select
                    value={formData.assigned_employee}
                    onChange={(e) => setFormData({...formData, assigned_employee: e.target.value})}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 bg-white dark:bg-slate-800 cursor-pointer"
                  >
                    <option value="">-- Ажилтан сонгох --</option>
                    {options.employees.map(emp => (
                      <option key={emp.user_id} value={emp.user_id}>
                        {emp.last_name} {emp.first_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Үнэ (₮)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Зэрэглэл</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 bg-white dark:bg-slate-800 cursor-pointer"
                  >
                    <option value="low">Энгийн</option>
                    <option value="medium">Дунд</option>
                    <option value="high">Яаралтай</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Дуусах хугацаа</label>
                <input 
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Тайлбар</label>
                <textarea 
                  rows={3}
                  placeholder="Нэмэлт мэдээлэл..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Цуцлах
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Хадгалж байна...' : 'Хадгалах'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}