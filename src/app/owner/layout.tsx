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
        <Link href="/owner">System Owner</Link>
        <div className="topbar-meta">
          <span className="muted">{session.user.email}</span>
          <form action={logout}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
