import type { UserRole } from "@prisma/client";
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: UserRole;
    businessId: string | null;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      businessId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    businessId: string | null;
  }
}
