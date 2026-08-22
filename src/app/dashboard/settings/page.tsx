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
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Тохиргоо</h1>
          <p className="text-slate-500 text-sm mt-1">Хяналтын самбарын (Dashboard) харагдах байдлыг удирдах.</p>
        </div>

        {/* View / Edit Mode Toggle Button */}
        {!isEditing && (
          <button 
            type="button"
            onClick={handleEditClick}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm transition-all text-sm"
          >
            <Edit3 size={16} className="text-blue-600" /> Засах
          </button>
        )}
      </div>

      {successMessage && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold animate-in fade-in">
          <CheckCircle2 size={18} /> Тохиргоо амжилттай хадгалагдлаа!
        </div>
      )}

      <form onSubmit={handleSave} className="mt-8 space-y-6">
        {/* Dashboard Module Visibility Settings */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <LayoutGrid className="text-blue-600" />
              <h2 className="font-bold text-lg text-slate-900">Удирдлага (/dashboard) хуудасны модулиуд</h2>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isEditing ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-500'}`}>
              {isEditing ? 'Засах горим' : 'Харах горим'}
            </span>
          </div>

          <p className="text-slate-500 text-sm mb-6">
            {isEditing 
              ? 'Хяналтын самбар дээр ямар хэсгүүд харагдахыг сонгоод хадгална уу.' 
              : 'Одоогоор идэвхтэй байгаа хяналтын самбарын модулиудын жагсаалт.'}
          </p>
          
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isEditing ? 'bg-slate-50 border-slate-100 cursor-pointer hover:bg-slate-100/80' : 'bg-white border-slate-100'}`}
                 onClick={() => handleToggle('stats')}>
              <div>
                <span className="font-bold text-slate-800 block">Статистик картууд</span>
                <span className="text-xs text-slate-500">Нийт өгөгдөл, хандалт болон идэвхтэй статусыг харуулах</span>
              </div>
              <input 
                type="checkbox" 
                checked={modules.stats}
                disabled={!isEditing}
                onChange={() => handleToggle('stats')}
                className={`w-5 h-5 accent-blue-600 rounded ${isEditing ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
              />
            </div>

            <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isEditing ? 'bg-slate-50 border-slate-100 cursor-pointer hover:bg-slate-100/80' : 'bg-white border-slate-100'}`}
                 onClick={() => handleToggle('dataTable')}>
              <div>
                <span className="font-bold text-slate-800 block">Өгөгдлийн хүснэгт / Placeholder</span>
                <span className="text-xs text-slate-500">Үндсэн хүснэгт болон график байрлах хэсэг</span>
              </div>
              <input 
                type="checkbox" 
                checked={modules.dataTable}
                disabled={!isEditing}
                onChange={() => handleToggle('dataTable')}
                className={`w-5 h-5 accent-blue-600 rounded ${isEditing ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
              />
            </div>

            <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isEditing ? 'bg-slate-50 border-slate-100 cursor-pointer hover:bg-slate-100/80' : 'bg-white border-slate-100'}`}
                 onClick={() => handleToggle('analyticsWidget')}>
              <div>
                <span className="font-bold text-slate-800 block">Шуурхай аналитик виджет</span>
                <span className="text-xs text-slate-500">Нэмэлт аналитик мэдээллийн жижиг хэсэг</span>
              </div>
              <input 
                type="checkbox" 
                checked={modules.analyticsWidget}
                disabled={!isEditing}
                onChange={() => handleToggle('analyticsWidget')}
                className={`w-5 h-5 accent-blue-600 rounded ${isEditing ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons (Only visible in Edit Mode) */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 animate-in fade-in">
            <button 
              type="button"
              onClick={handleCancelClick}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 font-bold px-6 py-3.5 rounded-2xl hover:bg-slate-50 transition-all text-sm"
            >
              <X size={18} /> Цуцлах
            </button>
            <button 
              type="submit" 
              className="flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 text-sm"
            >
              <Save size={18} /> Хадгалах
            </button>
          </div>
        )}
      </form>
    </div>
  );
}