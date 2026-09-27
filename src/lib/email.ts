import 'server-only';

// Имэйлийг Resend (https://resend.com) REST API-аар илгээнэ.
// Тохиргоо: RESEND_API_KEY, EMAIL_FROM (жишээ нь "OpenData <no-reply@таны-домэйн.mn>")
// Тохируулаагүй бол dev орчинд console-д хэвлэж, production-д алдаа бүртгэнэ.
export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[email:dev] To: ${to}\nSubject: ${subject}\n\n${text}`);
      return true;
    }
    console.error('Имэйл илгээх тохиргоо (RESEND_API_KEY, EMAIL_FROM) хийгдээгүй байна.');
    return false;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) {
    console.error('Имэйл илгээхэд алдаа гарлаа:', res.status, await res.text());
    return false;
  }
  return true;
}
