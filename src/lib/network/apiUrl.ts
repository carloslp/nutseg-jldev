export function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/*$/, ''); // remove trailing slash
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
