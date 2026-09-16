type BaseProps = {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
};

const control =
  "w-full rounded-xl border bg-white px-4 text-base text-ink sm:text-[0.95rem] placeholder:text-muted/70 transition focus:outline-none focus:ring-4 focus:ring-sky-100 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-100";

function Wrapper({ id, label, error, required, hint, className = "", children }: BaseProps & { children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy">
        {label}
        {required ? <span className="text-red-600"> *</span> : <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export function TextField({
  id,
  label,
  error,
  required,
  hint,
  className,
  ...input
}: BaseProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id">) {
  return (
    <Wrapper id={id} label={label} error={error} required={required} hint={hint} className={className}>
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${control} h-12 border-line focus:border-brand`}
        {...input}
      />
    </Wrapper>
  );
}

export function SelectField({
  id,
  label,
  error,
  required,
  hint,
  className,
  options,
  placeholder,
  ...select
}: BaseProps & { options: readonly string[]; placeholder?: string } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id">) {
  return (
    <Wrapper id={id} label={label} error={error} required={required} hint={hint} className={className}>
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${control} h-12 border-line focus:border-brand`}
        {...select}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

export function TextAreaField({
  id,
  label,
  error,
  required,
  hint,
  className,
  ...area
}: BaseProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id">) {
  return (
    <Wrapper id={id} label={label} error={error} required={required} hint={hint} className={className}>
      <textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${control} min-h-32 border-line py-3 focus:border-brand`}
        {...area}
      />
    </Wrapper>
  );
}

/** Hidden anti-spam fields: a honeypot and the time the form was rendered. */
export function SpamGuards({ startedAt, idPrefix }: { startedAt: number; idPrefix: string }) {
  return (
    <>
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${idPrefix}-hp`}>Leave this field empty</label>
        <input id={`${idPrefix}-hp`} name="leave_this_blank" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input type="hidden" name="started_at" value={startedAt} />
    </>
  );
}
