'use client';

import { useEffect } from 'react';

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const isField = (el: EventTarget | null): el is Field =>
  el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement;

// Браузерын хэлээс үл хамааран формын шалгалтын мессежийг монголоор харуулах
function mongolianMessage(el: Field): string {
  const v = el.validity;
  if (v.valueMissing) {
    if (el.dataset.requiredMessage) return el.dataset.requiredMessage;
    if (el instanceof HTMLSelectElement) return 'Сонголтоо хийнэ үү.';
    if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) return 'Энэ сонголтыг хийнэ үү.';
    return 'Энэ талбарыг бөглөнө үү.';
  }
  if (el instanceof HTMLInputElement) {
    if (v.badInput) return el.type === 'number' ? 'Тоо оруулна уу.' : 'Утгаа зөв оруулна уу.';
    if (v.typeMismatch) {
      if (el.type === 'email') return 'Имэйл хаягаа зөв оруулна уу (жишээ нь: name@example.com).';
      if (el.type === 'url') return 'Холбоосоо зөв оруулна уу.';
      return 'Утгаа зөв оруулна уу.';
    }
    // data-min-message / data-max-message-ээр талбар бүр өөрийн ойлгомжтой мессежийг өгч болно
    if (v.rangeUnderflow && el.dataset.minMessage) return el.dataset.minMessage;
    if (v.rangeOverflow && el.dataset.maxMessage) return el.dataset.maxMessage;
    if (v.rangeUnderflow) return `Утга хамгийн багадаа ${el.min} байх ёстой.`;
    if (v.rangeOverflow) return `Утга хамгийн ихдээ ${el.max} байх ёстой.`;
    if (v.stepMismatch) {
      // step заагаагүй бол браузер анхдагчаар 1 гэж үздэг
      const step = el.step ? Number(el.step) : 1;
      if (step === 1) return 'Бүхэл тоо оруулна уу.';
      if (step === 0.01) return 'Таслалаас хойш хамгийн ихдээ 2 орон оруулна уу.';
      return 'Утгаа зөв оруулна уу.';
    }
  }
  if (v.tooShort) return `Хамгийн багадаа ${(el as HTMLInputElement).minLength} тэмдэгт оруулна уу (одоо ${el.value.length}).`;
  if (v.tooLong) return `Хамгийн ихдээ ${(el as HTMLInputElement).maxLength} тэмдэгт оруулна уу.`;
  if (v.patternMismatch) return el.title || 'Шаардлагатай хэлбэрээр оруулна уу.';
  return 'Утгаа зөв оруулна уу.';
}

// Root layout-д нэг удаа байрлуулна. "invalid" үйл явдал bubble хийдэггүй тул capture-ээр барина.
// Утга өөрчлөгдөхөд тусгай мессежийг цэвэрлэж, браузер дахин шалгах боломжтой болгоно.
export default function ValidationMessages() {
  useEffect(() => {
    const onInvalid = (e: Event) => {
      if (!isField(e.target)) return;
      const el = e.target;
      el.setCustomValidity('');
      if (!el.validity.valid) el.setCustomValidity(mongolianMessage(el));
    };
    const onEdit = (e: Event) => {
      if (isField(e.target)) e.target.setCustomValidity('');
    };

    document.addEventListener('invalid', onInvalid, true);
    document.addEventListener('input', onEdit, true);
    document.addEventListener('change', onEdit, true);
    return () => {
      document.removeEventListener('invalid', onInvalid, true);
      document.removeEventListener('input', onEdit, true);
      document.removeEventListener('change', onEdit, true);
    };
  }, []);

  return null;
}
