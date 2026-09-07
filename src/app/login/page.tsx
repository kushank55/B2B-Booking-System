import { PublicFrame } from "@/components/public-frame";
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
    <PublicFrame>
      <main className="content content-narrow">
        <h1>Sign in</h1>
        <p className="muted lede">System Owner and Business Admin only.</p>
        <LoginForm urlError={urlError} />
      </main>
    </PublicFrame>
  );
}
