'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Mail, KeyRound, Lock, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  
  // Input states
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Шинэ нууц үг давтах state
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Алхам: Баталгаажуулах код илгээх хүсэлт
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Хүсэлт илгээх үед алдаа гарлаа.');
      }

      setStep('reset');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Алхам: Код болон шинэ нууц үг шалгаж шинэчлэх хүсэлт
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Шинэ нууц үгс хоорондоо таарч байгаа эсэхийг шалгах
    if (newPassword !== confirmPassword) {
      setError('Шинэ нууц үг хоорондоо таарахгүй байна.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Нууц үг шинэчлэх үед алдаа гарлаа.');
      }

      setSuccess(true);
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Нууц үг сэргээх</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {step === 'request' 
              ? 'Имэйл хаягаа оруулж баталгаажуулах код хүлээн авна уу' 
              : 'Имэйлээр ирсэн код болон шинэ нууц үгээ хоёр удаа оруулна уу'}
          </p>
        </div>

        {/* Алдааны мессеж */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs sm:text-sm mb-4 font-bold text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Нууц үг амжилттай солигдсон үед */}
        {success ? (
          <div className="text-center space-y-4 py-4 animate-in fade-in">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Нууц үг амжилттай шинэчлэгдлээ</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Та шинэ нууц үгээрээ амжилттай нэвтрэх боломжтой боллоо.
              </p>
            </div>
            <Link 
              href="/login" 
              className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-sky-500 text-white font-extrabold px-6 py-3.5 rounded-2xl transition-all text-sm shadow-md shadow-blue-500/20"
            >
              Нэвтрэх хуудас руу орох
            </Link>
          </div>
        ) : step === 'request' ? (
          /* 1. ИМЭЙЛ ОРУУЛАХ ФОРМ */
          <form className="space-y-4 sm:space-y-5" onSubmit={handleRequestSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Бүртгэлтэй имэйл хаяг
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Mail size={18} />
                </span>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@business.mn" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold px-6 py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] disabled:opacity-70 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Илгээж байна...
                </>
              ) : (
                <>Баталгаажуулах код илгээх</>
              )}
            </button>
          </form>
        ) : (
          /* 2. ТОКЕН БОЛОН ШИНЭ НУУЦ ҮГ (2 УДАА) ОРУУЛАХ ФОРМ */
          <form className="space-y-4 sm:space-y-5" onSubmit={handleResetSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Баталгаажуулах код
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <KeyRound size={18} />
                </span>
                <input 
                  type="text" 
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="6 оронтой код" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all tracking-widest font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Шинэ нууц үг
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Шинэ нууц үг давтах
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold px-6 py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] disabled:opacity-70 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Шинэчилж байна...
                </>
              ) : (
                <>Нууц үг шинэчлэх</>
              )}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center mt-6 sm:mt-8 pt-6 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
          <Link href="/login" className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:underline">
            <ArrowLeft size={14} /> Нэвтрэх хуудас руу буцах
          </Link>
        </div>

      </div>
    </div>
  );
}