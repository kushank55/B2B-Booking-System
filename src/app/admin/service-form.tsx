"use client";

import { useActionState } from "react";
import { saveService, type FormState } from "@/app/admin/actions";

type ServiceValues = {
  id?: string;
  name: string;
  durationMinutes: number;
  status: "ACTIVE" | "INACTIVE";
};

export function ServiceForm({ service }: { service?: ServiceValues }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveService,
    undefined,
  );

  return (
    <form action={action} className="card form-grid">
      {service?.id ? <input type="hidden" name="id" value={service.id} /> : null}

      <label htmlFor="name">Name</label>
      <input id="name" name="name" defaultValue={service?.name ?? ""} required />

      <label htmlFor="durationMinutes">Duration (minutes)</label>
      <input
        id="durationMinutes"
        name="durationMinutes"
        type="number"
        min={1}
        defaultValue={service?.durationMinutes ?? 30}
        required
      />

      <label htmlFor="status">Status</label>
      <select
        id="status"
        name="status"
        defaultValue={service?.status ?? "ACTIVE"}
      >
        <option value="ACTIVE">ACTIVE</option>
        <option value="INACTIVE">INACTIVE</option>
      </select>

      {state?.error ? <p className="error">{state.error}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : service?.id ? "Save service" : "Create service"}
      </button>
    </form>
  );
}
