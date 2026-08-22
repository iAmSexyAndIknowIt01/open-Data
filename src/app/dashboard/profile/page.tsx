'use client';

import { useState } from 'react';
import { User, Building2, Mail, Shield, CheckCircle2, Edit3, X, Save } from 'lucide-react';

export default function ProfilePage() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Формын өгөгдлийн төлөв
  const [formData, setFormData] = useState({
    companyName: 'Компанийн Нэр ХХК',
    email: 'info@company.mn',
    adminName: 'Бат-Эрдэнэ',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Цуцлах үед буцааж сэргээх түр төлөв
  const [tempData, setTempData] = useState(formData);

  const handleEditClick = () => {
    setTempData(formData);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setFormData(tempData);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Энд хадгалах логикоо бичнэ (Жишээ нь: API дуудах)
    setIsEditing(false);
    setSuccessMessage(true);
    setTimeout(() => setSuccessMessage(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & View/Edit Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Компанийн профайл</h1>
          <p className="text-slate-500 text-sm mt-1">Та өөрийн бүртгэлтэй мэдээллээ харж, шинэчлэх боломжтой.</p>
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

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold animate-in fade-in">
          <CheckCircle2 size={18} /> Мэдээлэл амжилттай шинэчлэгдлээ!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-linear-to-tr from-blue-600 to-sky-400 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                КО
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-slate-900">{formData.companyName}</h2>
                <p className="text-slate-500 text-sm">Систем дэх эрх: Удирдлага</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isEditing ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-500'}`}>
              {isEditing ? 'Засах горим' : 'Харах горим'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Компанийн нэр
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Building2 size={18} />
                </span>
                <input 
                  type="text" 
                  name="companyName"
                  value={formData.companyName}
                  disabled={!isEditing}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-slate-900 text-sm transition-all ${
                    isEditing 
                      ? 'bg-slate-50 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white' 
                      : 'bg-slate-100/60 border-slate-100 cursor-not-allowed text-slate-600'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Холбогдох имэйл
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Mail size={18} />
                </span>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  disabled={!isEditing}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-slate-900 text-sm transition-all ${
                    isEditing 
                      ? 'bg-slate-50 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white' 
                      : 'bg-slate-100/60 border-slate-100 cursor-not-allowed text-slate-600'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Хариуцлагатай хүний нэр
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  name="adminName"
                  value={formData.adminName}
                  disabled={!isEditing}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-slate-900 text-sm transition-all ${
                    isEditing 
                      ? 'bg-slate-50 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white' 
                      : 'bg-slate-100/60 border-slate-100 cursor-not-allowed text-slate-600'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security / Password change section (Only visible or editable in edit mode) */}
        {isEditing && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <Shield className="text-blue-600" size={20} />
              <h3 className="font-extrabold text-slate-900">Нууц үг солих</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Хуучин нууц үг
                </label>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Шинэ нууц үг
                </label>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Шинэ нууц үг давтах
                </label>
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

        {/* Action Buttons (Only visible in Edit Mode) */}
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