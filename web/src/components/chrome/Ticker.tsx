"use client";

import { useBag } from "../bag/BagProvider";
import { hoursSummary } from "@/lib/hours";
import { useOpenStatus } from "../useOpenStatus";

/** Scrolling bar at the very top. A line of exactly {status} becomes the live open/closed text. */
export function Ticker() {
  const { settings } = useBag();
  const status = useOpenStatus(settings);
  const statusText = status?.text ?? hoursSummary(settings);
  const lines = settings.tickerLines.map((l) => (l.trim() === "{status}" ? statusText : l));
  const doubled = [...lines, ...lines];
  return (
    <div className="ticker" aria-label="Shop notes">
      <div className="track">
        {doubled.map((l, i) => (
          <span key={i} aria-hidden={i >= lines.length ? true : undefined}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
