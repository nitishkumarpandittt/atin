"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/** Phone-only "Show all" for a list marked `data-collapsible` (see globals.css). */
export function CollapseToggle({ listId, total, visible = 12, label = "products" }: { listId: string; total: number; visible?: number; label?: string }) {
  const [expanded, setExpanded] = useState(false);
  if (total <= visible || expanded) return null;
  return (
    <div data-collapse-toggle className="mt-6 text-center">
      <button
        type="button"
        aria-controls={listId}
        aria-expanded={false}
        className="btn btn-blue w-full"
        onClick={() => {
          document.getElementById(listId)?.setAttribute("data-expanded", "");
          setExpanded(true);
        }}
      >
        Show all {total} {label} <ChevronDown aria-hidden className="size-4" />
      </button>
    </div>
  );
}
