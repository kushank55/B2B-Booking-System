import { prisma } from "@/lib/prisma";
import { PublicFrame } from "@/components/public-frame";
import { getActiveBusinessBySlug } from "@/server/tenants/active";
import { todayInZone } from "@/server/bookings/time";
import { BookingForm } from "./booking-form";

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getActiveBusinessBySlug(slug);

  if (!business) {
    return (
      <PublicFrame>
        <main className="content content-narrow">
          <h1>Booking unavailable</h1>
          <p className="muted lede">
            This business is not available for booking right now.
          </p>
          <div className="empty">
            The public page is hidden when a business is disabled or the link is
            wrong.
          </div>
        </main>
      </PublicFrame>
    );
  }

  const [services, staff] = await Promise.all([
    prisma.service.findMany({
      where: { businessId: business.id, status: "ACTIVE" },
      orderBy: { name: "asc" },
    }),
    prisma.staff.findMany({
      where: { businessId: business.id, status: "ACTIVE" },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <PublicFrame>
      <main className="content content-narrow">
        <p className="muted">Book an appointment</p>
        <h1>{business.name}</h1>
        <p className="muted lede">
          Choose a service and date. Only open, unbooked times are shown.
        </p>

        {services.length === 0 || staff.length === 0 ? (
          <div className="empty">
            This business has no bookable services or staff yet.
          </div>
        ) : (
          <BookingForm
            slug={business.slug}
            timezone={business.timezone}
            minDate={todayInZone(business.timezone)}
            services={services.map((service) => ({
              id: service.id,
              name: service.name,
              durationMinutes: service.durationMinutes,
            }))}
            staff={staff.map((person) => ({
              id: person.id,
              name: person.name,
            }))}
          />
        )}
      </main>
    </PublicFrame>
  );
}
