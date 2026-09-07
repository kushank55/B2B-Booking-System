"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { submitBooking, type BookingFormState } from "./actions";

type Option = { id: string; name: string; durationMinutes?: number };

type Slot = {
  startAt: string;
  endAt: string;
  localTime: string;
};

export function BookingForm({
  slug,
  timezone,
  services,
  staff,
  minDate,
}: {
  slug: string;
  timezone: string;
  services: Option[];
  staff: Option[];
  minDate: string;
}) {
  const [state, action, pending] = useActionState<BookingFormState, FormData>(
    submitBooking,
    undefined,
  );
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [staffId, setStaffId] = useState(staff[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [startAt, setStartAt] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsError, setSlotsError] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId),
    [services, serviceId],
  );

  useEffect(() => {
    setStartAt("");
    if (!serviceId || !date || !staffId) {
      setSlots([]);
      return;
    }

    const params = new URLSearchParams({ serviceId, date, staffId });
    setLoadingSlots(true);
    setSlotsError("");

    fetch(`/api/businesses/${slug}/slots?${params}`)
      .then(async (response) => {
        const body = (await response.json()) as { slots?: Slot[]; error?: string };
        if (!response.ok) {
          setSlots([]);
          setSlotsError(body.error ?? "Could not load slots.");
          return;
        }
        setSlots(body.slots ?? []);
      })
      .catch(() => {
        setSlots([]);
        setSlotsError("Could not load slots.");
      })
      .finally(() => setLoadingSlots(false));
  }, [slug, serviceId, staffId, date]);

  return (
    <form action={action} className="card form-grid">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="startAt" value={startAt} />

      <div className="field">
        <label htmlFor="serviceId">Service</label>
        <select
          id="serviceId"
          name="serviceId"
          value={serviceId}
          onChange={(event) => setServiceId(event.target.value)}
          required
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
              {service.durationMinutes ? ` (${service.durationMinutes} min)` : ""}
            </option>
          ))}
        </select>
      </div>

      {staff.length > 1 ? (
        <div className="field">
          <label htmlFor="staffId">Staff</label>
          <select
            id="staffId"
            name="staffId"
            value={staffId}
            onChange={(event) => setStaffId(event.target.value)}
            required
          >
            {staff.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="staffId" value={staffId} />
      )}

      <div className="field">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          min={minDate}
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
      </div>
      <p className="muted">Times are shown in {timezone}.</p>

      <div className="stack">
        <p>Available times</p>
        {loadingSlots ? <p className="muted">Loading slots…</p> : null}
        {slotsError ? <p className="error">{slotsError}</p> : null}
        {!loadingSlots && !date ? (
          <div className="empty">Pick a date to see open times.</div>
        ) : null}
        {!loadingSlots && date && slots.length === 0 && !slotsError ? (
          <div className="empty">No times available on that date.</div>
        ) : null}
      </div>
      <div className="slots">
        {slots.map((slot) => (
          <button
            key={slot.startAt}
            type="button"
            className={`slot${startAt === slot.startAt ? " slot-selected" : ""}`}
            onClick={() => setStartAt(slot.startAt)}
          >
            {slot.localTime}
          </button>
        ))}
      </div>
      {selectedService && startAt ? (
        <p className="muted">
          {selectedService.durationMinutes}-minute visit starting at{" "}
          {slots.find((slot) => slot.startAt === startAt)?.localTime}
        </p>
      ) : null}

      <div className="field">
        <label htmlFor="customerName">Your name</label>
        <input id="customerName" name="customerName" required />
      </div>

      <div className="field">
        <label htmlFor="customerEmail">Email</label>
        <input id="customerEmail" name="customerEmail" type="email" required />
      </div>

      <div className="field">
        <label htmlFor="customerPhone">Phone (optional)</label>
        <input id="customerPhone" name="customerPhone" />
      </div>

      {state?.error ? <p className="error">{state.error}</p> : null}

      <button type="submit" disabled={pending || !startAt}>
        {pending ? "Booking…" : "Book appointment"}
      </button>
    </form>
  );
}
