import { getBusiness } from "@/server/tenants/service";
import { updateBusinessStatus } from "@/app/owner/actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getBusiness(id);

  if (!business) {
    notFound();
  }

  const nextStatus = business.status === "ACTIVE" ? "DISABLED" : "ACTIVE";

  return (
    <main className="content content-narrow">
      <Link className="back-link" href="/owner">
        Back to customers
      </Link>
      <div className="toolbar">
        <h1>{business.name}</h1>
        <span className={`badge badge-${business.status.toLowerCase()}`}>
          {business.status}
        </span>
      </div>

      <section className="card stack">
        <div className="detail-row">
          <strong>Slug</strong>
          <p>/{business.slug}</p>
        </div>
        <div className="detail-row">
          <strong>Contact</strong>
          <p>
            {business.contactEmail}
            {business.contactPhone ? ` · ${business.contactPhone}` : ""}
          </p>
        </div>
        <div className="detail-row">
          <strong>Timezone</strong>
          <p>{business.timezone}</p>
        </div>
      </section>

      <section className="card stack">
        <h2>Business Admins</h2>
        {business.users.length === 0 ? (
          <div className="empty">No admins yet.</div>
        ) : (
          <ul>
            {business.users.map((admin) => (
              <li key={admin.id}>
                {admin.name} ({admin.email})
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={updateBusinessStatus} className="card stack">
        <input type="hidden" name="id" value={business.id} />
        <input type="hidden" name="status" value={nextStatus} />
        <p className="muted">
          A disabled customer cannot sign in as admin, and public booking for
          this tenant is rejected.
        </p>
        <button
          type="submit"
          className={nextStatus === "DISABLED" ? "button-danger" : undefined}
        >
          {nextStatus === "DISABLED" ? "Disable customer" : "Enable customer"}
        </button>
      </form>
    </main>
  );
}
