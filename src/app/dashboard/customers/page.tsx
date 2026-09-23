'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, User, Plus, Search, Mail, Phone, MapPin, 
  X, CheckCircle2, LayoutList, LayoutGrid, FileText 
} from 'lucide-react';
import Loading from '@/src/app/components/loading';

interface Customer {
  customer_id: string;
  customer_type: 'company' | 'individual';
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  status: string | null;
  male?: string | null; //
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'company' | 'individual'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    customer_type: 'company' as 'company' | 'individual',
    name: '',         
    first_name: '',   
    last_name: '',    
    email: '',
    phone: '',
    address: '',
    tax_number: '',
    male: 'Эрэгтэй'
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customers');
      const result = await res.json();
      if (result.success) {
        setCustomers(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        setFormData({ 
          customer_type: 'company', 
          name: '', 
          first_name: '', 
          last_name: '', 
          email: '', 
          phone: '', 
          address: '', 
          tax_number: '',
          male: 'Эрэгтэй'
        });
        fetchCustomers();
      } else {
        alert(result.error || 'Хадгалахад алдаа гарлаа');
      }
    } catch (err) {
      console.error('Error saving customer:', err);
      alert('Сервертэй холбогдоход алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const displayName = c.customer_type === 'company' ? c.name : `${c.last_name || ''} ${c.first_name || ''}`;
    const matchesSearch = (displayName && displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'company') return matchesSearch && c.customer_type === 'company';
    if (activeTab === 'individual') return matchesSearch && c.customer_type === 'individual';
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Харилцагчид</h1>
          <p className="text-xs text-slate-400 mt-0.5">Компани болон хувь хүний харилцагчдын жагсаалт</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
        >
          <Plus size={16} /> Шинэ харилцагч нэмэх
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-2xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Бүгд
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'company' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Байгууллага
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'individual' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Хувь хүн
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-2xs sm:w-80">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input 
              type="text"
              placeholder="Хайх..."
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
              title="Жагсаалтаар харах"
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
              title="Кардаар харах"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
          <Building2 size={40} className="mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-700">Харилцагч олдсонгүй</p>
          <p className="text-xs text-slate-400">Шинэ харилцагч нэмж бүртгэнэ үү.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-4 px-6">Харилцагч</th>
                  <th className="py-4 px-6">Төрөл / ТТД</th>
                  <th className="py-4 px-6">Холбоо барих</th>
                  <th className="py-4 px-6">Хаяг</th>
                  <th className="py-4 px-6">Төлөв</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {filteredCustomers.map((customer) => {
                  const displayName = customer.customer_type === 'company' 
                    ? customer.name 
                    : `${customer.last_name || ''} ${customer.first_name || ''}`.trim();

                  return (
                    <tr 
                      key={customer.customer_id} 
                      onClick={() => router.push(`/dashboard/customers/${customer.customer_id}?type=${customer.customer_type}`)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${
                            customer.customer_type === 'company' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                          }`}>
                            {customer.customer_type === 'company' ? <Building2 size={18} /> : <User size={18} />}
                          </div>
                          <span className="font-bold text-slate-900">{displayName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">
                          {customer.customer_type === 'company' ? 'Байгууллага' : 'Хувь хүн'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-extrabold uppercase">
                          {customer.customer_type === 'company' ? `ТТД: ${customer.tax_number || 'Байхгүй'}` : '-'}
                        </div>
                      </td>
                      <td className="py-4 px-6 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Mail size={13} className="text-slate-400 shrink-0" />
                          <span>{customer.email || 'Имэйл байхгүй'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} className="text-slate-400 shrink-0" />
                          <span>{customer.phone || 'Утас байхгүй'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{customer.address || 'Хаяг байхгүй'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                          <CheckCircle2 size={12} /> Идэвхтэй
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => {
            const displayName = customer.customer_type === 'company' 
              ? customer.name 
              : `${customer.last_name || ''} ${customer.first_name || ''}`.trim();

            return (
              <div 
                key={customer.customer_id} 
                onClick={() => router.push(`/dashboard/customers/${customer.customer_id}?type=${customer.customer_type}`)}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4 hover:border-blue-200 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 ${
                      customer.customer_type === 'company' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {customer.customer_type === 'company' ? <Building2 size={20} /> : <User size={20} />}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900">{displayName}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        {customer.customer_type === 'company' ? `ТТД: ${customer.tax_number || 'Байхгүй'}` : 'Хувь хүн'}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={12} /> Идэвхтэй
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{customer.email || 'Имэйл байхгүй'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{customer.phone || 'Утас байхгүй'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{customer.address || 'Хаяг байхгүй'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Шинэ харилцагч нэмэх модал цонх */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900">Шинэ харилцагч нэмэх</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Харилцагчийн төрөл</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, customer_type: 'company' })}
                    className={`py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                      formData.customer_type === 'company' 
                        ? 'bg-blue-50 border-blue-200 text-blue-600' 
                        : 'border-slate-100 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Байгууллага
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, customer_type: 'individual' })}
                    className={`py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                      formData.customer_type === 'individual' 
                        ? 'bg-blue-50 border-blue-200 text-blue-600' 
                        : 'border-slate-100 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Хувь хүн
                  </button>
                </div>
              </div>

              {formData.customer_type === 'company' ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Компанийн нэр</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Жишээ: Компани ХХК"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Татвар төлөгчийн дугаар (ТТД)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.tax_number}
                      onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                      placeholder="Жишээ: 1234567"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Овог</label>
                      <input 
                        type="text" 
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Овог"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Нэр</label>
                      <input 
                        type="text" 
                        required
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="Нэр"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Хүйс</label>
                    <select
                      value={formData.male}
                      onChange={(e) => setFormData({ ...formData, male: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="Эрэгтэй">Эрэгтэй</option>
                      <option value="Эмэгтэй">Эмэгтэй</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Имэйл хаяг</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@mail.com"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Утасны дугаар</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="99112233"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Хаяг байршил</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Гэрийн эсвэл албан байгууллагын хаяг"
                  rows={2}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
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