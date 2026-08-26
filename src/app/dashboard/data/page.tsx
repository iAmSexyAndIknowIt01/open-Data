'use client';

import { useState } from 'react';
import { Database, Plus, Search, Filter, FileText, Download, Trash2, Edit } from 'lucide-react';

export default function DataPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Жишээ өгөгдлийн жагсаалт (API холбох үедээ эндээс сольж ашиглана)
  const [dataList] = useState([
    { id: 1, name: 'Борлуулалтын тайлан Q1', category: 'Санхүү', date: '2026-03-20', status: 'Идэвхтэй' },
    { id: 2, name: 'Хэрэглэгчийн судалгаа', category: 'Маркетинг', date: '2026-03-18', status: 'Хүлээгдэж буй' },
    { id: 3, name: 'Бараа материалын бүртгэл', category: 'Агуулах', date: '2026-03-15', status: 'Идэвхтэй' },
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Өгөгдлийн менежмент</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Энд та бүх өгөгдлөө удирдах, шинээр нэмэх боломжтой.</p>
        </div>

        <button 
          type="button"
          onClick={() => alert('Шинэ өгөгдөл нэмэх цонх')}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all text-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus size={18} /> Шинэ өгөгдөл нэмэх
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder="Өгөгдөл хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <button 
          type="button"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-2xl border border-slate-200 transition-all text-sm cursor-pointer"
        >
          <Filter size={16} className="text-slate-500" /> Шүүлтүүр
        </button>
      </div>

      {/* Data Table / List Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {dataList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Нэр</th>
                  <th className="py-4 px-6">Ангилал</th>
                  <th className="py-4 px-6">Огноо</th>
                  <th className="py-4 px-6">Статус</th>
                  <th className="py-4 px-6 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {dataList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800 flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>
                      <span className="truncate max-w-50 sm:max-w-none">{item.name}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{item.category}</td>
                    <td className="py-4 px-6 text-slate-500">{item.date}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === 'Идэвхтэй' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button title="Татах" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer">
                          <Download size={16} />
                        </button>
                        <button title="Засах" className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer">
                          <Edit size={16} />
                        </button>
                        <button title="Устгах" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Database size={24} />
            </div>
            <p className="text-slate-600 font-bold text-sm">Өгөгдөл олдсонгүй</p>
            <p className="text-slate-400 text-xs">Та шинээр өгөгдөл нэмж эхэлнэ үү.</p>
          </div>
        )}
      </div>
    </div>
  );
}