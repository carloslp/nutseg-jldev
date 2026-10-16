export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const real = req.headers.get('x-real-ip');
  if (real) {
    return real;
  }
  // Fallback to env variable or default localhost
  return process.env.NEXT_PUBLIC_DEFAULT_IP ?? '127.0.0.1';
}
