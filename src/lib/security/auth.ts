import { createHmac, randomBytes } from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'nutseg_super_secret_signing_key_2026_biometrix';

// In-memory sliding window rate limiter for brute-force protection (5 failed attempts / 15 minutes)
interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

const loginAttempts = new Map<string, AttemptRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if IP is currently blocked due to brute-force attempts.
 */
export function checkRateLimit(ip: string): { isBlocked: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    return { isBlocked: false, retryAfterSeconds: 0 };
  }

  // Check if currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
    return { isBlocked: true, retryAfterSeconds: retryAfter };
  }

  // Window expired, reset record
  if (now - record.firstAttemptAt > WINDOW_MS) {
    loginAttempts.delete(ip);
    return { isBlocked: false, retryAfterSeconds: 0 };
  }

  return { isBlocked: false, retryAfterSeconds: 0 };
}

/**
 * Record a failed attempt for an IP.
 */
export function recordFailedAttempt(ip: string): { isNowBlocked: boolean; remainingAttempts: number; retryAfterSeconds: number } {
  const now = Date.now();
  let record = loginAttempts.get(ip);

  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    record = { count: 1, firstAttemptAt: now };
    loginAttempts.set(ip, record);
    return { isNowBlocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - 1, retryAfterSeconds: 0 };
  }

  record.count += 1;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    return {
      isNowBlocked: true,
      remainingAttempts: 0,
      retryAfterSeconds: Math.ceil(BLOCK_DURATION_MS / 1000),
    };
  }

  return {
    isNowBlocked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - record.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Clear failed attempts after successful authentication.
 */
export function clearRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

/**
 * Generate a readable 6-character PIN (e.g. NUT-482).
 */
export function generateReadablePin(): string {
  const num = Math.floor(100 + Math.random() * 900);
  return `NUT-${num}`;
}

/**
 * Hash PIN securely using HMAC-SHA256 with secret.
 */
export function hashPin(pin: string): string {
  const normalized = pin.trim().toUpperCase();
  return createHmac('sha256', SESSION_SECRET).update(normalized).digest('hex');
}

/**
 * Verify PIN against stored hash.
 */
export function verifyPin(pin: string, storedHash: string): boolean {
  const computed = hashPin(pin);
  return computed === storedHash;
}

/**
 * Create a cryptographically signed session token for a permalink slug.
 * Payload: slug:timestamp:signature
 */
export function createSessionToken(slug: string, pinHash: string): string {
  const issuedAt = Date.now();
  // Include part of pinHash so changing the PIN immediately invalidates active sessions
  const payload = `${slug}:${issuedAt}:${pinHash.slice(0, 16)}`;
  const signature = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

/**
 * Verify session token. Returns slug if valid and not expired (7 days), or null if invalid.
 */
export function verifySessionToken(token: string, currentPinHash: string): { isValid: boolean; slug?: string } {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = raw.split(':');
    if (parts.length !== 4) return { isValid: false };

    const [slug, issuedAtStr, pinSlice, signature] = parts;
    const payload = `${slug}:${issuedAtStr}:${pinSlice}`;
    const expectedSig = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');

    if (signature !== expectedSig) {
      return { isValid: false };
    }

    // Check if PIN has changed since token issuance
    if (pinSlice !== currentPinHash.slice(0, 16)) {
      return { isValid: false };
    }

    // Check 7-day expiration (7 * 24 * 60 * 60 * 1000 ms)
    const issuedAt = parseInt(issuedAtStr, 10);
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - issuedAt > maxAge) {
      return { isValid: false };
    }

    return { isValid: true, slug };
  } catch {
    return { isValid: false };
  }
}
