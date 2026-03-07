// In-memory OTP store. Key: email (lowercase). Value: { otp, expiresAt, type, payload?, userId? }
const store = new Map();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function setOtp(email, type, payload = null, userId = null) {
  const key = email.trim().toLowerCase();
  const otp = generateOtp();
  store.set(key, {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    type,
    payload: payload || null,
    userId: userId || null,
  });
  return otp;
}

export function getAndValidateOtp(email, otp, type) {
  const key = (email || '').trim().toLowerCase();
  const entry = store.get(key);
  if (!entry) return { valid: false, message: 'OTP expired or invalid' };
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return { valid: false, message: 'OTP expired' };
  }
  if (entry.type !== type) return { valid: false, message: 'Invalid OTP' };
  if (String(entry.otp) !== String(otp).trim()) return { valid: false, message: 'Invalid OTP' };
  const data = { ...entry };
  store.delete(key);
  return { valid: true, data };
}

export function getOtpEntry(email) {
  return store.get((email || '').trim().toLowerCase()) || null;
}
