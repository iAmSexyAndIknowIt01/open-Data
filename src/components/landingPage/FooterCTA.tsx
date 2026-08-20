import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FooterCTA() {
  return (
    <section className="py-28 bg-white border-t border-blue-100/60 w-full relative overflow-hidden">
      
      {/* Blueprint Grid Pattern (Цэнхэр зураасан торлог) */}
      <div 
        className="absolute inset-0 opacity-[0.35] pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #bae6fd 1px, transparent 1px),
            linear-gradient(to bottom, #bae6fd 1px, transparent 1px),
            linear-gradient(to right, #e0f2fe 1px, transparent 1px),
            linear-gradient(to bottom, #e0f2fe 1px, transparent 1px)
          `,
          backgroundSize: '128px 128px, 128px 128px, 32px 32px, 32px 32px',
          backgroundPosition: '0 0, 0 0, 0 0, 0 0'
        }}
      />

      {/* Decorative soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-100/50 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl shadow-blue-900/20 border border-slate-800">
          
          {/* Background decorative circle */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/20 rounded-bl-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-500/10 rounded-tr-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-300 bg-sky-500/10 px-3.5 py-1.5 rounded-full border border-sky-400/20 inline-flex items-center gap-1.5 mb-6 shadow-sm">
              <Sparkles size={14} className="text-sky-300" /> Таны бизнесийн шинэ эхлэл
            </span>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Бизнесээ дараагийн түвшинд <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-300">гаргахад бэлэн үү?</span>
            </h2>

            <p className="text-slate-300 mt-4 mb-10 text-base sm:text-lg leading-relaxed">
              Өнөөдөр үнэгүй бүртгүүлээд үйлчлүүлэгчдийнхээ суурийг найдвартай хадгалж, эргэх холбоогоо сайжруулаарай.
            </p>

            <Link 
              href="/register" 
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] hover:-translate-y-0.5"
            >
              Бүртгүүлж эхлэх (Үнэгүй) <ArrowRight size={18} />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}