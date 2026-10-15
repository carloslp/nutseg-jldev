import { describe, it, expect, beforeEach } from 'vitest';
import {
  hashPin,
  verifyPin,
  generateReadablePin,
  createSessionToken,
  verifySessionToken,
  recordFailedAttempt,
  checkRateLimit,
  clearRateLimit,
} from '../src/lib/security/auth';

describe('Módulo 3: Seguridad del Permalink & Rate Limiting', () => {
  const testIp = '192.168.1.100';

  beforeEach(() => {
    clearRateLimit(testIp);
  });

  it('Genera PIN legible con formato NUT-XXX', () => {
    const pin = generateReadablePin();
    expect(pin).toMatch(/^NUT-\d{3}$/);
  });

  it('Hashea y verifica el PIN correctamente (case-insensitive y sin espacios)', () => {
    const pin = 'NUT-482';
    const hash = hashPin(pin);

    expect(verifyPin('NUT-482', hash)).toBe(true);
    expect(verifyPin('nut-482', hash)).toBe(true);
    expect(verifyPin('  NUT-482  ', hash)).toBe(true);
    expect(verifyPin('NUT-999', hash)).toBe(false);
  });

  it('CA-3.4: Bloquea después de 5 intentos fallidos desde la misma IP (Rate limiting 15 min)', () => {
    // Intentos 1 al 4: no bloqueados
    for (let i = 1; i <= 4; i++) {
      const res = recordFailedAttempt(testIp);
      expect(res.isNowBlocked).toBe(false);
      expect(res.remainingAttempts).toBe(5 - i);
    }

    // Intento 5: bloqueo inmediato
    const res5 = recordFailedAttempt(testIp);
    expect(res5.isNowBlocked).toBe(true);
    expect(res5.remainingAttempts).toBe(0);
    expect(res5.retryAfterSeconds).toBeGreaterThan(0);

    // Consulta de rate limit
    const check = checkRateLimit(testIp);
    expect(check.isBlocked).toBe(true);
    expect(check.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('CA-3.1 & CA-3.3: Emite token de sesión válido y lo invalida si el PIN cambia', () => {
    const slug = 'k9x2m7p4q1w8';
    const pinHash1 = hashPin('NUT-482');

    // Token generado con PIN original
    const token = createSessionToken(slug, pinHash1);
    const validCheck = verifySessionToken(token, pinHash1);

    expect(validCheck.isValid).toBe(true);
    expect(validCheck.slug).toBe(slug);

    // El especialista cambia la contraseña a NUT-901
    const pinHash2 = hashPin('NUT-901');
    const invalidCheck = verifySessionToken(token, pinHash2);

    // Debe invalidarse inmediatamente sin esperar los 7 días
    expect(invalidCheck.isValid).toBe(false);
  });
});
