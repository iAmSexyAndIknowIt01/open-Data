'use client';

import { useState } from 'react';
import { FileText, QrCode, Save, Plus, Trash2, CheckCircle2, Copy, Eye, Settings2, Sparkles, HelpCircle } from 'lucide-react';

interface Question {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  options?: string[];
}

export default function MyAnketPage() {
  const [formTitle, setFormTitle] = useState('Үйлчлүүлэгчийн бүртгэлийн анкет');
  const [formDescription, setFormDescription] = useState('Та манай үйлчилгээг сонгосонд баярлалаа. Доорх мэдээллийг үнэн зөв бөглөнө үү.');
  
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', label: 'Овог, Нэр', type: 'text', required: true },
    { id: '2', label: 'Утасны дугаар', type: 'number', required: true },
    { id: '3', label: 'Имэйл хаяг', type: 'text', required: false },
    { id: '4', label: 'Үйлчилгээний төрөл', type: 'select', required: true, options: ['Авто угаалга', 'Тос солих', 'Засвар үйлчилгээ', 'Бусад'] },
  ]);

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: Date.now().toString(),
      label: 'Шинэ асуулт',
      type: 'text',
      required: false,
    };
    setQuestions([...questions, newQ]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: unknown) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 800);
  };

  const clientFormUrl = 'https://opendata-crm.mn/form/company-uuid-123';
  const handleCopyLink = () => {
    navigator.clipboard.writeText(clientFormUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-16">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Үйлчлүүлэгчийн анкет загвар</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Үйлчлүүлэгчдэд зориулсан асуулга болон бүртгэлийн хуудсаа өөрийн хүссэнээр тохируулаарай.</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Tab Switcher */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Settings2 size={14} /> Тохируулах
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Eye size={14} /> Урьдчилан харах
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-bold">
          <CheckCircle2 size={18} className="shrink-0" /> Анкетын мэдээлэл амжилттай хадгалагдлаа!
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Зүүн тал: Анкетын тохиргоо болон асуултууд */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ерөнхий мэдээлэл */}
            <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span> Ерөнхий мэдээлэл
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Анкетын гарчиг</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Тайлбар текст</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Асуултуудын жагсаалт */}
            <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span> Асуултуудын жагсаалт
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">Үйлчлүүлэгчээс асуух мэдээллийн талбарууд</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <Plus size={14} /> Асуулт нэмэх
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div key={q.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black shrink-0">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={q.label}
                          onChange={(e) => handleQuestionChange(q.id, 'label', e.target.value)}
                          placeholder="Асуултын нэр..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <select
                          value={q.type}
                          onChange={(e) => handleQuestionChange(q.id, 'type', e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                        >
                          <option value="text">Текст</option>
                          <option value="number">Тоо</option>
                          <option value="select">Сонголт</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleQuestionChange(q.id, 'required', !q.required)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            q.required 
                              ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                              : 'bg-slate-200/60 text-slate-500 border border-transparent'
                          }`}
                        >
                          {q.required ? 'Заавал' : 'Заавал биш'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {q.type === 'select' && (
                      <div className="pl-10">
                        <input
                          type="text"
                          value={q.options ? q.options.join(', ') : ''}
                          onChange={(e) => handleQuestionChange(q.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                          placeholder="Сонголтуудыг таслалаар тусгаарлана уу (Жишээ: Угаалга, Тос)"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Баруун тал: QR код болон линк хуваалцах */}
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-5 sticky top-6">
              <div className="text-left pb-4 border-b border-slate-100">
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900">Үйлчлүүлэгчийн QR Код</h2>
                <p className="text-slate-500 text-xs mt-0.5">Үйлчилгээний танхимд байрлуулах линк</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center space-y-3">
                <div className="w-40 h-40 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center">
                  <QrCode size={120} className="text-slate-900" />
                </div>
                <span className="text-xs font-bold text-slate-700">Камераар уншуулж бөглөх</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl">
                  <input
                    type="text"
                    readOnly
                    value={clientFormUrl}
                    className="w-full bg-transparent text-xs font-semibold text-slate-600 focus:outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                {copied && (
                  <p className="text-xs font-bold text-emerald-600">Линк амжилттай хуулагдлаа!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="max-w-xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-2 pb-6 border-b border-slate-100">
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Урьдчилан харах горим
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{formTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-500">{formDescription}</p>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {idx + 1}. {q.label} {q.required && <span className="text-rose-500">*</span>}
                </label>
                
                {q.type === 'select' ? (
                  <select disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-sm">
                    <option value="">Сонгох...</option>
                    {q.options?.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={q.type}
                    placeholder="Бөглөх хэсэг..."
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 text-sm"
                  />
                )}
              </div>
            ))}

            <button
              type="button"
              disabled
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl opacity-70 cursor-not-allowed mt-4 text-sm"
            >
              Мэдээлэл илгээх
            </button>
          </div>
        </div>
      )}
    </div>
  );
}