"use client";

import { useActionState } from "react";
import { saveHours, type FormState } from "@/app/admin/actions";
import { WEEK_DAYS } from "@/server/bookings/availability";

type Rule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export function HoursForm({
  staffId,
  rules,
}: {
  staffId: string;
  rules: Rule[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveHours,
    undefined,
  );

  const byDay = new Map(rules.map((rule) => [rule.dayOfWeek, rule]));

  return (
    <form action={action} className="card">
      <input type="hidden" name="staffId" value={staffId} />

      {WEEK_DAYS.map((day) => {
        const rule = byDay.get(day.dayOfWeek);
        return (
          <div className="hours-row" key={day.dayOfWeek}>
            <label className="hours-day">
              <input
                type="checkbox"
                name={`open-${day.dayOfWeek}`}
                defaultChecked={Boolean(rule)}
              />
              {day.label}
            </label>
            <input
              type="time"
              name={`start-${day.dayOfWeek}`}
              defaultValue={rule?.startTime ?? "09:00"}
            />
            <input
              type="time"
              name={`end-${day.dayOfWeek}`}
              defaultValue={rule?.endTime ?? "17:00"}
            />
          </div>
        );
      })}

      {state?.error ? <p className="error">{state.error}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save hours"}
      </button>
    </form>
  );
}
