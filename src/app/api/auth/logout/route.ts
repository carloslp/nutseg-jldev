import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();

    const redirectUrl = new URL('/login', req.url);
    const response = NextResponse.redirect(redirectUrl);
    
    // Clear cookies explicitly as well
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
