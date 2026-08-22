'use client';

import { BarChart3, TrendingUp, Users, ArrowUpRight } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Аналитик тойм</h1>
        <p className="text-slate-500 text-sm mt-1">Таны өгөгдлийн гүйцэтгэл болон статистик үзүүлэлтүүд.</p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Хандалтын өсөлт</h3>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <div className="h-48 flex items-end gap-2">
            {/* Жишээ график элементүүд */}
            {[40, 70, 45, 90, 60, 85].map((h, i) => (
              <div key={i} className="bg-blue-100 flex-1 rounded-t-lg hover:bg-blue-500 transition-colors" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Хэрэглэгчийн идэвхжил</h3>
          <div className="space-y-4">
            {[
              { label: 'Өдөр тутмын идэвхтэй', count: '1,204', percent: '+12%' },
              { label: 'Шинэ бүртгэл', count: '84', percent: '+5%' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-slate-600">{item.label}</p>
                  <p className="text-xl font-black text-slate-900">{item.count}</p>
                </div>
                <span className="text-emerald-600 font-bold text-sm flex items-center">
                  {item.percent} <ArrowUpRight size={16} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}