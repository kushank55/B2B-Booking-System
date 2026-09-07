import { requireAdmin } from "@/server/auth/guards";
import { listStaff } from "@/server/admin/staff";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StaffPage() {
  const result = await requireAdmin();
  if (!result.ok) {
    redirect("/login");
  }

  const staff = await listStaff(result.businessId);

  return (
    <main className="content">
      <div className="toolbar">
        <div>
          <h1>Staff</h1>
          <p className="muted">
            Bookable people for this business. The same staff cannot have
            overlapping appointments.
          </p>
        </div>
        <Link className="button-link" href="/admin/staff/new">
          Add staff
        </Link>
      </div>

      {staff.length === 0 ? (
        <div className="empty">No staff yet. Add someone customers can book.</div>
      ) : (
        <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((person) => (
              <tr key={person.id}>
                <td>
                  <Link href={`/admin/staff/${person.id}`}>{person.name}</Link>
                </td>
                <td>{person.email ?? "—"}</td>
                <td>
                  <span className={`badge badge-${person.status.toLowerCase()}`}>
                    {person.status}
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
