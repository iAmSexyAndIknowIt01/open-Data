'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck, Plus, Search, X, Clock, User, Building2, Briefcase, UserCog,
  Phone, Pencil, Trash2, RotateCcw, CalendarDays,
} from 'lucide-react';
import Loading from '@/src/app/components/loading';

type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
type CustomerType = 'individual' | 'company';

interface Reservation {
  reservation_id: string;
  customer_type: CustomerType;
  customer_id: string | null;
  company_customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_register: string | null;
  service_id: number | null;
  service_name: string | null;
  assigned_employee: string | null;
  employee_name: string | null;
  reservation_date: string;
  start_time: string;
  end_time: string | null;
  status: ReservationStatus;
  note: string | null;
}

interface OptionData {
  individuals: { id: string; first_name: string; last_name: string; phone: string }[];
  companies: { id: string; name: string; tax_number: string; phone: string }[];
  services: { service_id: number; name: string; price: number; duration: number | null }[];
  employees: { user_id: string; first_name: string; last_name: string; position: string | null }[];
}

const STATUS_META: Record<ReservationStatus, { label: string; className: string }> = {
  pending: {
    label: 'Хүлээгдэж буй',
    className: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
  },
  confirmed: {
    label: 'Баталгаажсан',
    className: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
  },
  completed: {
    label: 'Үйлчлүүлсэн',
    className: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
  },
  cancelled: {
    label: 'Цуцлагдсан',
    className: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800',
  },
  no_show: {
    label: 'Ирээгүй',
    className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  },
};

const WEEKDAYS = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];

// Хэрэглэгчийн орон нутгийн цагаар YYYY-MM-DD
function localDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateHeading(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
  const prefix = date === localDate() ? 'Өнөөдөр · ' : date === localDate(1) ? 'Маргааш · ' : '';
  return `${prefix}${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')} (${weekday})`;
}

const emptyForm = () => ({
  customer_type: 'individual' as CustomerType,
  customer_id: '',
  service_id: '',
  assigned_employee: '',
  reservation_date: localDate(),
  start_time: '',
  end_time: '',
  status: 'pending' as ReservationStatus,
  note: '',
});

const inputClass =
  'w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500';
