'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, User, Building2, Loader2, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Бүртгүүлэхэд алдаа гарлаа.');
      }

      setSuccess(true);
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] flex items-center justify-center relative overflow-hidden px-4 sm:px-6 py-12">
      
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-125 sm:h-75 bg-blue-200/50 blur-[120px] sm:blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-md w-full bg-white/95 backdrop-blur-md border border-slate-200/95 p-6 sm:p-10 rounded-3xl shadow-xl shadow-blue-500/10 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="bg-linear-to-tr from-blue-600 to-sky-400 text-white p-2.5 rounded-2xl font-black text-sm tracking-wider shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              OD
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Open <span className="text-blue-600">Data</span>
            </span>
          </Link>
          
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block">
              Үнэгүй турших
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-3">Бизнесээ бүртгүүлэх</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Хэдхэн жилийн дотор харилцагчийн базаа бүрдүүлээрэй</p>
        </div>

        {/* Алдаа болон амжилтын мессеж */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs sm:text-sm mb-4 font-bold text-center animate-in fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs sm:text-sm mb-4 font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 size={18} className="shrink-0" /> Бүртгэл амжилттай! Нэвтрэх хуудас руу шилжиж байна...
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Бизнесийн нэр */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Бизнесийн нэр
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Building2 size={18} />
              </span>
              <input 
                type="text" 
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Жнь: Авто засвар ХХК" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Таны нэр */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Таны нэр
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <User size={18} />
              </span>
              <input 
                type="text" 
                name="ownerName"
                required
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Бат-Эрдэнэ" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Имэйл хаяг */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Имэйл хаяг
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Mail size={18} />
              </span>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="example@business.mn" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Нууц үг */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Нууц үг үүсгэх
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Lock size={18} />
              </span>
              <input 
                type="password" 
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Submit товч */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold px-6 py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] disabled:opacity-70 text-sm cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Бүртгэж байна...
              </>
            ) : (
              <>
                Бүртгүүлэх (Үнэгүй) <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6 sm:mt-8 pt-6 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
          Аль хэдийн бүртгэлтэй юу?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:underline">
            Нэвтрэх
          </Link>
        </div>

      </div>
    </div>
  );
}