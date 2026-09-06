"use client";

import { useActionState } from "react";
import { onboardBusiness, type FormState } from "@/app/owner/actions";
import { TIMEZONES } from "@/server/tenants/timezones";

export function OnboardForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    onboardBusiness,
    undefined,
  );

  return (
    <form action={action} className="card form-grid">
      <h2>Business</h2>

      <label htmlFor="name">Business name</label>
      <input id="name" name="name" required />

      <label htmlFor="contactEmail">Contact email</label>
      <input id="contactEmail" name="contactEmail" type="email" required />

      <label htmlFor="contactPhone">Contact phone</label>
      <input id="contactPhone" name="contactPhone" />

      <label htmlFor="timezone">Timezone</label>
      <select id="timezone" name="timezone" defaultValue="Asia/Kolkata" required>
        {TIMEZONES.map((zone) => (
          <option key={zone} value={zone}>
            {zone}
          </option>
        ))}
      </select>

      <label htmlFor="slug">Public slug (optional)</label>
      <input id="slug" name="slug" placeholder="bright-smiles" />

      <label htmlFor="status">Status</label>
      <select id="status" name="status" defaultValue="ACTIVE">
        <option value="ACTIVE">ACTIVE</option>
        <option value="DISABLED">DISABLED</option>
      </select>

      <h2>First Business Admin</h2>

      <label htmlFor="adminName">Admin name</label>
      <input id="adminName" name="adminName" required />

      <label htmlFor="adminEmail">Admin email</label>
      <input id="adminEmail" name="adminEmail" type="email" required />

      <label htmlFor="adminPassword">Temporary password</label>
      <input
        id="adminPassword"
        name="adminPassword"
        type="password"
        minLength={8}
        required
      />

      {state?.error ? <p className="error">{state.error}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create customer"}
      </button>
    </form>
  );
}
