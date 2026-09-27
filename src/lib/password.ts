// Нууц үгийн шаардлага: 8–72 тэмдэгт (bcrypt 72 байтаас хойшхийг үл тоодог), үсэг болон тоо агуулсан.
// Алдаатай бол монгол тайлбар, зөв бол null буцаана.
export function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Нууц үг хамгийн багадаа 8 тэмдэгттэй байх ёстой.';
  }
  if (new TextEncoder().encode(password).length > 72) {
    return 'Нууц үг хэт урт байна (72 байтаас ихгүй).';
  }
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) {
    return 'Нууц үг үсэг болон тоо хоёуланг агуулсан байх ёстой.';
  }
  return null;
}

export const PASSWORD_HINT = 'Хамгийн багадаа 8 тэмдэгт, үсэг болон тоо агуулсан';
