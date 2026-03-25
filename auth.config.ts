// Edge-compatible auth config (no Node.js-only imports)
// Used by middleware. Full config (with credentials provider) is in auth.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const publicPaths = ["/", "/login", "/signup", "/about", "/contact"];
      const isPublic = publicPaths.includes(pathname);
      const isAuthPage = ["/login", "/signup"].includes(pathname);

      if (isAuthPage) {
        // Already logged in — redirect away from auth pages
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      if (isPublic) return true;

      // All other routes require authentication
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.onboardingCompleted = user.onboardingCompleted;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.onboardingCompleted = token.onboardingCompleted;
      return session;
    },
  },
  providers: [], // Filled in auth.ts
  session: { strategy: "jwt" },
  trustHost: true,
};
