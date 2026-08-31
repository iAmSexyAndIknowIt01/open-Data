'use client';

import { useState, useEffect } from 'react';
import { QrCode, Save, Plus, Trash2, CheckCircle2, Copy, Eye, Settings2, Sparkles } from 'lucide-react';

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

  const [companyId, setCompanyId] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // 1. Хуудас ачаалагдахад серверээс өгөгдлийг татаж авах
  useEffect(() => {
    async function fetchTemplate() {
      try {
        const res = await fetch('/api/templates');
        const json = await res.json();

        if (json.success && json.data) {
          setFormTitle(json.data.title || '');
          setFormDescription(json.data.description || '');
          if (json.data.questions) {
            setQuestions(json.data.questions);
          }
          if (json.data.company_id) {
            setCompanyId(json.data.company_id);
          }
        }
      } catch (err) {
        console.error('Failed to load template:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, []);

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

  // 2. Өөрчлөлтийг хадгалах
  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    setErrorMessage('');

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          questions: questions,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Хадгалахад алдаа гарлаа.');
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Сүлжээний алдаа гарлаа.';
      setErrorMessage(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const clientFormUrl = `https://opendata-crm.mn/form/${companyId || 'company'}`;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(clientFormUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Мэдээллийг ачаалж байна...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-20 font-sans antialiased text-slate-800">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wide uppercase">
            <Sparkles size={12} /> Анкет тохиргоо
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Үйлчлүүлэгчийн анкет загвар</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Үйлчлүүлэгчдэд зориулсан асуулга болон бүртгэлийн хуудсаа удирдах.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'editor' 
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Settings2 size={15} /> Засварлах
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preview' 
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Eye size={15} /> Урьдчилан харах
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Хадгалж байна...' : 'Өөрчлөлтийг хадгалах'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold shadow-sm">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" /> 
          Анкетын мэдээлэл бааз руу амжилттай хадгалагдлаа!
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-5 py-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold shadow-sm">
          <span className="text-rose-600 font-bold">Алға:</span> {errorMessage}
        </div>
      )}

      {activeTab === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Form Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-5">
              <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-50"></span> Ерөнхий мэдээлэл
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Анкетын гарчиг</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4.5 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Тайлбар текст</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4.5 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium leading-relaxed focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-50"></span> Асуултуудын жагсаалт
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">Үйлчлүүлэгчээс асуух талбаруудыг удирдах</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-2 text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  <Plus size={16} /> Асуулт нэмэх
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div key={q.id} className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/80 transition-all space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 flex-1">
                        <span className="w-8 h-8 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center text-xs font-black shrink-0">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={q.label}
                          onChange={(e) => handleQuestionChange(q.id, 'label', e.target.value)}
                          placeholder="Асуултын нэр..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-600 transition-all"
                        />
                      </div>

                      <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
                        <select
                          value={q.type}
                          onChange={(e) => handleQuestionChange(q.id, 'type', e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                        >
                          <option value="text">Текст</option>
                          <option value="number">Тоо</option>
                          <option value="select">Сонголт</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleQuestionChange(q.id, 'required', !q.required)}
                          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            q.required ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-200/60 text-slate-500'
                          }`}
                        >
                          {q.required ? 'Заавал' : 'Заавал биш'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {q.type === 'select' && (
                      <div className="pt-1">
                        <input
                          type="text"
                          value={q.options ? q.options.join(', ') : ''}
                          onChange={(e) => handleQuestionChange(q.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-600"
                          placeholder="Сонголтууд (таслалаар тусгаарлах)"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QR & Public Link */}
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs text-center space-y-6 sticky top-6">
              <div className="text-left pb-4 border-b border-slate-100">
                <h2 className="font-bold text-sm sm:text-base text-slate-900">QR Код</h2>
                <p className="text-slate-500 text-xs mt-1">Үйлчлүүлэгчдэд зориулсан холбоос</p>
              </div>

              <div className="bg-slate-50/80 p-6 rounded-3xl border border-slate-200/60 flex flex-col items-center justify-center space-y-4">
                <div className="w-44 h-44 bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-center shadow-xs">
                  <QrCode size={130} className="text-slate-900" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-2xl">
                  <input
                    type="text"
                    readOnly
                    value={clientFormUrl}
                    className="w-full bg-transparent text-xs font-semibold text-slate-600 focus:outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    <Copy size={15} />
                  </button>
                </div>
                {copied && <p className="text-xs font-bold text-emerald-600">Линк хуулагдлаа!</p>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="max-w-xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <div className="text-center space-y-2 pb-6 border-b border-slate-100">
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3.5 py-1 rounded-full uppercase">Урьдчилан харах</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{formTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-500">{formDescription}</p>
          </div>

          <div className="space-y-5">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  {idx + 1}. {q.label} {q.required && <span className="text-rose-500">*</span>}
                </label>
                {q.type === 'select' ? (
                  <select disabled className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 text-sm">
                    <option>Сонгох...</option>
                    {q.options?.map((o, i) => <option key={i}>{o}</option>)}
                  </select>
                ) : (
                  <input type={q.type} placeholder="Бөглөх хэсэг..." disabled className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 text-sm" />
                )}
              </div>
            ))}
            <button disabled className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl opacity-60 cursor-not-allowed mt-6 text-sm">
              Илгээх
            </button>
          </div>
        </div>
      )}
    </div>
  );
}