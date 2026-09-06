"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm({ urlError }: { urlError?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );
  const error = state?.error ?? urlError;

  return (
    <form action={action} className="card">
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {error ? <p className="error">{error}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
