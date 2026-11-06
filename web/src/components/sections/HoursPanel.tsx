"use client";

import { weeklyRows, torontoNow } from "@/lib/hours";
import { useOpenStatus } from "../useOpenStatus";
import type { SiteSettings } from "@/lib/types";
import { useEffect, useState } from "react";

/** Hours list with today highlighted and a live open/closed dot (Toronto time). */
export function HoursPanel({ settings }: { settings: SiteSettings }) {
  const status = useOpenStatus(settings);
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(torontoNow().dow);
  }, []);
  const rows = weeklyRows(settings);
  return (
    <div className="panel">
      <div className="status" role="status">
        <span className={`dot${status ? (status.open ? "" : " closed") : " unknown"}`} aria-hidden="true" />
        <span style={{ minHeight: 22 }}>{status ? status.text : "Checking hours"}</span>
      </div>
      <div>
        {rows.map((r) => (
          <div key={r.dow} className={`hrow${today === r.dow ? " today" : ""}`} aria-current={today === r.dow ? "date" : undefined}>
            <span>{r.day}</span>
            <span>{r.time}</span>
          </div>
        ))}
      </div>
      {settings.holidays.length > 0 && <p className="note" style={{ marginTop: 16 }}>Holiday closures are marked in the pickup times.</p>}
    </div>
  );
}
