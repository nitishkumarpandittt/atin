"use client";

import { startTransition, useActionState, useState } from "react";
import { CircleCheck, Loader2, Send } from "lucide-react";
import { submitEnquiry } from "@/lib/enquiries/actions";
import { ROLES, type FormState } from "@/lib/enquiries/schema";
import { SelectField, SpamGuards, TextAreaField, TextField } from "@/components/site/FormField";

const initial: FormState = { status: "idle" };

export function EnquiryForm({ product }: { product?: string }) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initial);
  const [startedAt] = useState(() => Date.now());
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-2xl bg-leaf-100 p-8 text-center">
        <CircleCheck aria-hidden className="mx-auto size-12 text-green" />
        <p className="mt-4 font-display text-2xl font-bold text-navy">Enquiry received</p>
        <p className="mx-auto mt-2 max-w-md text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="relative grid gap-5 sm:grid-cols-2"
      // Submit through a transition so React 19 does not reset the fields when validation fails.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      <SpamGuards startedAt={startedAt} idPrefix="enq" />

      {state.status === "error" && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 sm:col-span-2">
          {state.message}
        </p>
      )}

      <TextField id="enq-name" name="name" label="Your name" autoComplete="name" required error={errors.name} />
      <TextField id="enq-org" name="organisation" label="Organisation / firm" autoComplete="organization" required error={errors.organisation} />
      <SelectField id="enq-role" name="role" label="You are a" options={ROLES} placeholder="Select one" required error={errors.role} />
      <TextField id="enq-city" name="city" label="City" autoComplete="address-level2" error={errors.city} />
      <TextField id="enq-phone" name="phone" type="tel" inputMode="tel" label="Phone" autoComplete="tel" required error={errors.phone} />
      <TextField id="enq-email" name="email" type="email" label="Email" autoComplete="email" error={errors.email} />
      <TextField
        id="enq-product"
        name="product"
        label="Product of interest"
        defaultValue={product}
        placeholder="Brand name or segment"
        className="sm:col-span-2"
        error={errors.product}
      />
      <TextAreaField
        id="enq-message"
        name="message"
        label="Message"
        required
        placeholder="Tell us what you need: products, quantities, location."
        className="sm:col-span-2"
        error={errors.message}
      />

      <div className="sm:col-span-2">
        <label className="flex cursor-pointer items-start gap-3 py-1 text-sm text-ink">
          <input
            type="checkbox"
            name="consent"
            className="mt-px size-6 shrink-0 accent-green"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "enq-consent-error" : undefined}
          />
          <span>I confirm this is a trade enquiry and agree to be contacted about it.</span>
        </label>
        {errors.consent && (
          <p id="enq-consent-error" className="mt-1.5 text-sm text-red-700">
            {errors.consent}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted">
          For trade enquiries only. We do not provide medical advice or respond to patient queries.
        </p>
        <button type="submit" disabled={pending} className="btn btn-green w-full shrink-0 disabled:opacity-70 sm:w-auto">
          {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Send aria-hidden className="size-4" />}
          {pending ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}
