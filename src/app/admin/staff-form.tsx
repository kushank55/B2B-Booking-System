"use client";

import { useActionState } from "react";
import { saveStaff, type FormState } from "@/app/admin/actions";

type StaffValues = {
  id?: string;
  name: string;
  email: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export function StaffForm({ staff }: { staff?: StaffValues }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveStaff,
    undefined,
  );

  return (
    <form action={action} className="card form-grid">
      {staff?.id ? <input type="hidden" name="id" value={staff.id} /> : null}

      <label htmlFor="name">Name</label>
      <input id="name" name="name" defaultValue={staff?.name ?? ""} required />

      <label htmlFor="email">Email (optional)</label>
      <input
        id="email"
        name="email"
        type="email"
        defaultValue={staff?.email ?? ""}
      />

      <label htmlFor="status">Status</label>
      <select id="status" name="status" defaultValue={staff?.status ?? "ACTIVE"}>
        <option value="ACTIVE">ACTIVE</option>
        <option value="INACTIVE">INACTIVE</option>
      </select>

      {state?.error ? <p className="error">{state.error}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : staff?.id ? "Save staff" : "Create staff"}
      </button>
    </form>
  );
}
