import { DAY_KEYS, type SiteSettings } from "./types";

export const TZ = "America/Toronto";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface TorontoNow {
  /** YYYY-MM-DD in Toronto */
  date: string;
  dow: number;
  /** minutes since local midnight */
  minutes: number;
}

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function torontoParts(at: Date) {
  const p: Record<string, number> = {};
  for (const part of partsFormatter.formatToParts(at)) {
    if (part.type !== "literal") p[part.type] = Number(part.value);
  }
  return p;
}

export function torontoNow(at: Date = new Date()): TorontoNow {
  const p = torontoParts(at);
  const date = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
  return { date, dow: dowOf(date), minutes: p.hour * 60 + p.minute };
}

export function dowOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

export function parseMinutes(hhmm: string | undefined): number | null {
  if (!hhmm) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const min = minutes % 60;
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return min === 0 ? `${h12} ${suffix}` : `${h12}:${String(min).padStart(2, "0")} ${suffix}`;
}

export function hoursFor(settings: SiteSettings, dow: number): { open: number; close: number } | null {
  const entry = settings.hours.find((h) => h.day === DAY_KEYS[dow]);
  if (!entry || entry.closed) return null;
  const open = parseMinutes(entry.open);
  const close = parseMinutes(entry.close);
  if (open === null || close === null || close <= open) return null;
  return { open, close };
}

export function isHoliday(settings: SiteSettings, date: string): boolean {
  return settings.holidays.includes(date);
}

/** Open hours for a calendar date, or null if closed (weekly or holiday). */
export function hoursOnDate(settings: SiteSettings, date: string) {
  if (isHoliday(settings, date)) return null;
  return hoursFor(settings, dowOf(date));
}

export function dayLabel(date: string, today: string): string {
  if (date === today) return "Today";
  if (date === addDays(today, 1)) return "Tomorrow";
  const [, m, d] = date.split("-").map(Number);
  return `${DAY_SHORT[dowOf(date)]} ${MONTH_SHORT[m - 1]} ${d}`;
}

export function longDayLabel(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${DAY_NAMES[dowOf(date)]}, ${MONTH_SHORT[m - 1]} ${d}`;
}

export function getStatus(settings: SiteSettings, now: TorontoNow = torontoNow()) {
  const today = hoursOnDate(settings, now.date);
  if (today && now.minutes >= today.open && now.minutes < today.close) {
    return { open: true, text: `Open now until ${formatClock(today.close)}` };
  }
  for (let d = 0; d < 15; d++) {
    const date = addDays(now.date, d);
    const h = hoursOnDate(settings, date);
    if (!h) continue;
    if (d === 0 && now.minutes >= h.close) continue;
    const when = d === 0 ? "today" : d === 1 ? "tomorrow" : DAY_NAMES[dowOf(date)];
    return { open: false, text: `Closed now, opens ${when} at ${formatClock(h.open)}` };
  }
  return { open: false, text: "Closed for now" };
}

/** Weekly hours, Monday first, for the Visit panel. */
export function weeklyRows(settings: SiteSettings) {
  return [1, 2, 3, 4, 5, 6, 0].map((dow) => {
    const h = hoursFor(settings, dow);
    return { dow, day: DAY_NAMES[dow], time: h ? `${formatClock(h.open)} to ${formatClock(h.close)}` : "Closed" };
  });
}

/** One-line summary used before the live status is known, e.g. "Mon to Fri 9 am to 6 pm". */
export function hoursSummary(settings: SiteSettings): string {
  const rows = weeklyRows(settings);
  const groups: { from: string; to: string; time: string }[] = [];
  for (const r of rows) {
    const last = groups[groups.length - 1];
    if (last && last.time === r.time) last.to = r.day;
    else groups.push({ from: r.day, to: r.day, time: r.time });
  }
  return groups
    .filter((g) => g.time !== "Closed")
    .map((g) => `${g.from === g.to ? g.from.slice(0, 3) : `${g.from.slice(0, 3)} to ${g.to.slice(0, 3)}`} ${g.time}`)
    .join(", ");
}

export interface PickupSlotTime {
  minutes: number;
  label: string;
}

/** Hourly pickup slots for a date. Today only from `leadMinutes` from now. */
export function getPickupTimes(
  settings: SiteSettings,
  date: string,
  now: TorontoNow = torontoNow(),
  leadMinutes = 60,
): PickupSlotTime[] {
  const h = hoursOnDate(settings, date);
  if (!h) return [];
  const out: PickupSlotTime[] = [];
  for (let t = h.open; t < h.close; t += 60) {
    if (date === now.date && t < now.minutes + leadMinutes) continue;
    out.push({ minutes: t, label: formatClock(t) });
  }
  return out;
}

export interface PickupDay {
  date: string;
  label: string;
}

/** The next open days (default 4), skipping closed days, holidays, and today when it is under 1.5h to close. */
export function getPickupDays(
  settings: SiteSettings,
  now: TorontoNow = torontoNow(),
  count = 4,
  leadMinutes = 60,
): PickupDay[] {
  const out: PickupDay[] = [];
  for (let d = 0; d < 30 && out.length < count; d++) {
    const date = addDays(now.date, d);
    const h = hoursOnDate(settings, date);
    if (!h) continue;
    if (d === 0 && now.minutes > h.close - 90) continue;
    if (getPickupTimes(settings, date, now, leadMinutes).length === 0) continue;
    out.push({ date, label: dayLabel(date, now.date) });
  }
  return out;
}

/** Server-side check that a requested slot is really open. */
export function isValidSlot(settings: SiteSettings, date: string, minutes: number, at: Date = new Date()): boolean {
  const now = torontoNow(at);
  // a few minutes of grace for slow phones
  const days = getPickupDays(settings, now, 4, 45);
  if (!days.some((d) => d.date === date)) return false;
  return getPickupTimes(settings, date, now, 45).some((t) => t.minutes === minutes);
}

function offsetMinutes(at: Date): number {
  const p = torontoParts(at);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return Math.round((asUtc - Math.floor(at.getTime() / 60000) * 60000) / 60000);
}

/** Toronto wall-clock date + minutes to a UTC ISO string. */
export function torontoToUtcISO(date: string, minutes: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, minutes);
  let t = guess - offsetMinutes(new Date(guess)) * 60000;
  t = guess - offsetMinutes(new Date(t)) * 60000;
  return new Date(t).toISOString();
}

export function formatPickup(date: string, minutes: number): string {
  return `${longDayLabel(date)} at ${formatClock(minutes)}`;
}
