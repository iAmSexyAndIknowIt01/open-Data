/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, CheckCircle2, Edit3, X, Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [modules, setModules] = useState({
    stats: true,
    dataTable: true,
    analyticsWidget: false
  });

  const [tempModules, setTempModules] = useState(modules);

  // Хуудас ачаалагдахад API-аас тохиргоог татаж авах
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success && json.data) {
          setModules({
            stats: json.data.stats,
            dataTable: json.data.dataTable,
            analyticsWidget: json.data.analyticsWidget,
          });
          setTempModules(json.data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modules),
      });

      const json = await res.json();

      if (json.success) {
        setIsEditing(false);
        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 3000);
      } else {
        alert('Хадгалахад алдаа гарлаа.');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Сүлжээний алдаа гарлаа.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 font-sans antialiased text-slate-800 dark:text-slate-100">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Тохиргоо</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">Хяналтын самбарын (Dashboard) харагдах байдлыг удирдах.</p>
        </div>

        {!isEditing && (
          <button 
            type="button"
            onClick={handleEditClick}
            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-all text-sm cursor-pointer self-start sm:self-auto"
          >
            <Edit3 size={16} className="text-blue-600 dark:text-blue-400" /> Засах
          </button>
        )}
      </div>

      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-bold shadow-2xs animate-in fade-in">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" /> Тохиргоо амжилттай хадгалагдлаа!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
                <LayoutGrid size={20} />
              </div>
              <div>
                <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">Хяналтын самбарын модулиуд</h2>
                <p className="text-slate-400 dark:text-slate-400 text-xs mt-0.5">Аль хэсгүүд харагдахыг тохируулах</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${isEditing ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
              {isEditing ? 'Засах горим' : 'Харах горим'}
            </span>
          </div>

          <div className="space-y-4">
            {/* 1st option */}
            <div 
              onClick={() => handleToggle('stats')}
              className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                isEditing 
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800' 
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="pr-4">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base block">Статистик картууд</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">Нийт өгөгдөл, хандалт болон идэвхтэй статусыг харуулах</span>
              </div>
              <div className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 ${modules.stats ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'} ${!isEditing && 'opacity-80'}`}>
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${modules.stats ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* 2nd option */}
            <div 
              onClick={() => handleToggle('dataTable')}
              className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                isEditing 
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800' 
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="pr-4">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base block">Өгөгдлийн хүснэгт / Placeholder</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">Үндсэн хүснэгт болон график байрлах хэсэг</span>
              </div>
              <div className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 ${modules.dataTable ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'} ${!isEditing && 'opacity-80'}`}>
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${modules.dataTable ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* 3rd option */}
            <div 
              onClick={() => handleToggle('analyticsWidget')}
              className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                isEditing 
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800' 
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="pr-4">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base block">Шуурхай аналитик виджет</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">Нэмэлт аналитик мэдээллийн жижиг хэсэг</span>
              </div>
              <div className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 ${modules.analyticsWidget ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'} ${!isEditing && 'opacity-80'}`}>
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${modules.analyticsWidget ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 animate-in fade-in">
            <button 
              type="button"
              onClick={handleCancelClick}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold px-6 py-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm cursor-pointer"
            >
              <X size={18} /> Цуцлах
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 transition-all text-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />} Өөрчлөлтийг хадгалах
            </button>
          </div>
        )}
      </form>
    </div>
  );
}