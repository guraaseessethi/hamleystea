"use client";

import { useBag } from "../bag/BagProvider";
import { CheckIcon } from "../Icons";

export function Toast() {
  const { toast } = useBag();
  return (
    <div className={`toast${toast ? " show" : ""}`} role="status" aria-live="polite">
      <CheckIcon size={16} className="" />
      {toast || " "}
    </div>
  );
}
