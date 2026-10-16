import { NextRequest, NextResponse } from 'next/server';
import { NutritionRepository } from '@/lib/db/repository';
import {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
  verifyPin,
  createSessionToken,
} from '@/lib/security/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  // 1. Rate-limiting anti-brute force check
  const rateLimit = checkRateLimit(clientIp);
  if (rateLimit.isBlocked) {
    const minutes = Math.ceil(rateLimit.retryAfterSeconds / 60);
    return NextResponse.json(
      {
        error: `Has superado el límite de intentos fallidos. Por seguridad médica, el acceso está bloqueado durante ${minutes} minutos.`,
        retryAfter: rateLimit.retryAfterSeconds,
      },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    );
  }

  // 2. Lookup permalink
  const permalink = await NutritionRepository.getPermalinkBySlug(slug);
  if (!permalink) {
    return NextResponse.json(
      { error: 'El enlace del plan no existe o ha expirado.' },
      { status: 404 }
    );
  }

  // 3. Check if permalink is active and not expired
  const isExpired = permalink.expiresAt ? new Date(permalink.expiresAt) < new Date() : false;
  if (!permalink.isActive || isExpired) {
    return NextResponse.json(
      { error: 'Este enlace de plan nutricional se encuentra inactivo o ha expirado. Contacta a tu especialista para renovarlo.' },
      { status: 403 }
    );
  }

  // 4. Parse payload
  let body: { pin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Formato inválido.' }, { status: 400 });
  }

  const pin = body.pin?.trim();
  if (!pin) {
    return NextResponse.json({ error: 'El PIN es obligatorio.' }, { status: 400 });
  }

  // 5. Verify PIN
  const isMatch = verifyPin(pin, permalink.passwordHash);
  if (!isMatch) {
    const failRecord = recordFailedAttempt(clientIp);
    if (failRecord.isNowBlocked) {
      const minutes = Math.ceil(failRecord.retryAfterSeconds / 60);
      return NextResponse.json(
        {
          error: `Has superado el límite de 5 intentos fallidos. Enlace bloqueado temporalmente por ${minutes} minutos.`,
          isBlocked: true,
          retryAfter: failRecord.retryAfterSeconds,
        },
        { status: 429, headers: { 'Retry-After': String(failRecord.retryAfterSeconds) } }
      );
    }

    return NextResponse.json(
      {
        error: `PIN incorrecto. Te quedan ${failRecord.remainingAttempts} intento(s) antes del bloqueo.`,
        remainingAttempts: failRecord.remainingAttempts,
      },
      { status: 401 }
    );
  }

  // 6. Success: clear rate limit, increment access counter, emit 7-day HttpOnly cookie
  clearRateLimit(clientIp);
  await NutritionRepository.incrementPermalinkAccess(slug);

  const sessionToken = createSessionToken(slug, permalink.passwordHash);

  const response = NextResponse.json({
    success: true,
    message: 'Acceso autorizado correctamente.',
  });

  response.cookies.set({
    name: 'nutseg_session',
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return response;
}
