import { Sparkles } from 'lucide-react';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({ text = 'Ачаалж байна...', fullScreen = true }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* "Open Data" болон эргэлдэх тойрог */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Гадна талд эргэлдэх дугуй хүрээ (Cycling ring) */}
        <div className="absolute inset-0 border-4 border-blue-600/15 border-t-blue-600 rounded-full animate-spin" />
        
        {/* Дотор талд эсрэг зүгт эргэх эсвэл өөр хурдтай туслах хүрээ */}
        <div className="absolute inset-2 border-2 border-indigo-500/10 border-b-indigo-500 rounded-full animate-[spin_3s_linear_infinite_reverse]" />

        {/* Голд нь байрлах Open Data бичвэр болон дүрс */}
        <div className="flex flex-col items-center justify-center text-center z-10 p-2 space-y-0.5">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
            Open Data
          </span>
        </div>
      </div>

      {/* Доод талын жижиг текст */}
      {text && (
        <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-50 transition-colors">
        {content}
      </div>
    );
  }

  return <div className="py-8 flex justify-center bg-transparent">{content}</div>;
}