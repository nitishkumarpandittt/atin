"use client";

import { PhoneCall } from "lucide-react";

export function RequestCallButton({ className = "btn btn-green", label = "Request a call", icon = true }: { className?: string; label?: string; icon?: boolean }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("atin:open-callback"))}>
      {icon && <PhoneCall aria-hidden className="size-4" />}
      {label}
    </button>
  );
}
