import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isAdminPath = req.nextUrl.pathname.startsWith('/admin');
  const isDashboardPath = req.nextUrl.pathname.startsWith('/dashboard');
  
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // Dashboard & Admin - login wela thiyenna one
  if ((isAdminPath || isDashboardPath) && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }

  // Admin path - admin witharai
  if (isAdminPath && role !== 'admin') {
    return Response.redirect(new URL('/', req.nextUrl));
  }

  // ok nam next
  return;
});

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};