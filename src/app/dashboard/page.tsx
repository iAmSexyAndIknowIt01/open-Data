'use client';

import { useState } from 'react';
import { LayoutDashboard, Database, Settings, LogOut, User, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="bg-blue-600 text-white p-2 rounded-xl font-black">OD</div>
          <span className="font-extrabold text-lg text-slate-900">OpenData</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Удирдлага' },
            { id: 'data', icon: Database, label: 'Өгөгдөл' },
            { id: 'analytics', icon: BarChart3, label: 'Аналитик' },
            { id: 'settings', icon: Settings, label: 'Тохиргоо' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600 font-bold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <button className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all">
          <LogOut size={20} /> Гарах
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Сайн байна уу! 👋</h1>
            <p className="text-slate-500">Өнөөдрийн бизнесийн тойм</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User size={16} />
            </div>
            <span className="font-bold text-sm text-slate-700">Компанийн нэр</span>
          </div>
        </header>

        {/* Dashboard Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Нийт өгөгдөл', value: '1,284', color: 'text-blue-600' },
            { title: 'Хандалт', value: '45.2k', color: 'text-emerald-600' },
            { title: 'Идэвхтэй статус', value: '98%', color: 'text-amber-600' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-500 mb-2">{stat.title}</h3>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Placeholder Area */}
        <div className="mt-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-75 flex items-center justify-center text-slate-400">
          Энд таны өгөгдлийн хүснэгтүүд эсвэл график гарч ирнэ.
        </div>
      </main>
    </div>
  );
}