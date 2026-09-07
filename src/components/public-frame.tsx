import Link from "next/link";

export function PublicFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app">
      <header className="topbar">
        <Link className="brand" href="/login">
          Booking
        </Link>
      </header>
      {children}
    </div>
  );
}
