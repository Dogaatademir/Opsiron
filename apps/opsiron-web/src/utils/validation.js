/**
 * Opsiron Validation Utils
 * Form doğrulama kuralları ve yardımcı fonksiyonlar.
 */

// ============================================
// REGEX PATTERNS
// ============================================

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// TR Telefon Formatı: 5xxxxxxxxx, 05xxxxxxxxx, +905xxxxxxxxx
const PHONE_REGEX = /^(05|5|\+905)\d{9}$/;

// ============================================
// ATOMIC VALIDATORS
// ============================================

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
};

export const isEmail = (value) => {
  return value && EMAIL_REGEX.test(value);
};

export const isPhone = (value) => {
  const cleanPhone = String(value).replace(/[\s()-]/g, '');
  return cleanPhone && PHONE_REGEX.test(cleanPhone);
};

export const minLength = (value, min) => {
  return value && value.length >= min;
};

export const maxLength = (value, max) => {
  return value && value.length <= max;
};

// ============================================
// FORM SCHEMAS
// ============================================

/**
 * İletişim Formu Validasyonu
 * (Contact.jsx için)
 */
export const validateContactForm = (values) => {
  let errors = {};

  // Ad Soyad
  if (isEmpty(values.name)) {
    errors.name = 'Ad Soyad alanı zorunludur.';
  } else if (!minLength(values.name, 3)) {
    errors.name = 'Ad Soyad en az 3 karakter olmalıdır.';
  }

  // Marka / Şirket Adı
  if (isEmpty(values.brand)) {
    errors.brand = 'Marka veya şirket adı zorunludur.';
  }

  // E-posta
  if (isEmpty(values.email)) {
    errors.email = 'E-posta adresi zorunludur.';
  } else if (!isEmail(values.email)) {
    errors.email = 'Geçerli bir e-posta adresi giriniz.';
  }

  // Telefon (Opsiyonel — girilirse format kontrolü yapılır)
  if (!isEmpty(values.phone) && !isPhone(values.phone)) {
    errors.phone = 'Geçerli bir telefon numarası giriniz (5XX...).';
  }

  // Hizmet Alanı
  if (isEmpty(values.serviceArea)) {
    errors.serviceArea = 'Lütfen bir hizmet alanı seçiniz.';
  }

  // Mesaj
  if (isEmpty(values.message)) {
    errors.message = 'Lütfen projeniz hakkında kısa bilgi verin.';
  } else if (!minLength(values.message, 10)) {
    errors.message = 'Mesajınız çok kısa, biraz daha detay verebilir misiniz?';
  }

  return errors;
};