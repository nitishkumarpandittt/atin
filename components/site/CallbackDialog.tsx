"use client";

import { usePathname } from "next/navigation";
import { startTransition, useActionState, useCallback, useEffect, useRef, useState } from "react";
import { CircleCheck, Loader2, PhoneCall, X } from "lucide-react";
import { submitCallback } from "@/lib/enquiries/actions";
import type { FormState } from "@/lib/enquiries/schema";
import { SelectField, SpamGuards, TextField } from "@/components/site/FormField";

export const OPEN_CALLBACK_EVENT = "atin:open-callback";

/** Seconds before the popup opens by itself. */
const AUTO_OPEN_MS = 8000;
/** Pages where it opens on its own. Set to null to auto-open on every page. */
const AUTO_OPEN_PATHS: string[] | null = ["/"];
/**
 * Open on every visit. Set a number of days instead (e.g. 30) to stop nagging someone who has
 * already seen it; that remembers the dismissal in the browser.
 */
const QUIET_DAYS: number | false = false;
const QUIET_KEY = "atin-callback-dismissed-at";

const readQuiet = () => {
  if (QUIET_DAYS === false) return false;
  try {
    const at = Number(localStorage.getItem(QUIET_KEY));
    return Boolean(at) && Date.now() - at < QUIET_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return true; // storage blocked: never nag
  }
};
const writeQuiet = () => {
  if (QUIET_DAYS === false) return;
  try {
    localStorage.setItem(QUIET_KEY, String(Date.now()));
  } catch {}
};

export function CallbackDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [session, setSession] = useState(0);

  const open = useCallback(() => {
    setSession((s) => s + 1); // fresh form on every open
    if (!ref.current?.open) ref.current?.showModal();
  }, []);

  useEffect(() => {
    const onOpen = () => open();
    window.addEventListener(OPEN_CALLBACK_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CALLBACK_EVENT, onOpen);
  }, [open]);

  useEffect(() => {
    const allowed = AUTO_OPEN_PATHS === null ? pathname !== "/contact" && pathname !== "/disclaimer" : AUTO_OPEN_PATHS.includes(pathname);
    if (!allowed || readQuiet()) return;
    const t = setTimeout(() => {
      if (document.querySelector("dialog[open]")) return;
      writeQuiet();
      open();
    }, AUTO_OPEN_MS);
    return () => clearTimeout(t);
  }, [pathname, open]);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby="callback-title"
      onClose={writeQuiet}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
      className="m-auto w-[min(34rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-3xl bg-transparent p-0 backdrop:bg-navy-950/60 backdrop:backdrop-blur-sm"
    >
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-lift">
        <div className="relative bg-brand py-5 pl-6 pr-14 text-white sm:pl-8">
          <div aria-hidden className="hex-pattern absolute inset-0" />
          <div className="relative flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/15">
              <PhoneCall aria-hidden className="size-5" />
            </span>
            <div>
              <h2 id="callback-title" className="text-xl font-bold !text-white">
                Request a call back
              </h2>
              <p className="text-sm text-white/80">Leave your number and our trade team will call you.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/15 hover:text-white"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        {session > 0 && <CallbackForm key={session} onDone={close} />}
      </div>
    </dialog>
  );
}

function CallbackForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(submitCallback, { status: "idle" } as FormState);
  const [startedAt] = useState(() => Date.now());
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  if (state.status === "success") {
    return (
      <div role="status" className="px-6 py-10 text-center sm:px-8">
        <CircleCheck aria-hidden className="mx-auto size-12 text-green" />
        <p className="mt-3 font-display text-xl font-bold text-navy">Request received</p>
        <p className="mt-1 text-muted">{state.message}</p>
        <button type="button" onClick={onDone} className="btn btn-blue mt-6">
          Close
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="relative grid gap-4 px-6 py-6 sm:grid-cols-2 sm:px-8"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      <SpamGuards startedAt={startedAt} idPrefix="cb" />
      {state.status === "error" && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800 sm:col-span-2">
          {state.message}
        </p>
      )}
      <TextField id="cb-name" name="name" label="Name" autoComplete="name" required autoFocus error={errors.name} />
      <TextField id="cb-phone" name="phone" type="tel" inputMode="tel" label="Phone" autoComplete="tel" required error={errors.phone} />
      <TextField id="cb-org" name="organisation" label="Organisation" autoComplete="organization" error={errors.organisation} />
      <SelectField
        id="cb-time"
        name="preferredTime"
        label="Best time to call"
        options={["Any time", "Morning", "Afternoon", "Evening"]}
        required
        error={errors.preferredTime}
      />
      <p className="text-xs leading-relaxed text-muted sm:col-span-2">For trade enquiries only. We do not provide medical advice.</p>
      <button type="submit" disabled={pending} className="btn btn-green sm:col-span-2 disabled:opacity-70">
        {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
        {pending ? "Sending…" : "Request a call"}
      </button>
    </form>
  );
}