const filterClass =
  'w-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700 outline-none cursor-pointer focus:border-blue-500 transition-all';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [options, setOptions] = useState<OptionData>({ individuals: [], companies: [], services: [], employees: [] });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Шүүлтүүр
  const [searchQuery, setSearchQuery] = useState('');
  const [rangeFilter, setRangeFilter] = useState<'upcoming' | 'today' | 'date' | 'past' | 'all'>('upcoming');
  const [dateFilter, setDateFilter] = useState(localDate());
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReservations = async () => {
    const res = await fetch('/api/reservations');
    const result = await res.json();
    if (result.success) setReservations(result.data);
  };

  useEffect(() => {
    (async () => {
      try {
        const [, optRes, userRes] = await Promise.all([
          fetchReservations(),
          fetch('/api/reservations?action=options').then((r) => r.json()),
          fetch('/api/user').then((r) => r.json()),
        ]);
        if (optRes.success) setOptions(optRes.data);
        if (userRes.success) setIsAdmin(userRes.data?.role === 'admin');
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const today = localDate();
    const q = searchQuery.trim().toLowerCase();
    return reservations.filter((r) => {
      const matchesRange =
        rangeFilter === 'all' ||
        (rangeFilter === 'upcoming' && r.reservation_date >= today) ||
        (rangeFilter === 'today' && r.reservation_date === today) ||
        (rangeFilter === 'date' && r.reservation_date === dateFilter) ||
        (rangeFilter === 'past' && r.reservation_date < today);
      const matchesSearch =
        !q ||
        r.customer_name.toLowerCase().includes(q) ||
        (r.customer_phone ?? '').toLowerCase().includes(q) ||
        (r.service_name ?? '').toLowerCase().includes(q) ||
        (r.employee_name ?? '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesEmployee =
        employeeFilter === 'all' ||
        (employeeFilter === 'none' ? !r.assigned_employee : r.assigned_employee === employeeFilter);
      return matchesRange && matchesSearch && matchesStatus && matchesEmployee;
    });
  }, [reservations, searchQuery, rangeFilter, dateFilter, statusFilter, employeeFilter]);

  // Өнгөрсөн захиалгыг шинээс нь хуучин руу, бусдыг ойрын өдрөөс нь харуулна
  const grouped = useMemo(() => {
    const groups = new Map<string, Reservation[]>();
    for (const r of filtered) {
      const list = groups.get(r.reservation_date) ?? [];
      list.push(r);
      groups.set(r.reservation_date, list);
    }
    const entries = [...groups.entries()];
    return rangeFilter === 'past' ? entries.reverse() : entries;
  }, [filtered, rangeFilter]);

  const todayStats = useMemo(() => {
    const today = reservations.filter((r) => r.reservation_date === localDate());
    return {
      total: today.filter((r) => r.status !== 'cancelled').length,
      pending: today.filter((r) => r.status === 'pending').length,
      confirmed: today.filter((r) => r.status === 'confirmed').length,
      completed: today.filter((r) => r.status === 'completed').length,
    };
  }, [reservations]);

  const hasActiveFilters =
    searchQuery !== '' || rangeFilter !== 'upcoming' || statusFilter !== 'all' || employeeFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setRangeFilter('upcoming');
    setStatusFilter('all');
    setEmployeeFilter('all');
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm());
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (r: Reservation) => {
    setEditing(r);
    setFormData({
      customer_type: r.customer_type,
      customer_id: (r.customer_type === 'company' ? r.company_customer_id : r.customer_id) ?? '',
      service_id: r.service_id ? String(r.service_id) : '',
      assigned_employee: r.assigned_employee ?? '',
      reservation_date: r.reservation_date,
      start_time: r.start_time,
      end_time: r.end_time ?? '',
      status: r.status,
      note: r.note ?? '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Үйлчилгээ сонгоход үргэлжлэх хугацаагаар дуусах цагийг санал болгоно
  const suggestEndTime = (start: string, serviceId: string) => {
    const service = options.services.find((s) => String(s.service_id) === serviceId);
    if (!start || !service?.duration) return '';
    const [h, m] = start.split(':').map(Number);
    const total = h * 60 + m + Number(service.duration);
    if (total >= 24 * 60) return '';
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      setSaving(true);
      const res = await fetch(editing ? `/api/reservations/${editing.reservation_id}` : '/api/reservations', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        await fetchReservations();
      } else {
        setFormError(result.error || 'Хадгалахад алдаа гарлаа');
      }
    } catch (err) {
      console.error('Error saving reservation:', err);
      setFormError('Сервертэй холбогдоход алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (r: Reservation, status: ReservationStatus) => {
    const previous = r.status;
    setReservations((list) => list.map((x) => (x.reservation_id === r.reservation_id ? { ...x, status } : x)));
    try {
      const res = await fetch(`/api/reservations/${r.reservation_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
    } catch (err) {
      setReservations((list) =>
        list.map((x) => (x.reservation_id === r.reservation_id ? { ...x, status: previous } : x))
      );
      alert(err instanceof Error && err.message ? err.message : 'Төлөв шинэчлэхэд алдаа гарлаа');
    }
  };

  const handleDelete = async () => {
    if (!editing || !confirm('Энэ захиалгыг бүр мөсөн устгах уу?')) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/reservations/${editing.reservation_id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        await fetchReservations();
      } else {
        setFormError(result.error || 'Устгахад алдаа гарлаа');
      }
    } finally {
      setSaving(false);
    }
  };

  // Засах үед харилцагч устсан бол сонголтонд байхгүй тул хуулбар нэрийг нь харуулна
  const customerMissing =
    !!editing &&
    formData.customer_type === editing.customer_type &&
    !formData.customer_id;

  return (
    <div className="space-y-5 sm:space-y-6 pb-20 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Захиалга</h1>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Харилцагчийн үйлчлүүлэх өдөр, цагийг захиалж, хариуцах ажилтанд хуваарилах</p>
        </div>
        <button
          onClick={openCreate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl sm:rounded-2xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> Шинэ захиалга
        </button>
      </div>

      {/* Өнөөдрийн тойм */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Өнөөдрийн захиалга', value: todayStats.total, color: 'text-slate-900 dark:text-white' },
          { label: 'Хүлээгдэж буй', value: todayStats.pending, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Баталгаажсан', value: todayStats.confirmed, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Үйлчлүүлсэн', value: todayStats.completed, color: 'text-emerald-600 dark:text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{loading ? '–' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Шүүлтүүр */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700 w-full lg:w-88 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Харилцагч, утас, үйлчилгээ, ажилтнаар хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>
          <span className="text-xs font-bold text-slate-400">
            Үр дүн: <span className="text-slate-800 dark:text-slate-200">{filtered.length}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Хугацаа</label>
            <div className="flex gap-2">
              <select
                value={rangeFilter}
                onChange={(e) => setRangeFilter(e.target.value as typeof rangeFilter)}
                className={filterClass}
              >
                <option value="upcoming">Ирэх захиалгууд</option>
                <option value="today">Өнөөдөр</option>
                <option value="date">Өдөр сонгох</option>
                <option value="past">Өнгөрсөн</option>
                <option value="all">Бүгд</option>
              </select>
              {rangeFilter === 'date' && (
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={filterClass}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Төлөв</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={filterClass}>
              <option value="all">Бүх төлөв</option>
              {Object.entries(STATUS_META).map(([value, meta]) => (
                <option key={value} value={value}>{meta.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Хариуцах ажилтан</label>
            <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className={filterClass}>
              <option value="all">Бүх ажилтан</option>
              <option value="none">Хуваарилаагүй</option>
              {options.employees.map((emp) => (
                <option key={emp.user_id} value={emp.user_id}>
                  {emp.last_name} {emp.first_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer py-2"
              >
                <RotateCcw size={12} /> Шүүлтүүрийг цэвэрлэх
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Жагсаалт */}
      {loading ? (
        <Loading />
      ) : grouped.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-2xl flex items-center justify-center mx-auto">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Захиалга олдсонгүй</p>
            <p className="text-xs text-slate-400 mt-0.5">Шинэ захиалга бүртгэх эсвэл шүүлтүүрээ өөрчилнө үү.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, items]) => (
            <section key={date} className="space-y-2">
              <h2 className="flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400 px-1">
                <CalendarDays size={14} /> {formatDateHeading(date)}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">{items.length}</span>
              </h2>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((r) => (
                  <div
                    key={r.reservation_id}
                    className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-5 p-4 ${
                      r.status === 'cancelled' || r.status === 'no_show' ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 md:w-32 shrink-0">
                      <Clock size={15} className="text-blue-500" />
                      <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                        {r.start_time}{r.end_time ? `–${r.end_time}` : ''}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {r.customer_type === 'company' ? (
                          <Building2 size={14} className="text-slate-400 shrink-0" />
                        ) : (
                          <User size={14} className="text-slate-400 shrink-0" />
                        )}
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{r.customer_name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {r.customer_type === 'company' ? 'Байгууллага' : 'Хувь хүн'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {r.customer_phone && (
                          <span className="inline-flex items-center gap-1"><Phone size={11} /> {r.customer_phone}</span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Briefcase size={11} /> {r.service_name || 'Үйлчилгээ сонгоогүй'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <UserCog size={11} />
                          {r.employee_name || <span className="italic">Хуваарилаагүй</span>}
                        </span>
                      </div>
                      {r.note && <p className="text-[11px] text-slate-400 line-clamp-1">{r.note}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r, e.target.value as ReservationStatus)}
                        className={`text-[11px] font-extrabold px-2.5 py-1.5 rounded-full border outline-none cursor-pointer ${STATUS_META[r.status].className}`}
                        aria-label="Төлөв солих"
                      >
                        {Object.entries(STATUS_META).map(([value, meta]) => (
                          <option key={value} value={value}>{meta.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => openEdit(r)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        aria-label="Засах"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Захиалга үүсгэх / засах */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {editing ? 'Захиалга засах' : 'Шинэ захиалга'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Харилцагчийн төрөл *</label>
                  <select
                    value={formData.customer_type}
                    onChange={(e) => setFormData({ ...formData, customer_type: e.target.value as CustomerType, customer_id: '' })}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="individual">Хувь хүн</option>
                    <option value="company">Байгууллага</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Харилцагч *</label>
                  <select
                    required={!customerMissing}
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="">
                      {customerMissing ? `${editing?.customer_name} (хадгалсан)` : '-- Сонгох --'}
                    </option>
                    {formData.customer_type === 'individual'
                      ? options.individuals.map((ind) => (
                          <option key={ind.id} value={ind.id}>
                            {ind.last_name} {ind.first_name} ({ind.phone || 'Утасгүй'})
                          </option>
                        ))
                      : options.companies.map((comp) => (
                          <option key={comp.id} value={comp.id}>
                            {comp.name} (Регистр: {comp.tax_number})
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Үйлчилгээ</label>
                <select
                  value={formData.service_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service_id: e.target.value,
                      end_time: suggestEndTime(formData.start_time, e.target.value) || formData.end_time,
                    })
                  }
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="">-- Үйлчилгээ сонгох --</option>
                  {options.services.map((s) => (
                    <option key={s.service_id} value={s.service_id}>
                      {s.name}{s.duration ? ` · ${s.duration} мин` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Өдөр *</label>
                  <input
                    type="date"
                    required
                    value={formData.reservation_date}
                    onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Эхлэх цаг *</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        start_time: e.target.value,
                        end_time: suggestEndTime(e.target.value, formData.service_id) || formData.end_time,
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Дуусах цаг</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Хариуцах ажилтан</label>
                  <select
                    value={formData.assigned_employee}
                    onChange={(e) => setFormData({ ...formData, assigned_employee: e.target.value })}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="">-- Сонгох --</option>
                    {options.employees.map((emp) => (
                      <option key={emp.user_id} value={emp.user_id}>
                        {emp.last_name} {emp.first_name}{emp.position ? ` (${emp.position})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Төлөв</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ReservationStatus })}
                    className={`${inputClass} cursor-pointer`}
                  >
                    {Object.entries(STATUS_META).map(([value, meta]) => (
                      <option key={value} value={value}>{meta.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Тэмдэглэл</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Нэмэлт мэдээлэл..."
                  className={inputClass}
                  rows={3}
                />
              </div>

              {formError && (
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2.5 rounded-xl">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  {editing && isAdmin && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} /> Устгах
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
                    Цуцлах
                  </button>
                  <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer">
                    {saving ? 'Хадгалж байна...' : 'Хадгалах'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
