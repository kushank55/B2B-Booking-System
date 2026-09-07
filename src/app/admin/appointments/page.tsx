import { requireAdmin } from "@/server/auth/guards";
import { listAppointments } from "@/server/admin/appointments";
import { updateAppointment } from "@/app/admin/actions";
import { formatDateTimeInZone } from "@/server/bookings/time";
import { redirect } from "next/navigation";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
  const result = await requireAdmin();
  if (!result.ok) {
    redirect("/login");
  }

  const filters = await searchParams;
  const date = filters.date ?? "";
  const status =
    filters.status === "CONFIRMED" ||
    filters.status === "CANCELLED" ||
    filters.status === "COMPLETED"
      ? filters.status
      : "";

  const appointments = await listAppointments(
    result.businessId,
    result.business.timezone,
    { date, status },
  );

  const returnTo = `/admin/appointments${
    date || status
      ? `?${new URLSearchParams({
          ...(date ? { date } : {}),
          ...(status ? { status } : {}),
        }).toString()}`
      : ""
  }`;

  return (
    <main className="content">
      <div className="toolbar">
        <div>
          <h1>Appointments</h1>
          <p className="muted">
            Times are shown in {result.business.timezone}. Cancelled bookings no
            longer block a slot.
          </p>
        </div>
      </div>

      <form className="card filter-bar" method="get">
        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" name="date" type="date" defaultValue={date} />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status}>
            <option value="">All</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
        <button type="submit">Filter</button>
      </form>

      {appointments.length === 0 ? (
        <div className="empty">No appointments match these filters.</div>
      ) : (
        <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Staff</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>
                  {formatDateTimeInZone(
                    appointment.startAt,
                    result.business.timezone,
                  )}
                </td>
                <td>
                  {appointment.customerName}
                  <div className="muted">{appointment.customerEmail}</div>
                </td>
                <td>{appointment.service.name}</td>
                <td>{appointment.staff.name}</td>
                <td>
                  <span
                    className={`badge badge-${appointment.status.toLowerCase()}`}
                  >
                    {appointment.status}
                  </span>
                </td>
                <td>
                  {appointment.status === "CONFIRMED" ? (
                    <div className="row-actions">
                      <form action={updateAppointment}>
                        <input type="hidden" name="id" value={appointment.id} />
                        <input type="hidden" name="status" value="COMPLETED" />
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <button type="submit" className="button-secondary">
                          Complete
                        </button>
                      </form>
                      <form action={updateAppointment}>
                        <input type="hidden" name="id" value={appointment.id} />
                        <input type="hidden" name="status" value="CANCELLED" />
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <button type="submit" className="button-danger">
                          Cancel
                        </button>
                      </form>
                    </div>
                  ) : null}
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
