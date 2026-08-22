'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Сайн байна уу! 👋</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Өнөөдрийн бизнесийн тойм мэдээлэл</p>
          </div>
          
          {/* User Profile Badge */}
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
              <User size={16} />
            </div>
            <span className="font-bold text-sm text-slate-700 truncate max-w-50">Компанийн нэр</span>
          </div>
        </div>

        {/* Dashboard Stats (Илүү өргөн card-ууд бүхий grid) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[
            { title: 'Нийт өгөгдөл', value: '1,284', color: 'text-blue-600' },
            { title: 'Хандалт', value: '45.2k', color: 'text-emerald-600' },
            { title: 'Идэвхтэй статус', value: '98%', color: 'text-amber-600' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{stat.title}</h3>
              <p className={`text-3xl sm:text-4xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Placeholder Area */}
        <div className="mt-6 sm:mt-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm min-h-75 sm:min-h-87.5 flex items-center justify-center text-center text-slate-400 text-xs sm:text-sm font-medium">
          Энд таны өгөгдлийн хүснэгтүүд эсвэл график гарч ирнэ.
        </div>
      </main>
    </div>
  );
}