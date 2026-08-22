'use client';

import { useState } from 'react';
import { LayoutGrid, CheckCircle2, Edit3, X, Save } from 'lucide-react';

export default function SettingsPage() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Dashboard хуудас дээр харуулах модулиудын төлөв
  const [modules, setModules] = useState({
    stats: true,          // Нийт өгөгдөл, хандалт гэх мэт статистик картууд
    dataTable: true,      // Өгөгдлийн хүснэгт / placeholder хэсэг
    analyticsWidget: false // Шуурхай аналитик график
  });

  // Цуцлах үед өмнөх төлөв рүү буцаах зорилгоор түр хадгалах
  const [tempModules, setTempModules] = useState(modules);

  const handleEditClick = () => {
    setTempModules(modules);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setModules(tempModules);
    setIsEditing(false);
  };

  const handleToggle = (key: keyof typeof modules) => {
    if (!isEditing) return;
    setModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('dashboardModules', JSON.stringify(modules));
    
    setIsEditing(false);
    setSuccessMessage(true);
    setTimeout(() => setSuccessMessage(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Тохиргоо</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Хяналтын самбарын (Dashboard) харагдах байдлыг удирдах.</p>
        </div>

        {!isEditing && (
          <button 
            type="button"
            onClick={handleEditClick}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm transition-all text-sm cursor-pointer self-start sm:self-auto"
          >
            <Edit3 size={16} className="text-blue-600" /> Засах
          </button>
        )}
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-bold animate-in fade-in">
          <CheckCircle2 size={18} className="shrink-0" /> Тохиргоо амжилттай хадгалагдлаа!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dashboard Module Visibility Settings */}
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <LayoutGrid size={20} />
              </div>
              <div>
                <h2 className="font-extrabold text-base sm:text-lg text-slate-900">Хяналтын самбарын модулиуд</h2>
                <p className="text-slate-400 text-xs mt-0.5">Аль хэсгүүд харагдахыг тохируулах</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${isEditing ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-500'}`}>
              {isEditing ? 'Засах горим' : 'Харах горим'}
            </span>
          </div>

          <div className="space-y-4">
            {/* 1st option */}
            <div 
              onClick={() => handleToggle('stats')}
              className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                isEditing 
                  ? 'bg-slate-50 border-slate-200 cursor-pointer hover:bg-slate-100/80' 
                  : 'bg-slate-50/60 border-slate-100'
              }`}
            >
              <div className="pr-4">
                <span className="font-bold text-slate-800 text-sm sm:text-base block">Статистик картууд</span>
                <span className="text-xs text-slate-500 mt-0.5 block">Нийт өгөгдөл, хандалт болон идэвхтэй статусыг харуулах</span>
              </div>
              <div className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 ${modules.stats ? 'bg-blue-600' : 'bg-slate-300'} ${!isEditing && 'opacity-80'}`}>
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${modules.stats ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* 2nd option */}
            <div 
              onClick={() => handleToggle('dataTable')}
              className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                isEditing 
                  ? 'bg-slate-50 border-slate-200 cursor-pointer hover:bg-slate-100/80' 
                  : 'bg-slate-50/60 border-slate-100'
              }`}
            >
              <div className="pr-4">
                <span className="font-bold text-slate-800 text-sm sm:text-base block">Өгөгдлийн хүснэгт / Placeholder</span>
                <span className="text-xs text-slate-500 mt-0.5 block">Үндсэн хүснэгт болон график байрлах хэсэг</span>
              </div>
              <div className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 ${modules.dataTable ? 'bg-blue-600' : 'bg-slate-300'} ${!isEditing && 'opacity-80'}`}>
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${modules.dataTable ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* 3rd option */}
            <div 
              onClick={() => handleToggle('analyticsWidget')}
              className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                isEditing 
                  ? 'bg-slate-50 border-slate-200 cursor-pointer hover:bg-slate-100/80' 
                  : 'bg-slate-50/60 border-slate-100'
              }`}
            >
              <div className="pr-4">
                <span className="font-bold text-slate-800 text-sm sm:text-base block">Шуурхай аналитик виджет</span>
                <span className="text-xs text-slate-500 mt-0.5 block">Нэмэлт аналитик мэдээллийн жижиг хэсэг</span>
              </div>
              <div className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 ${modules.analyticsWidget ? 'bg-blue-600' : 'bg-slate-300'} ${!isEditing && 'opacity-80'}`}>
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${modules.analyticsWidget ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Only visible in Edit Mode) */}
        {isEditing && (
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 animate-in fade-in">
            <button 
              type="button"
              onClick={handleCancelClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 font-bold px-6 py-3.5 rounded-2xl hover:bg-slate-50 transition-all text-sm cursor-pointer"
            >
              <X size={18} /> Цуцлах
            </button>
            <button 
              type="submit" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 transition-all text-sm cursor-pointer"
            >
              <Save size={18} /> Өөрчлөлтийг хадгалах
            </button>
          </div>
        )}
      </form>
    </div>
  );
}