'use client';

import { BarChart3, TrendingUp, Users, ArrowUpRight, Calendar, Download } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Аналитик тойм</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Таны өгөгдлийн гүйцэтгэл болон статистик үзүүлэлтүүд.</p>
        </div>

        <button 
          type="button"
          onClick={() => alert('Тайлан татах')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm transition-all text-sm cursor-pointer"
        >
          <Download size={16} className="text-blue-600" /> Тайлан татах
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Хандалтын өсөлт</h3>
              <p className="text-xs text-slate-400 mt-0.5">Сүүлийн 6 сарын үзүүлэлт</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="h-52 flex items-end gap-3 sm:gap-4 pt-4 border-b border-slate-100 pb-4">
            {[
              { val: '40%', height: '40%', month: '10р сар' },
              { val: '70%', height: '70%', month: '11р сар' },
              { val: '45%', height: '45%', month: '12р сар' },
              { val: '90%', height: '90%', month: '1р сар' },
              { val: '60%', height: '60%', month: '2р сар' },
              { val: '85%', height: '85%', month: '3р сар' },
            ].map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div 
                  className="w-full bg-blue-100 group-hover:bg-blue-600 rounded-t-xl transition-all cursor-pointer" 
                  style={{ height: item.height }} 
                  title={item.val}
                />
                <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">{item.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Нийт өсөлт: <strong className="text-emerald-600">+24.5%</strong></span>
            <span className="text-blue-600 font-bold hover:underline cursor-pointer">Дэлгэрэнгүй харах &rarr;</span>
          </div>
        </div>

        {/* User Activity Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Хэрэглэгчийн идэвхжил</h3>
              <p className="text-xs text-slate-400 mt-0.5">Өнөөдрийн байдлаар</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Өдөр тутмын идэвхтэй хэрэглэгч', count: '1,204', percent: '+12%', desc: 'Өмнөх өдрөөс' },
              { label: 'Шинэ бүртгэлтэй байгууллага', count: '84', percent: '+5%', desc: 'Энэ долоо хоногт' },
              { label: 'Гүйцэтгэсэн хүсэлтүүд', count: '4,520', percent: '+18.2%', desc: 'Нийт хандалтаас' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-400">{item.label}</p>
                  <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{item.count}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-xl font-bold text-xs shrink-0">
                  {item.percent} <ArrowUpRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}