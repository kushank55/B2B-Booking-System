import { requireAdmin } from "@/server/auth/guards";
import { listServices } from "@/server/admin/services";
import { listStaff } from "@/server/admin/staff";
import { getSlotsForSlug, listAvailability } from "@/server/bookings/availability";
import { HoursForm } from "./hours-form";
import { redirect } from "next/navigation";

export default async function HoursPage({
  searchParams,
}: {
  searchParams: Promise<{ staffId?: string; date?: string; serviceId?: string }>;
}) {
  const result = await requireAdmin();
  if (!result.ok) {
    redirect("/login");
  }

  const params = await searchParams;
  const [staff, services] = await Promise.all([
    listStaff(result.businessId),
    listServices(result.businessId),
  ]);

  const activeStaff = staff.filter((person) => person.status === "ACTIVE");
  const selectedStaffId = params.staffId ?? "";
  const rules = await listAvailability(
    result.businessId,
    selectedStaffId || null,
  );

  const previewStaffId = params.staffId || activeStaff[0]?.id || "";
  const previewServiceId =
    params.serviceId ||
    services.find((service) => service.status === "ACTIVE")?.id ||
    "";
  const previewDate = params.date ?? "";

  const preview =
    previewDate && previewServiceId
      ? await getSlotsForSlug({
          slug: result.business.slug,
          serviceId: previewServiceId,
          date: previewDate,
          staffId: previewStaffId,
        })
      : null;

  return (
    <main className="content">
      <h1>Availability</h1>
      <p className="muted">
        Weekly hours in {result.business.timezone}. Slots are derived from these
        hours, the service duration, and appointments that are not cancelled.
      </p>

      <form className="card hours-scope" method="get">
        <label htmlFor="staffId">Hours for</label>
        <select id="staffId" name="staffId" defaultValue={selectedStaffId}>
          <option value="">All staff</option>
          {staff.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
              {person.status === "INACTIVE" ? " (inactive)" : ""}
            </option>
          ))}
        </select>
        <button type="submit">Load</button>
      </form>

      <HoursForm staffId={selectedStaffId} rules={rules} />

      <section className="card stack">
        <h2>Preview slots</h2>
        <form className="hours-preview" method="get">
          <input type="hidden" name="staffId" value={selectedStaffId} />
          <label htmlFor="serviceId">Service</label>
          <select
            id="serviceId"
            name="serviceId"
            defaultValue={previewServiceId}
          >
            {services
              .filter((service) => service.status === "ACTIVE")
              .map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.durationMinutes} min)
                </option>
              ))}
          </select>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={previewDate}
            required
          />
          <button type="submit">Show slots</button>
        </form>

        {preview && "error" in preview && preview.error ? (
          <p className="error">{preview.error}</p>
        ) : null}

        {preview && "slots" in preview ? (
          preview.slots.length === 0 ? (
            <p className="muted">No bookable slots for that date.</p>
          ) : (
            <p>
              {preview.slots.map((slot) => slot.localTime).join(" · ")}
            </p>
          )
        ) : null}
      </section>
    </main>
  );
}
