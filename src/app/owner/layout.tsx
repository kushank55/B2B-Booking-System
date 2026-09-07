import { auth } from "@/auth";
import { logout } from "@/app/login/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SYSTEM_OWNER") {
    redirect("/login");
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-start">
          <Link className="brand" href="/owner">
            Booking
          </Link>
          <span className="topbar-tenant">System Owner</span>
        </div>
        <div className="topbar-meta">
          <span className="muted">{session.user.email}</span>
          <form action={logout}>
            <button type="submit" className="button-secondary">
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
