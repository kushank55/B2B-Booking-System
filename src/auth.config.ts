import type { UserRole } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.businessId = user.businessId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.role = token.role as UserRole;
      session.user.businessId = (token.businessId ?? null) as string | null;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
