import { requireAdmin } from "@/server/auth/guards";
import { listServices } from "@/server/admin/services";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ServicesPage() {
  const result = await requireAdmin();
  if (!result.ok) {
    redirect("/login");
  }

  const services = await listServices(result.businessId);

  return (
    <main className="content">
      <div className="toolbar">
        <div>
          <h1>Services</h1>
          <p className="muted">What customers can book. Duration is in minutes.</p>
        </div>
        <Link className="button-link" href="/admin/services/new">
          Add service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="empty">No services yet. Add one to start taking bookings.</div>
      ) : (
        <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>
                  <Link href={`/admin/services/${service.id}`}>
                    {service.name}
                  </Link>
                </td>
                <td>{service.durationMinutes} min</td>
                <td>
                  <span
                    className={`badge badge-${service.status.toLowerCase()}`}
                  >
                    {service.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </main>
  );
}
