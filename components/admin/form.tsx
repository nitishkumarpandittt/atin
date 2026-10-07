"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/admin/action-utils";
import { ConfirmDialog, type ConfirmOptions } from "@/components/admin/ConfirmDialog";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

/**
 * Admin form wrapper: submits through a transition (so React 19 keeps field values after a
 * validation error), shows the result message and exposes field errors to children.
 */
export function AdminForm({
  action,
  children,
  className = "",
  resetOnSuccess = false,
  onSuccess,
}: {
  action: Action;
  children: (state: { errors: Record<string, string>; pending: boolean }) => React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as ActionState);
  const ref = useRef<HTMLFormElement>(null);
  const lastAt = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (state.status === "success" && state.at !== lastAt.current) {
      lastAt.current = state.at;
      if (resetOnSuccess) ref.current?.reset();
      onSuccess?.();
    }
  }, [state, resetOnSuccess, onSuccess]);

  return (
    <form
      ref={ref}
      noValidate
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      <FormMessage state={state} />
      {children({ errors: state.status === "error" ? (state.fieldErrors ?? {}) : {}, pending })}
    </form>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;
  const success = state.status === "success";
  return (
    <p
      role={success ? "status" : "alert"}
      className={`col-span-full mb-4 flex basis-full items-start gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${success ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
    >
      {success ? <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0" /> : <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />}
      {state.message}
    </p>
  );
}

type FieldProps = { name: string; label: string; error?: string; hint?: React.ReactNode; required?: boolean; className?: string };

function FieldWrap({ id, label, error, hint, required, className = "", children }: Omit<FieldProps, "name"> & { id: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const described = (id: string, error?: string, hint?: React.ReactNode) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export function TextField({ name, label, error, hint, required, className, ...rest }: FieldProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  const id = `f-${name}`;
  return (
    <FieldWrap id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <input id={id} name={name} className="admin-input" aria-invalid={error ? true : undefined} aria-describedby={described(id, error, hint)} {...rest} />
    </FieldWrap>
  );
}

export function TextArea({ name, label, error, hint, required, className, rows = 4, ...rest }: FieldProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  const id = `f-${name}`;
  return (
    <FieldWrap id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <textarea id={id} name={name} rows={rows} className="admin-input leading-relaxed" aria-invalid={error ? true : undefined} aria-describedby={described(id, error, hint)} {...rest} />
    </FieldWrap>
  );
}

export function SelectField({
  name,
  label,
  error,
  hint,
  required,
  className,
  options,
  ...rest
}: FieldProps & { options: { value: string; label: string }[] } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name">) {
  const id = `f-${name}`;
  return (
    <FieldWrap id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <select id={id} name={name} className="admin-input" aria-invalid={error ? true : undefined} aria-describedby={described(id, error, hint)} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  );
}

export function Checkbox({ name, label, hint, defaultChecked, error, ...rest }: { name: string; label: string; hint?: string; defaultChecked?: boolean; error?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 py-1 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
        <input id={id} name={name} type="checkbox" defaultChecked={defaultChecked} className="mt-0.5 size-4 shrink-0 accent-blue-600" {...rest} />
        <span>
          <span className="block text-sm font-medium text-ink">{label}</span>
          {hint && <span className="block text-xs text-muted">{hint}</span>}
        </span>
      </label>
      {error && <p className="ml-6 mt-0.5 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}

export function SubmitButton({ pending, children, variant = "primary", className = "" }: { pending: boolean; children: React.ReactNode; variant?: "primary" | "secondary" | "danger"; className?: string }) {
  return (
    <button type="submit" disabled={pending} className={`admin-btn admin-btn-${variant} ${className}`}>
      {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

/**
 * A one-button form for row actions (delete, mark handled…). With `confirm`, the action only runs after
 * the in-app confirmation dialog; the dialog stays open (with a spinner) until it succeeds, and shows the
 * error if it fails. A plain string is used as the dialog's message.
 */
export function ActionButton({
  action,
  fields,
  children,
  confirm,
  variant = "secondary",
  className = "",
  title,
}: {
  action: Action;
  fields: Record<string, string | number>;
  children: React.ReactNode;
  confirm?: string | ConfirmOptions;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  title?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as ActionState);
  const options: ConfirmOptions | null = !confirm
    ? null
    : typeof confirm === "string"
      ? { title: "Are you sure?", message: confirm, confirmLabel: typeof children === "string" ? children : "Confirm", tone: variant === "danger" ? "danger" : "primary" }
      : { tone: variant === "danger" ? "danger" : "primary", ...confirm };
  const [asking, setAsking] = useState(false);
  const [openedAt, setOpenedAt] = useState(0);
  const [pendingData, setPendingData] = useState<FormData | null>(null);
  // Close the dialog once the confirmed action succeeds (derived during render, not in an effect).
  const [seenAt, setSeenAt] = useState(state.at);
  if (state.at !== seenAt) {
    setSeenAt(state.at);
    if (state.status === "success") setAsking(false);
  }
  const dialogError = asking && state.status === "error" && (state.at ?? 0) >= openedAt ? state.message : undefined;

  return (
    <form
      className="inline"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (options) {
          setPendingData(fd);
          setOpenedAt(Date.now());
          setAsking(true);
          return;
        }
        startTransition(() => formAction(fd));
      }}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" disabled={pending} title={state.status === "error" ? state.message : title} className={`admin-btn admin-btn-${variant} ${className}`}>
        {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
        {children}
      </button>
      {state.status === "error" && !asking && (
        <span role="alert" className="ml-2 text-xs font-medium text-red-700">
          {state.message}
        </span>
      )}
      {options && (
        <ConfirmDialog
          {...options}
          open={asking}
          pending={pending}
          error={dialogError}
          onCancel={() => setAsking(false)}
          onConfirm={() => pendingData && startTransition(() => formAction(pendingData))}
        />
      )}
    </form>
  );
}
