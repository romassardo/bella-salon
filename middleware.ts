import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (toSet: { name: string; value: string; options?: CookieOptions }[]) => {
        toSet.forEach(({ name, value, options }) => {
          res.cookies.set({ name, value, ...options });
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const isAdminPath = req.nextUrl.pathname.startsWith('/admin');
  const isLoginPath = req.nextUrl.pathname === '/admin/login';

  if (isAdminPath && !isLoginPath && !user) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  if (isLoginPath && user) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
