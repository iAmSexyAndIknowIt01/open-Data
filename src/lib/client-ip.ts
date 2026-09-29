import 'server-only';

// Клиентийн IP-г тодорхойлох (rate limit, session бүртгэлд).
//
// X-Forwarded-For-ийн ЭХНИЙ утгыг клиент өөрөө дурын утгаар илгээж чаддаг тул түүнд итгэхгүй.
// Proxy бүр жагсаалтын ТӨГСГӨЛД өөрийн харсан IP-г нэмдэг тул итгэмжлэгдсэн proxy-ийн тоогоор
// баруун талаас нь тоолж авна:
//   TRUSTED_PROXY_HOPS=1 (анхдагч) — нэг load balancer / nginx-ийн ард
//   TRUSTED_PROXY_HOPS=0 — proxy-гүй (X-Forwarded-For-ийг огт ашиглахгүй)
// Vercel дээр X-Forwarded-For, X-Real-IP-г платформ өөрөө дарж бичдэг тул шууд итгэнэ.
export function clientIpFromHeaders(headers: Headers): string {
  if (process.env.VERCEL) {
    return headers.get('x-real-ip') || headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  }

  const hops = Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? '1', 10);
  if (!Number.isFinite(hops) || hops <= 0) return 'unknown';

  const chain = (headers.get('x-forwarded-for') ?? '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
  return chain.length >= hops ? chain[chain.length - hops] : 'unknown';
}
