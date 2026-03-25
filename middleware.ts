import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Middleware uses only the Edge-compatible config (no bcrypt/mongoose)
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api/auth (NextAuth routes)
     * - _next/static / _next/image (Next.js internals)
     * - favicon.ico, .png, .svg, .jpg (static assets)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|ico)$).*)",
  ],
};
