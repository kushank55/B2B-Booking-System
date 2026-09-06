import { listBusinesses } from "@/server/tenants/service";
import Link from "next/link";

export default async function OwnerPage() {
  const businesses = await listBusinesses();

  return (
    <main className="content">
      <div className="toolbar">
        <div>
          <h1>Customers</h1>
          <p className="muted">Onboarded businesses on the platform.</p>
        </div>
        <Link className="button-link" href="/owner/new">
          Onboard business
        </Link>
      </div>

      {businesses.length === 0 ? (
        <p className="muted">No businesses yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((business) => (
              <tr key={business.id}>
                <td>
                  <Link href={`/owner/businesses/${business.id}`}>
                    {business.name}
                  </Link>
                  <div className="muted">/{business.slug}</div>
                </td>
                <td>
                  {business.contactEmail}
                  {business.contactPhone ? (
                    <div className="muted">{business.contactPhone}</div>
                  ) : null}
                </td>
                <td>
                  <span className={`badge badge-${business.status.toLowerCase()}`}>
                    {business.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
