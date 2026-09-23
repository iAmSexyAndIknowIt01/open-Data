'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Building2, User, Mail, Phone, MapPin, ArrowLeft, Calendar, ShieldCheck, FileText, RefreshCw, Edit3, Save, X } from 'lucide-react';
import Loading from '@/src/app/components/loading';
import CommonModal from '@/src/app/components/CommonModal';

interface CustomerDetail {
  customer_id: string;
  customer_type: 'company' | 'individual';
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string | null;
  phone: string | null;
  male?: string | null;
  address: string | null;
  tax_number?: string | null;
  status: string | null;
  create_date: string;
  update_date: string;
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const customerId = resolvedParams.id;
  const searchParams = useSearchParams();
  const customerType = searchParams.get('type') || 'company';
  const router = useRouter();

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Засварлах горимын төлөвүүд
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CustomerDetail>>({});
  const [saving, setSaving] = useState(false);

  // Modal төлөвүүд
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  useEffect(() => {
    const fetchCustomerDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/customers/${customerId}?type=${customerType}`);
        const result = await res.json();
        if (result.success) {
          setCustomer(result.data);
          setFormData(result.data); // Формын өгөгдлийг оноох
        } else {
          setModalState({
            isOpen: true,
            type: 'error',
            title: 'Алдаа гарлаа',
            message: result.error || 'Мэдээлэл олдсонгүй',
          });
        }
      } catch (err) {
        console.error('Failed to fetch customer detail:', err);
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Холболтын алдаа',
          message: 'Мэдээлэл авахад алдаа гарлаа.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetail();
  }, [customerId, customerType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/customers/${customerId}?type=${customerType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (result.success) {
        setCustomer(result.data);
        setIsEditing(false);
        router.refresh();
        setModalState({
          isOpen: true,
          type: 'success',
          title: 'Амжилттай',
          message: 'Харилцагчийн мэдээлэл амжилттай шинэчлэгдлээ.',
        });
      } else {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Хадгалж чадсангүй',
          message: result.error || 'Хадгалахад алдаа гарлаа.',
        });
      }
    } catch (err) {
      console.error('Failed to update customer:', err);
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Системийн алдаа',
        message: 'Холболтын алдаа гарлаа.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  if (!customer) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
        <p className="text-sm font-bold text-slate-700">Харилцагчийн мэдээлэл олдсонгүй.</p>
        <button onClick={() => router.back()} className="text-xs font-bold text-blue-600 hover:underline">
          Буцах
        </button>
      </div>
    );
  }

  const displayName = customer.customer_type === 'company' 
    ? customer.name 
    : `${customer.last_name || ''} ${customer.first_name || ''}`.trim();

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Ерөнхий модал ашиглалт */}
      <CommonModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalState.onConfirm}
      />

      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft size={16} /> Буцах
        </button>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            <Edit3 size={16} /> Засварлах
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setIsEditing(false); setFormData(customer); }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-2xl transition-all cursor-pointer"
            >
              <X size={16} /> Болих
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save size={16} /> {saving ? 'Хадгалж байна...' : 'Хадгалах'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 ${
              customer.customer_type === 'company' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
            }`}>
              {customer.customer_type === 'company' ? <Building2 size={32} /> : <User size={32} />}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{displayName}</h1>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                {customer.customer_type === 'company' 
                  ? `Байгууллага (ТТД: ${customer.tax_number || '-'})` 
                  : `Хувь хүний харилцагч ${customer.male ? `(${customer.male})` : ''}`}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 w-fit">
            <ShieldCheck size={14} /> {customer.status || 'active'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Зүүн багана */}
          <div className="space-y-4">
            <h3 className="font-black text-slate-400 uppercase tracking-wider text-[11px]">Холбоо барих мэдээлэл</h3>
            
            {/* Имэйл */}
            <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <div className="w-full">
                <p className="text-[10px] text-slate-400 font-bold">Имэйл хаяг</p>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="w-full mt-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="font-bold text-slate-800">{customer.email || 'Байхгүй'}</p>
                )}
              </div>
            </div>

            {/* Утас */}
            <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl">
              <Phone size={16} className="text-slate-400 shrink-0" />
              <div className="w-full">
                <p className="text-[10px] text-slate-400 font-bold">Утасны дугаар</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full mt-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="font-bold text-slate-800">{customer.phone || 'Байхгүй'}</p>
                )}
              </div>
            </div>

            {/* Компанийн хувьд: ТТД болон нэр */}
            {customer.customer_type === 'company' && (
              <>
                <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl">
                  <FileText size={16} className="text-slate-400 shrink-0" />
                  <div className="w-full">
                    <p className="text-[10px] text-slate-400 font-bold">Компанийн нэр</p>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full mt-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                      />
                    ) : (
                      <p className="font-bold text-slate-800">{customer.name || 'Байхгүй'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl">
                  <FileText size={16} className="text-slate-400 shrink-0" />
                  <div className="w-full">
                    <p className="text-[10px] text-slate-400 font-bold">Татвар төлөгчийн дугаар (ТТД)</p>
                    {isEditing ? (
                      <input
                        type="text"
                        name="tax_number"
                        value={formData.tax_number || ''}
                        onChange={handleInputChange}
                        className="w-full mt-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                      />
                    ) : (
                      <p className="font-bold text-slate-800">{customer.tax_number || 'Байхгүй'}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Хувь хүний хувьд: Овог, нэр, хүйс */}
            {customer.customer_type === 'individual' && (
              <>
                <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl">
                  <User size={16} className="text-slate-400 shrink-0" />
                  <div className="w-full grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold">Овог</p>
                      {isEditing ? (
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name || ''}
                          onChange={handleInputChange}
                          className="w-full mt-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                        />
                      ) : (
                        <p className="font-bold text-slate-800">{customer.last_name || '-'}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold">Нэр</p>
                      {isEditing ? (
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name || ''}
                          onChange={handleInputChange}
                          className="w-full mt-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                        />
                      ) : (
                        <p className="font-bold text-slate-800">{customer.first_name || '-'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl">
                  <User size={16} className="text-slate-400 shrink-0" />
                  <div className="w-full">
                    <p className="text-[10px] text-slate-400 font-bold">Хүйс</p>
                    {isEditing ? (
                      <select
                        name="male"
                        value={formData.male || 'Эрэгтэй'}
                        onChange={handleInputChange}
                        className="w-full mt-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                      >
                        <option value="Эрэгтэй">Эрэгтэй</option>
                        <option value="Эмэгтэй">Эмэгтэй</option>
                      </select>
                    ) : (
                      <p className="font-bold text-slate-800">{customer.male || 'Байхгүй'}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Баруун багана */}
          <div className="space-y-4">
            <h3 className="font-black text-slate-400 uppercase tracking-wider text-[11px]">Бусад мэдээлэл</h3>
            
            <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl">
              <MapPin size={16} className="text-slate-400 shrink-0" />
              <div className="w-full">
                <p className="text-[10px] text-slate-400 font-bold">Хаяг байршил</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    className="w-full mt-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="font-bold text-slate-800">{customer.address || 'Байхгүй'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold">Бүртгүүлсэн огноо</p>
                <p className="font-bold text-slate-800">
                  {customer.create_date ? new Date(customer.create_date).toLocaleString() : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl">
              <RefreshCw size={16} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold">Шинэчилсэн огноо</p>
                <p className="font-bold text-slate-800">
                  {customer.update_date ? new Date(customer.update_date).toLocaleString() : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}