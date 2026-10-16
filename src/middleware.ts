import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'placeholder-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { pathname } = request.nextUrl;

  // Header anti-indexación en visor de pacientes
  if (pathname.startsWith('/plan/')) {
    supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  // Check auth user con Supabase
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // If Supabase connection fails or invalid token
    user = null;
  }

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminApiRoute = pathname.startsWith('/api/admin');
  const isAuthRoute = pathname === '/login';

  // Seed endpoint can be called publicly or during setup
  if (pathname === '/api/admin/seed') {
    return supabaseResponse;
  }

  // Protección de rutas Admin
  if (!user && (isAdminRoute || isAdminApiRoute)) {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: 'No autorizado. Inicie sesión en BioMetrix Pro.' }, { status: 401 });
    }
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirección si ya está autenticado
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/admin/pacientes', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/login',
    '/plan/:path*',
  ],
};
