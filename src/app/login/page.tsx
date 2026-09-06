import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const urlError =
    code === "business_disabled"
      ? "This business is disabled and cannot sign in."
      : code
        ? "Invalid email or password."
        : undefined;

  return (
    <main className="page">
      <div className="shell">
        <h1>Sign in</h1>
        <p className="muted">System Owner and Business Admin only.</p>
        <LoginForm urlError={urlError} />
      </div>
    </main>
  );
}
