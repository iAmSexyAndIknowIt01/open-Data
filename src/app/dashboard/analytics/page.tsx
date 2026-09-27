'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight, ArrowUpRight, AlertTriangle, Briefcase, CheckCircle2, Database, FileText, UserPlus, Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Loading from '@/src/app/components/loading';

type RangeKey = '7d' | '30d' | '90d' | '12m';
type Unit = 'day' | 'week' | 'month';
type TrendMetric = 'works' | 'revenue';

interface Comparison {
  current: number | null;
  previous: number | null;
}

interface AnalyticsData {
  range: RangeKey;
  unit: Unit;
  kpis: {
    works: Comparison;
    revenue: Comparison;
    completionRate: Comparison;
    newCustomers: Comparison;
    submissions: Comparison;
    overdue: number;
  };
  trend: { bucket: string; works: number; revenue: number }[];
  statuses: { status: string; count: number }[];
  customerTypes: { type: string; count: number }[];
  topServices: { name: string; works: number; revenue: number }[];
  topEmployees: { name: string; assigned: number; completed: number; revenue: number }[];
}

const RANGE_OPTIONS: { key: RangeKey; label: string; previousLabel: string }[] = [
  { key: '7d', label: '7 хоног', previousLabel: 'өмнөх 7 хоногтой' },
  { key: '30d', label: '30 хоног', previousLabel: 'өмнөх 30 хоногтой' },
  { key: '90d', label: '90 хоног', previousLabel: 'өмнөх 90 хоногтой' },
  { key: '12m', label: '12 сар', previousLabel: 'өмнөх 12 сартай' },
];

const STATUS_ROWS = [
  { key: 'pending', label: 'Хүлээгдэж буй' },
  { key: 'in_progress', label: 'Хийгдэж байна' },
  { key: 'completed', label: 'Дууссан' },
  { key: 'cancelled', label: 'Цуцлагдсан' },
];

const CUSTOMER_TYPE_ROWS = [
  { key: 'individual', label: 'Хувь хүн' },
  { key: 'company', label: 'Байгууллага' },
];

// Графикийн өнгө: dataviz validator-оор цайвар (#2563eb) болон бараан (#3b82f6, slate-900 дээр) горимд шалгасан
const BAR_FILL = 'bg-blue-600 dark:bg-blue-500';
const BAR_TRACK = 'bg-slate-100 dark:bg-slate-800';
const CARD = 'bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs';

function formatNumber(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatMoney(value: number) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)} тэрбум ₮`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)} сая ₮`;
  return `${formatNumber(value)} ₮`;
}

function formatBucket(bucket: string, unit: Unit, long = false) {
  const [year, month, day] = bucket.split('-');
  if (unit === 'month') return long ? `${year} оны ${Number(month)}-р сар` : `${Number(month)}-р сар`;
  if (unit === 'week') return long ? `${bucket}-с эхэлсэн долоо хоног` : `${month}/${day}`;
  return long ? bucket : `${month}/${day}`;
}

// Тэнхлэгийн дээд утгыг 1, 2, 5 × 10^n хэлбэрийн цэвэр тоо болгох
function niceMax(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}

