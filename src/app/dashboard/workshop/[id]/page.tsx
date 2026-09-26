'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Loading from '@/src/app/components/loading';
import CommonModal from '@/src/app/components/CommonModal';

interface OptionData {
  individuals: { id: string; first_name: string; last_name: string; phone: string }[];
  companies: { id: string; name: string; tax_number: string; phone: string }[];
  services: { service_id: number; name: string; price: number; duration: number }[];
  employees: { user_id: string; first_name: string; last_name: string; email: string }[];
}

export default function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const workId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<OptionData>({ individuals: [], companies: [], services: [], employees: [] });

  // CommonModal-ийн төлөв
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title?: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

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

  const fetchWorkAndOptions = async () => {
    try {
      setLoading(true);
      
      const [workRes, optRes] = await Promise.all([
        fetch(`/api/workshop/${workId}`),
        fetch('/api/workshop?action=options')
      ]);

      const workResult = await workRes.json();
      const optResult = await optRes.json();

      if (optResult.success) {
        setOptions(optResult.data);
      }
      
      if (workResult.success && workResult.data) {
        const item = workResult.data;
        const resolvedType = item.customer_type === 'company' ? 'company' : 'individual';
        const currentCustomerId = resolvedType === 'company' 
          ? (item.company_customer_id || '') 
          : (item.customer_id || '');

        setFormData({
          title: item.title || '',
          customer_type: resolvedType,
          customer_id: currentCustomerId,
          service_id: item.service_id ? item.service_id.toString() : '',
          assigned_employee: item.assigned_employee ? item.assigned_employee.toString() : '',
          price: item.price !== null && item.price !== undefined ? item.price.toString() : '',
          status: item.status || 'pending',
          priority: item.priority ? item.priority.toLowerCase() : 'medium',
          due_date: item.due_date ? item.due_date.split('T')[0] : '',
          description: item.description || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch work detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkAndOptions();
  }, [workId]);

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    const selectedService = options.services.find(s => s.service_id.toString() === sId);
    setFormData(prev => ({
      ...prev,
      service_id: sId,
      price: selectedService ? selectedService.price.toString() : prev.price
    }));
  };

  const handleCustomerTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'individual' | 'company';
    setFormData(prev => ({
      ...prev,
      customer_type: type,
      customer_id: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`/api/workshop/${workId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      
      if (result.success) {
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Амжилттай',
          message: 'Ажлын мэдээлэл амжилттай шинэчлэгдлээ.',
          onConfirm: () => {
            router.back(); // Өмнөх хуудас (4 дүгээр хуудас) руу буцах
          }
        });
      } else {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Алдаа гарлаа',
          message: result.error || 'Хадгалахад алдаа гарлаа.',
        });
      }
    } catch (err) {
      console.error('Error updating work:', err);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Серверийн алдаа',
        message: 'Сервертэй холбогдоход алдаа гарлаа.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 relative">
      {/* Хадгалж байх үед харагдах Loader */}
      {saving && <Loading />}

      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">Ажлын дэлгэрэнгүй & Засварлах</h1>
            <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400">Мэдээллийг өөрчлөөд хадгалах товчийг дарна уу</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Ажлын нэр / Гарчиг *</label>
          <input 
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Харилцагчийн төрөл *</label>
            <select
              value={formData.customer_type}
              onChange={handleCustomerTypeChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-900"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-900"
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
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Үйлчилгээ</label>
            <select
              value={formData.service_id}
              onChange={handleServiceChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-900"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-900"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Төлөв</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-900"
            >
              <option value="pending">Хүлээгдэж буй</option>
              <option value="in_progress">Хийгдэж байна</option>
              <option value="completed">Дууссан</option>
              <option value="cancelled">Цуцлагдсан</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Зэрэглэл (Priority)</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-900"
            >
              <option value="low">Энгийн</option>
              <option value="medium">Дунд</option>
              <option value="high">Яаралтай</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Үнэ (₮)</label>
            <input 
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Дуусах хугацаа</label>
            <input 
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Тайлбар</label>
          <textarea 
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Цуцлах
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )} Өөрчлөлтийг хадгалах
          </button>
        </div>
      </form>

      {/* CommonModal ашиглан хариуг харуулах */}
      <CommonModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => {
          setModal(prev => ({ ...prev, isOpen: false }));
          if (modal.onConfirm) modal.onConfirm();
        }}
        onConfirm={() => {
          setModal(prev => ({ ...prev, isOpen: false }));
          if (modal.onConfirm) modal.onConfirm();
        }}
      />
    </div>
  );
}