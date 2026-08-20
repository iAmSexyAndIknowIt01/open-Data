import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, QrCode, CalendarClock, Users } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden w-full bg-white">
      {/* Subtle modern accent glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-50/60 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* ЗҮҮН ТАЛ: Open Data үйлчилгээг харуулсан UI карт */}
          <div className="lg:col-span-6">
            <div className="bg-slate-50/80 backdrop-blur-xl border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 relative">
              
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-lg flex items-center gap-1.5">
                <Sparkles size={14} /> Live Preview
              </div>

              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Open Data CRM Удирдлага
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                  Үйлчлүүлэгчийн ухаалаг урсгал
                </h3>
              </div>

              {/* Mockup UI items */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <QrCode size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">QR Анкетын бүртгэл</h4>
                    <p className="text-xs text-slate-500">Үйлчлүүлэгч утсаараа шууд мэдээллээ үлдээнэ</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <CalendarClock size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">7-р сарын оочер зохицуулагч</h4>
                    <p className="text-xs text-slate-500">5-р сараас автоматаар эрт захиалга авах сануулга</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Байнгын харилцагчдын сан</h4>
                    <p className="text-xs text-slate-500">Авто засвар, үсчин, дэлгүүрийн бүх дата нэг дор</p>
                  </div>
                </div>
              </div>

              {/* Bottom mini status */}
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Бүртгэгдсэн харилцагч: <strong className="text-blue-600">1,240+</strong></span>
                <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">● Идэвхтэй</span>
              </div>
            </div>
          </div>

          {/* БАРУУН ТАЛ: Текстэн контент карт */}
          <div className="lg:col-span-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold mb-6 border border-blue-100 shadow-sm">
              <Sparkles size={14} className="text-blue-600 animate-pulse" /> Жижиг дунд бизнесүүдэд зориулсан шинэ үеийн CRM
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Үйлчлүүлэгчдийнхээ мэдээллийг алдаж, оочер дарааллаас болж <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 underline decoration-sky-200">орлогоо бүү алд.</span>
            </h1>
            
            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              "Open Data" систем нь авто засвар, үсчин, худалдааны газруудад хэрэглэгчийн мэдээллийг хялбар цуглуулж, улирлын ачааллыг урьдчилан зохицуулах боломжийг олгоно.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link 
                href="/register" 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 group transition-all hover:-translate-y-0.5"
              >
                Системийг үнэгүй туршиж үзэх 
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#features" 
                className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-8 py-4 rounded-2xl transition-all shadow-sm text-center"
              >
                Хэрхэн ажилладаг вэ?
              </a>
            </div>

            {/* Mini Trust badges */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-blue-600" /> Найдвартай дата хадгалалт</span>
              <span className="flex items-center gap-1.5"><Sparkles size={16} className="text-blue-600" /> Хэрэглэхэд хялбар UI</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}