function Delta({ value, previousLabel, isPercentPoint = false }: {
  value: Comparison;
  previousLabel: string;
  isPercentPoint?: boolean;
}) {
  const { current, previous } = value;
  if (current === null || previous === null || (!isPercentPoint && previous === 0)) {
    return <p className="text-xs text-slate-400 dark:text-slate-500">Харьцуулах өгөгдөлгүй</p>;
  }

  const diff = isPercentPoint ? current - previous : ((current - previous) / previous) * 100;
  const rounded = Math.round(diff * 10) / 10;
  const up = rounded > 0;
  const down = rounded < 0;
  const Icon = down ? ArrowDownRight : ArrowUpRight;

  return (
    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-wrap">
      <span
        className={`inline-flex items-center gap-0.5 font-bold ${
          up ? 'text-emerald-600 dark:text-emerald-400' : down ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        {(up || down) && <Icon size={14} aria-hidden />}
        {up ? '+' : ''}
        {Math.abs(rounded) >= 100 ? formatNumber(Math.round(rounded)) : rounded}
        {isPercentPoint ? ' пункт' : '%'}
      </span>
      <span>{previousLabel} харьцуулахад</span>
    </p>
  );
}

function StatTile({ icon: Icon, label, value, children }: {
  icon: LucideIcon;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col gap-2 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p>
        <Icon size={18} className="text-slate-400 dark:text-slate-500 shrink-0" aria-hidden />
      </div>
      <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white whitespace-nowrap">{value}</p>
      {children}
    </div>
  );
}

function TrendChart({ data, unit }: { data: AnalyticsData['trend']; unit: Unit }) {
  const [metric, setMetric] = useState<TrendMetric>('works');
  const [active, setActive] = useState<number | null>(null);

  const values = data.map((d) => d[metric]);
  const max = niceMax(Math.max(...values, 0));
  const format = metric === 'revenue' ? formatMoney : formatNumber;
  const labelEvery = Math.ceil(data.length / 7); // x тэнхлэгт 7 орчим шошго
  const total = values.reduce((sum, v) => sum + v, 0);

  return (
    <div className={`${CARD} space-y-5`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            {metric === 'works' ? 'Бүртгэгдсэн ажлын тоо' : 'Дууссан ажлын орлого'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {unit === 'day' ? 'Өдрөөр' : unit === 'week' ? 'Долоо хоногоор' : 'Сараар'} · нийт {format(total)}
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl self-start" role="group" aria-label="Үзүүлэлт сонгох">
          {([['works', 'Ажлын тоо'], ['revenue', 'Орлого']] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              aria-pressed={metric === key}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                metric === key
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {/* Y тэнхлэг */}
        <div className="relative h-48 shrink-0 text-[10px] text-slate-400 dark:text-slate-500 text-right tabular-nums">
          {/* Туслах шугамуудтай нэг түвшинд байрлуулна (0%, 50%, 100%) */}
          <span className="block invisible whitespace-nowrap">{format(max)}</span>
          {[max, max / 2, 0].map((tick, i) => (
            <span
              key={i}
              className="absolute right-0 -translate-y-1/2 whitespace-nowrap"
              style={{ top: `${i * 50}%` }}
            >
              {format(tick)}
            </span>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative h-48">
            {/* Хэвтээ туслах шугамууд */}
            <div className="absolute inset-x-0 top-0 border-t border-slate-100 dark:border-slate-800" />
            <div className="absolute inset-x-0 top-1/2 border-t border-slate-100 dark:border-slate-800" />
            <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 dark:border-slate-700" />

            <div className="absolute inset-0 flex items-end gap-0.5" onMouseLeave={() => setActive(null)}>
              {data.map((d, i) => {
                const value = d[metric];
                const height = value > 0 ? Math.max((value / max) * 100, 1.5) : 0;
                const isActive = active === i;
                return (
                  <div
                    key={d.bucket}
                    tabIndex={0}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    aria-label={`${formatBucket(d.bucket, unit, true)}: ${format(value)}`}
                    className="relative flex-1 h-full flex items-end justify-center outline-none group"
                  >
                    <div
                      className={`w-full max-w-6 rounded-t ${BAR_FILL} transition-opacity ${
                        active !== null && !isActive ? 'opacity-40' : ''
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    {isActive && (
                      <div
                        className={`absolute z-10 pointer-events-none whitespace-nowrap bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded-xl px-3 py-2 shadow-lg ${
                          i < data.length / 3 ? 'left-0' : i > (data.length * 2) / 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                        }`}
                        style={{ bottom: `calc(${height}% + 0.5rem)` }}
                      >
                        <p className="font-bold">{formatBucket(d.bucket, unit, true)}</p>
                        <p>
                          {d.works} ажил · {formatMoney(d.revenue)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* X тэнхлэг */}
          <div className="flex gap-0.5 mt-2">
            {data.map((d, i) => (
              <span
                key={d.bucket}
                className="flex-1 text-center text-[10px] text-slate-400 dark:text-slate-500 tabular-nums overflow-visible whitespace-nowrap"
              >
                {i % labelEvery === 0 ? formatBucket(d.bucket, unit) : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Дэлгэц уншигчид зориулсан хүснэгт */}
      <table className="sr-only">
        <caption>Хугацааны тренд</caption>
        <thead>
          <tr><th>Хугацаа</th><th>Ажлын тоо</th><th>Орлого</th></tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.bucket}>
              <td>{formatBucket(d.bucket, unit, true)}</td>
              <td>{d.works}</td>
              <td>{formatMoney(d.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Хэвтээ баганан жагсаалт: нэр, утга, багана (бүгд нэг өнгөтэй)
function BarList({ rows, emptyText }: {
  rows: { label: string; value: number; display: string; sub?: string }[];
  emptyText: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 0);
  if (rows.length === 0 || max === 0) {
    return <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">{emptyText}</p>;
  }
  return (
    <ul className="space-y-4">
      {rows.map((row) => (
        <li key={row.label} title={`${row.label}: ${row.display}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm mb-1.5">
            <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{row.label}</span>
            <span className="shrink-0 text-slate-500 dark:text-slate-400 tabular-nums">
              <span className="font-bold text-slate-900 dark:text-white">{row.display}</span>
              {row.sub && <span className="text-xs"> · {row.sub}</span>}
            </span>
          </div>
          <div className={`h-2.5 rounded ${BAR_TRACK}`}>
            <div
              className={`h-full rounded ${BAR_FILL}`}
              style={{ width: `${row.value > 0 ? Math.max((row.value / max) * 100, 1) : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<RangeKey>('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/analytics?range=${range}`);
        const result = await res.json();
        if (ignore) return;
        if (result.success) {
          setData(result.data);
          setError('');
        } else {
          setError(result.error || 'Аналитик мэдээлэл авахад алдаа гарлаа');
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        if (!ignore) setError('Сервертэй холбогдож чадсангүй');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchAnalytics();
    return () => {
      ignore = true;
    };
  }, [range]);

  const changeRange = (key: RangeKey) => {
    if (key === range) return;
    setLoading(true);
    setRange(key);
  };

  const rangeOption = RANGE_OPTIONS.find((r) => r.key === range)!;
  const statusTotal = data?.statuses.reduce((sum, s) => sum + s.count, 0) ?? 0;
  const typeTotal = data?.customerTypes.reduce((sum, s) => sum + s.count, 0) ?? 0;
  const percentOf = (count: number, total: number) => (total > 0 ? `${Math.round((count / total) * 100)}%` : '');

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 text-slate-800 dark:text-slate-100">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Аналитик тойм</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Ажил, орлого, харилцагчийн үзүүлэлтүүд. Сонгосон хугацаанд бүртгэгдсэн өгөгдлөөр тооцно.
          </p>
        </div>

        <Link
          href="/dashboard/data"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-all text-sm"
        >
          <Database size={16} className="text-blue-600 dark:text-blue-400" /> Өгөгдөл татах
        </Link>
      </div>

      {/* Хугацааны шүүлтүүр */}
      <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto sm:inline-flex" role="group" aria-label="Хугацаа сонгох">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => changeRange(option.key)}
            aria-pressed={range === option.key}
            className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              range === option.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {!data ? (
        loading ? (
          <Loading />
        ) : (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 p-6 rounded-3xl text-sm font-bold text-center">
            {error}
          </div>
        )
      ) : (
        <div className={`space-y-6 transition-opacity ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          {error && (
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            <StatTile icon={Briefcase} label="Бүртгэгдсэн ажил" value={formatNumber(data.kpis.works.current ?? 0)}>
              <Delta value={data.kpis.works} previousLabel={rangeOption.previousLabel} />
            </StatTile>
            <StatTile icon={Wallet} label="Орлого (дууссан ажил)" value={formatMoney(data.kpis.revenue.current ?? 0)}>
              <Delta value={data.kpis.revenue} previousLabel={rangeOption.previousLabel} />
            </StatTile>
            <StatTile
              icon={CheckCircle2}
              label="Гүйцэтгэлийн хувь"
              value={data.kpis.completionRate.current === null ? '—' : `${data.kpis.completionRate.current}%`}
            >
              <Delta value={data.kpis.completionRate} previousLabel={rangeOption.previousLabel} isPercentPoint />
            </StatTile>
            <StatTile icon={UserPlus} label="Шинэ харилцагч" value={formatNumber(data.kpis.newCustomers.current ?? 0)}>
              <Delta value={data.kpis.newCustomers} previousLabel={rangeOption.previousLabel} />
            </StatTile>
            <StatTile icon={FileText} label="Анкетын хариулт" value={formatNumber(data.kpis.submissions.current ?? 0)}>
              <Delta value={data.kpis.submissions} previousLabel={rangeOption.previousLabel} />
            </StatTile>
            <StatTile icon={AlertTriangle} label="Хугацаа хэтэрсэн ажил" value={formatNumber(data.kpis.overdue)}>
              {data.kpis.overdue > 0 ? (
                <Link
                  href="/dashboard/workshop"
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 hover:underline"
                >
                  <AlertTriangle size={14} aria-hidden /> Анхаарах шаардлагатай →
                </Link>
              ) : (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                  <CheckCircle2 size={14} aria-hidden /> Хоцорсон ажилгүй
                </p>
              )}
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Одоогийн байдлаар, бүх хугацааны</p>
            </StatTile>
          </div>

          <TrendChart data={data.trend} unit={data.unit} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={CARD}>
              <SectionTitle title="Ажлын төлөв" subtitle={`Нийт ${formatNumber(statusTotal)} ажил`} />
              <BarList
                emptyText="Энэ хугацаанд ажил бүртгэгдээгүй байна"
                rows={STATUS_ROWS.map((s) => {
                  const count = data.statuses.find((x) => x.status === s.key)?.count ?? 0;
                  return { label: s.label, value: count, display: formatNumber(count), sub: percentOf(count, statusTotal) };
                })}
              />
            </div>

            <div className={CARD}>
              <SectionTitle title="Харилцагчийн төрлөөр" subtitle="Ажлын тоо, захиалагчийн төрлөөр" />
              <BarList
                emptyText="Энэ хугацаанд ажил бүртгэгдээгүй байна"
                rows={CUSTOMER_TYPE_ROWS.map((t) => {
                  const count = data.customerTypes.find((x) => x.type === t.key)?.count ?? 0;
                  return { label: t.label, value: count, display: formatNumber(count), sub: percentOf(count, typeTotal) };
                })}
              />
            </div>

            <div className={CARD}>
              <SectionTitle title="Шилдэг үйлчилгээ" subtitle="Дууссан ажлын орлогоор, эхний 5" />
              <BarList
                emptyText="Энэ хугацаанд үйлчилгээтэй ажил алга"
                rows={data.topServices.map((s) => ({
                  label: s.name,
                  value: s.revenue,
                  display: formatMoney(s.revenue),
                  sub: `${s.works} ажил`,
                }))}
              />
            </div>

            <div className={CARD}>
              <SectionTitle title="Ажилчдын гүйцэтгэл" subtitle="Дуусгасан ажлын тоогоор, эхний 5" />
              {data.topEmployees.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">Энэ хугацаанд хуваарилсан ажил алга</p>
              ) : (
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                        <th className="font-bold py-2 px-1">Ажилтан</th>
                        <th className="font-bold py-2 px-1 text-right">Дууссан / Нийт</th>
                        <th className="font-bold py-2 px-1 text-right">Орлого</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {data.topEmployees.map((e) => (
                        <tr key={e.name}>
                          <td className="py-3 px-1">
                            <p className="font-bold text-slate-700 dark:text-slate-200">{e.name}</p>
                            <div className={`h-1.5 rounded mt-1.5 max-w-40 ${BAR_TRACK}`}>
                              <div
                                className={`h-full rounded ${BAR_FILL}`}
                                style={{ width: `${e.assigned > 0 ? (e.completed / e.assigned) * 100 : 0}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-1 text-right tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            <span className="font-bold text-slate-900 dark:text-white">{e.completed}</span> / {e.assigned}
                          </td>
                          <td className="py-3 px-1 text-right tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {formatMoney(e.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
