import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { pool } from '../../../../lib/db';
import { validatePassword } from '../../../../lib/password';
import { checkRateLimits, getClientIp } from '../../../../lib/rate-limit';
import { RESET_MAX_ATTEMPTS, resetCodeMatches } from '../../../../lib/password-reset';

const INVALID_CODE = { error: 'Баталгаажуулах код буруу эсвэл хугацаа нь дууссан байна.' };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const code = typeof body.token === 'string' ? body.token.trim() : '';
    const { newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Бүх талбарыг гүйцэд бөглөнө үү.' }, { status: 400 });
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const limited = await checkRateLimits([
      { key: `reset:ip:${getClientIp(request)}`, limit: 10, windowSeconds: 15 * 60 },
    ]);
    if (limited) return limited;

    // Хэрэглэгчийн хамгийн сүүлийн хүчинтэй код
    const { rows } = await pool.query(
      `SELECT u.user_id, r.id AS reset_id, r.code_hash, r.attempts
       FROM mt_user u
       JOIN mt_password_reset r ON r.user_id = u.user_id
       WHERE LOWER(u.email) = $1 AND u.is_active IS NOT FALSE AND r.expires_at > now()
       ORDER BY r.created_at DESC
       LIMIT 1`,
      [email]
    );
    const reset = rows[0];
    if (!reset || reset.attempts >= RESET_MAX_ATTEMPTS) {
      return NextResponse.json(INVALID_CODE, { status: 400 });
    }

    // Буруу код бүрийг тоолж, 5 удаа буруу оруулбал код хүчингүй болно
    if (!/^\d{6}$/.test(code) || !resetCodeMatches(reset.user_id, code, reset.code_hash)) {
      await pool.query('UPDATE mt_password_reset SET attempts = attempts + 1 WHERE id = $1', [reset.reset_id]);
      return NextResponse.json(INVALID_CODE, { status: 400 });
    }

    const passwordHash = await hash(newPassword, 10);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'UPDATE mt_user SET password_hash = $1, update_date = CURRENT_TIMESTAMP WHERE user_id = $2',
        [passwordHash, reset.user_id]
      );
      await client.query('DELETE FROM mt_password_reset WHERE user_id = $1', [reset.user_id]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return NextResponse.json({ message: 'Нууц үг амжилттай шинэчлэгдлээ.' }, { status: 200 });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Серверт алдаа гарлаа.' }, { status: 500 });
  }
}
