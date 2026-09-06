import { requireAdmin } from "@/server/auth/guards";
import { logout } from "@/app/login/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await requireAdmin();

  if (!result.ok) {
    redirect(
      result.reason === "disabled"
        ? "/login?code=business_disabled"
        : "/login",
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-nav">
          <Link href="/admin">{result.business.name}</Link>
          <Link href="/admin">Profile</Link>
          <Link href="/admin/services">Services</Link>
          <Link href="/admin/staff">Staff</Link>
        </div>
        <div className="topbar-meta">
          <span className="muted">{result.user.email}</span>
          <form action={logout}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
