import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async () => null,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // ⚠️ මේකයි add කරන කොටස — token එකේ role field එක session.user එකට map කරනවා
    session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;

      const isAdminRoute = pathname.startsWith('/admin');
      const isDashboardRoute = pathname.startsWith('/dashboard');

      if (isAdminRoute) {
        return isLoggedIn && auth.user.role === 'admin';
      }

      if (isDashboardRoute && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
};