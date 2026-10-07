"use client";

import { useEffect, useId, useRef } from "react";
import { Loader2, TriangleAlert, CircleHelp } from "lucide-react";

export type ConfirmOptions = {
  title: string;
  message?: React.ReactNode;
  /** Label of the confirming button, e.g. "Delete product". */
  confirmLabel?: string;
  /** "danger" for destructive actions (red button and warning icon). */
  tone?: "danger" | "primary";
};

type Props = ConfirmOptions & {
  open: boolean;
  pending?: boolean;
  /** Shown inside the dialog when the action failed, so it can be retried or cancelled. */
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Confirmation dialog for admin actions, replacing the browser's confirm() popup. Built on the native
 * modal <dialog>: focus is trapped, the page behind is inert, Escape cancels. Focus starts on Cancel so
 * an accidental Enter never confirms a destructive action.
 */
export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", tone = "danger", pending = false, error, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const danger = tone === "danger";
  const Icon = danger ? TriangleAlert : CircleHelp;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={message ? messageId : undefined}
      // Escape: keep the dialog in sync with React state (and never close mid-request).
      onCancel={(e) => {
        e.preventDefault();
        if (!pending) onCancel();
      }}
      // Clicking the dimmed backdrop (the dialog element itself, outside the panel) cancels.
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
      className="admin-dialog m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl bg-white p-0 text-left text-ink shadow-2xl ring-1 ring-black/5 backdrop:bg-slate-950/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className={`grid size-11 shrink-0 place-items-center rounded-full ${danger ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
            <Icon aria-hidden className="size-5" />
          </span>
          <div className="min-w-0 pt-1">
            <h2 id={titleId} className="text-base font-semibold text-ink">
              {title}
            </h2>
            {message && (
              <div id={messageId} className="mt-1.5 text-sm leading-relaxed text-muted">
                {message}
              </div>
            )}
            {error && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 rounded-b-2xl border-t border-line bg-slate-50 px-5 py-3.5 sm:flex-row sm:justify-end sm:px-6">
        <button ref={cancelRef} type="button" onClick={onCancel} disabled={pending} className="admin-btn admin-btn-secondary">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className={`admin-btn text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
