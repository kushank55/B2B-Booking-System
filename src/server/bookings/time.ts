const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function isValidTime(time: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function partsInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
    weekday: get("weekday"),
  };
}

// Wall-clock time in an IANA zone → UTC instant. Appointments are stored in UTC.
export function zonedLocalToUtc(date: string, time: string, timeZone: string) {
  const wanted = Date.UTC(
    Number(date.slice(0, 4)),
    Number(date.slice(5, 7)) - 1,
    Number(date.slice(8, 10)),
    Number(time.slice(0, 2)),
    Number(time.slice(3, 5)),
    0,
  );

  let utc = new Date(`${date}T${time}:00.000Z`);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const local = partsInZone(utc, timeZone);
    const asLocal = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second,
    );
    const diff = wanted - asLocal;
    utc = new Date(utc.getTime() + diff);
    if (diff === 0) {
      break;
    }
  }

  return utc;
}

export function dayOfWeekInZone(date: string, timeZone: string) {
  const noon = zonedLocalToUtc(date, "12:00", timeZone);
  const weekday = partsInZone(noon, timeZone).weekday;
  const index = WEEKDAYS.indexOf(weekday as (typeof WEEKDAYS)[number]);
  return index === -1 ? noon.getUTCDay() : index;
}

export function formatTimeInZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function dateInZone(date: Date, timeZone: string) {
  const local = partsInZone(date, timeZone);
  return `${String(local.year).padStart(4, "0")}-${String(local.month).padStart(2, "0")}-${String(local.day).padStart(2, "0")}`;
}

export function todayInZone(timeZone: string) {
  return dateInZone(new Date(), timeZone);
}

export function formatDateTimeInZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}
