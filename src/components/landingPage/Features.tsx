import { QrCode, Users, CalendarCheck } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="py-28 bg-white border-y border-blue-100/60 w-full relative overflow-hidden">
      
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-100/40 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100/60 shadow-sm">
            Боломжууд
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-4">
            Үндсэн <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">боломжууд</span>
          </h2>
          <p className="text-slate-600 mt-4 text-base sm:text-lg leading-relaxed">
            ЖДБ эрхлэгчдэд яг хэрэгтэй, илүү дутуу зүйлгүй хөнгөн бөгөөд хурдан шийдэл.
          </p>
        </div>

        {/* Grid Container */}
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl border border-slate-200/80 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md group">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <QrCode size={26} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Хурдан бүртгэл</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              QR код уншуулах эсвэл өдөр тутмын Excel файлаасаа харилцагчийн мэдээллээ хялбархан бүрдүүлнэ.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl border border-slate-200/80 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md group">
            <div className="w-14 h-14 bg-sky-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-sky-500/20 group-hover:scale-110 transition-transform">
              <Users size={26} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Зорилтот холбоо</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Үйлчлүүлэгчдийг ангилж, шаардлагатай цагт нь эргэн холбогдон давтан үйлчлүүлэгчдийн урсгалыг нэмэгдүүлнэ.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl border border-slate-200/80 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md group">
            <div className="w-14 h-14 bg-blue-700 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-700/20 group-hover:scale-110 transition-transform">
              <CalendarCheck size={26} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Эрэлт хяналт</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Аль сард оочер үүсдэгийг урьдчилан харж, улирлын ачааллаа оновчтой хуваарилаарай.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}