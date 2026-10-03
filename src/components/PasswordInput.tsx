// src/components/PasswordInput.tsx
'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Нууц үгийн талбар — баруун талын нүдэн товчоор бичсэн утгаа харж болно.
// className-д баруун талд товчны зай (pr-11) үлдээх шаардлагатай.
export default function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Нууц үгийг нуух' : 'Нууц үгийг харах'}
        title={visible ? 'Нууц үгийг нуух' : 'Нууц үгийг харах'}
        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
