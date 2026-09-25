import { QrCode, Users, CalendarCheck } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="py-28 bg-white dark:bg-slate-950 border-y border-blue-100/60 dark:border-slate-800 w-full relative overflow-hidden transition-colors duration-300">
      
      {/* Blueprint Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.08] pointer-events-none -z-10"
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-100/40 dark:bg-blue-900/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1.5 rounded-full border border-blue-100/60 dark:border-blue-900 shadow-sm">
            Боломжууд
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-4">
            Үндсэн <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 dark:from-blue-400 dark:to-sky-300">боломжууд</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-4 text-base sm:text-lg leading-relaxed">
            ЖДБ эрхлэгчдэд яг хэрэгтэй, илүү дутуу зүйлгүй хөнгөн бөгөөд хурдан шийдэл.
          </p>
        </div>

        {/* Grid Container */}
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 shadow-sm hover:shadow-md group">
            <div className="w-14 h-14 bg-blue-600 dark:bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <QrCode size={26} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Хурдан бүртгэл</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              QR код уншуулах эсвэл өдөр тутмын Excel файлаасаа харилцагчийн мэдээллээ хялбархан бүрдүүлнэ.
            </p>
          </div>

          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 shadow-sm hover:shadow-md group">
            <div className="w-14 h-14 bg-sky-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-sky-500/20 group-hover:scale-110 transition-transform">
              <Users size={26} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Зорилтот холбоо</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Үйлчлүүлэгчдийг ангилж, шаардлагатай цагт нь эргэн холбогдон давтан үйлчлүүлэгчдийн урсгалыг нэмэгдүүлнэ.
            </p>
          </div>

          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 shadow-sm hover:shadow-md group">
            <div className="w-14 h-14 bg-blue-700 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-700/20 group-hover:scale-110 transition-transform">
              <CalendarCheck size={26} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Эрэлт хяналт</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Аль сард оочер үүсдэгийг урьдчилан харж, улирлын ачааллаа оновчтой хуваарилаарай.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}