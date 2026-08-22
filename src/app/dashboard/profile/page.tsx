'use client';

import { useState, useEffect } from 'react';
import { User, Building2, Mail, Phone, MapPin, Shield, CheckCircle2, Edit3, X, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // mt_company хүснэгтийн багануудын дагуух төлөв
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    phoneNumber: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [tempData, setTempData] = useState(formData);

  // API-аас компани мэдээлэл татаж авах
  useEffect(() => {
    async function fetchCompanyData() {
      try {
        const res = await fetch('/api/company');
        const result = await res.json();
        if (result.success) {
          const comp = result.data;
          const initialData = {
            companyName: comp.company_name || '',
            ownerName: comp.owner_name || '',
            email: comp.email || '',
            phoneNumber: comp.phone_number || '',
            address: comp.address || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          setFormData(initialData);
          setTempData(initialData);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanyData();
  }, []);

  const handleEditClick = () => {
    setTempData(formData);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setFormData(tempData);
    setIsEditing(false);
    setErrorMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Нууц үг солих үеийн энгийн шалгуур
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('Шинэ нууц үг хоорондоо таарахгүй байна.');
      return;
    }

    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();

      if (result.success) {
        setIsEditing(false);
        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 3000);
      } else {
        setErrorMessage(result.error || 'Хадгалахад алдаа гарлаа.');
      }
    } catch (err) {
      setErrorMessage('Сервертэй холбогдоход алдаа гарлаа.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Компанийн профайл</h1>
          <p className="text-slate-500 text-sm mt-1">mt_company бүртгэлтэй мэдээллээ харж, шинэчлэх боломжтой.</p>
        </div>

        {!isEditing && (
          <button 
            type="button"
            onClick={handleEditClick}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm transition-all text-sm cursor-pointer"
          >
            <Edit3 size={16} className="text-blue-600" /> Засах
          </button>
        )}
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold animate-in fade-in">
          <CheckCircle2 size={18} /> Мэдээлэл амжилттай шинэчлэгдлээ!
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm font-bold animate-in fade-in">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-linear-to-tr from-blue-600 to-sky-400 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                {formData.companyName ? formData.companyName.substring(0, 2).toUpperCase() : 'КО'}
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-slate-900">{formData.companyName}</h2>
                <p className="text-slate-500 text-sm">Хариуцлагатай хүн: {formData.ownerName}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isEditing ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-500'}`}>
              {isEditing ? 'Засах горим' : 'Харах горим'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Компанийн нэр</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><Building2 size={18} /></span>
                <input 
                  type="text" 
                  name="companyName"
                  value={formData.companyName}
                  disabled={!isEditing}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-slate-900 text-sm transition-all ${isEditing ? 'bg-slate-50 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white' : 'bg-slate-100/60 border-slate-100 cursor-not-allowed text-slate-600'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Хариуцлагатай хүний нэр (Owner)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><User size={18} /></span>
                <input 
                  type="text" 
                  name="ownerName"
                  value={formData.ownerName}
                  disabled={!isEditing}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-slate-900 text-sm transition-all ${isEditing ? 'bg-slate-50 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white' : 'bg-slate-100/60 border-slate-100 cursor-not-allowed text-slate-600'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Имэйл хаяг</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><Mail size={18} /></span>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  disabled={!isEditing}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-slate-900 text-sm transition-all ${isEditing ? 'bg-slate-50 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white' : 'bg-slate-100/60 border-slate-100 cursor-not-allowed text-slate-600'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Утасны дугаар</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><Phone size={18} /></span>
                <input 
                  type="text" 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  disabled={!isEditing}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-slate-900 text-sm transition-all ${isEditing ? 'bg-slate-50 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white' : 'bg-slate-100/60 border-slate-100 cursor-not-allowed text-slate-600'}`}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Хаяг байршил</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><MapPin size={18} /></span>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  disabled={!isEditing}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-slate-900 text-sm transition-all ${isEditing ? 'bg-slate-50 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white' : 'bg-slate-100/60 border-slate-100 cursor-not-allowed text-slate-600'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <Shield className="text-blue-600" size={20} />
              <h3 className="font-extrabold text-slate-900">Нууц үг солих</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Хуучин нууц үг</label>
                <input 
                  type="password" 
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Шинэ нууц үг</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Шинэ нууц үг давтах</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="flex items-center justify-end gap-3 animate-in fade-in">
            <button 
              type="button"
              onClick={handleCancelClick}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 font-bold px-6 py-3.5 rounded-2xl hover:bg-slate-50 transition-all text-sm cursor-pointer"
            >
              <X size={18} /> Цуцлах
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 transition-all text-sm cursor-pointer"
            >
              <Save size={18} /> Өөрчлөлтийг хадгалах
            </button>
          </div>
        )}
      </form>
    </div>
  );
}