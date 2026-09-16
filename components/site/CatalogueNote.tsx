import Link from "next/link";
import { Info } from "lucide-react";

export function CatalogueNote({ className = "" }: { className?: string }) {
  return (
    <aside className={`flex gap-3 rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed text-muted ${className}`}>
      <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
      <p>
        Product information is provided for healthcare professionals and the pharma trade for reference only. It is not medical advice or
        a recommendation to use any product. Refer to the pack and approved prescribing information.{" "}
        <Link href="/disclaimer" className="font-semibold text-brand underline-offset-2 hover:underline">
          Read the disclaimer
        </Link>
      </p>
    </aside>
  );
}
