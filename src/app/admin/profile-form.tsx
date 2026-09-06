"use client";

import { useActionState } from "react";
import { saveProfile, type FormState } from "@/app/admin/actions";
import { TIMEZONES } from "@/server/tenants/timezones";

type Profile = {
  name: string;
  contactEmail: string;
  contactPhone: string | null;
  timezone: string;
};

export function ProfileForm({ business }: { business: Profile }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveProfile,
    undefined,
  );

  return (
    <form action={action} className="card form-grid">
      <label htmlFor="name">Business name</label>
      <input id="name" name="name" defaultValue={business.name} required />

      <label htmlFor="contactEmail">Contact email</label>
      <input
        id="contactEmail"
        name="contactEmail"
        type="email"
        defaultValue={business.contactEmail}
        required
      />

      <label htmlFor="contactPhone">Contact phone</label>
      <input
        id="contactPhone"
        name="contactPhone"
        defaultValue={business.contactPhone ?? ""}
      />

      <label htmlFor="timezone">Timezone</label>
      <select id="timezone" name="timezone" defaultValue={business.timezone} required>
        {TIMEZONES.map((zone) => (
          <option key={zone} value={zone}>
            {zone}
          </option>
        ))}
        {TIMEZONES.includes(
          business.timezone as (typeof TIMEZONES)[number],
        ) ? null : (
          <option value={business.timezone}>{business.timezone}</option>
        )}
      </select>

      {state?.error ? <p className="error">{state.error}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
