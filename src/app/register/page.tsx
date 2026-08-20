'use client';

import Link from 'next/link';
import { ArrowRight, Lock, Mail, User, Building2 } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f8fbff] flex items-center justify-center relative overflow-hidden px-6 py-12">
      
      {/* Blueprint Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.7] pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #bae6fd 1.5px, transparent 1.5px),
            linear-gradient(to bottom, #bae6fd 1.5px, transparent 1.5px),
            linear-gradient(to right, #e0f2fe 1px, transparent 1px),
            linear-gradient(to bottom, #e0f2fe 1.5px, transparent 1.5px)
          `,
          backgroundSize: '128px 128px, 128px 128px, 32px 32px, 32px 32px',
          backgroundPosition: '0 0, 0 0, 0 0, 0 0'
        }}
      />

      {/* Decorative soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-200/50 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-md w-full bg-white/95 backdrop-blur-md border border-slate-200/90 p-8 sm:p-10 rounded-3xl shadow-xl shadow-blue-500/10 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="bg-gradient-to-tr from-blue-600 to-sky-400 text-white p-2.5 rounded-2xl font-black text-sm tracking-wider shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              OD
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Open <span className="text-blue-600">Data</span>
            </span>
          </Link>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200">
            Үнэгүй турших
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-3">Бизнесээ бүртгүүлэх</h1>
          <p className="text-slate-600 text-sm mt-1.5">Хэдхэн жилийн дотор харилцагчийн базаа бүрдүүлээрэй</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Бизнесийн нэр
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Building2 size={18} />
              </span>
              <input 
                type="text" 
                required
                placeholder="Жнь: Авто засвар ХХК" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Таны нэр
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <User size={18} />
              </span>
              <input 
                type="text" 
                required
                placeholder="Бат-Эрдэнэ" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Имэйл хаяг
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Mail size={18} />
              </span>
              <input 
                type="email" 
                required
                placeholder="example@business.mn" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Нууц үг үүсгэх
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Lock size={18} />
              </span>
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold px-6 py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.01]"
          >
            Бүртгүүлэх (Үнэгүй) <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-8 pt-6 border-t border-slate-100 text-sm text-slate-600">
          Аль хэдийн бүртгэлтэй юу?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:underline">
            Нэвтрэх
          </Link>
        </div>

      </div>
    </div>
  );
}