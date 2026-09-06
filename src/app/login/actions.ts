"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export type LoginState = { error: string } | undefined;

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const cause =
        "cause" in error && error.cause && typeof error.cause === "object"
          ? (error.cause as { err?: { code?: string }; code?: string })
          : undefined;
      const code =
        ("code" in error && typeof error.code === "string" && error.code) ||
        cause?.err?.code ||
        cause?.code ||
        "";

      if (code === "business_disabled") {
        return {
          error: "This business is disabled and cannot sign in.",
        };
      }

      return { error: "Invalid email or password." };
    }

    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
