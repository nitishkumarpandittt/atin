"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { deleteProductImage, makeMainImage, updateImageAlt, uploadProductImage } from "@/lib/admin/actions/products";
import type { ActionState } from "@/lib/admin/action-utils";

type Img = { id: number; src: string; alt: string; isVisualAid: boolean };

type Job = { name: string; status: "uploading" | "done" | "error"; message?: string };

const idle: ActionState = { status: "idle" };

export function ImageManager({ productId, images, maxMb }: { productId: number; images: Img[]; maxMb: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState<ActionState>(idle);
  const [, startTransition] = useTransition();

  // One request per file keeps each upload under the server action body limit.
  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.size > 0);
    if (!list.length) return;
    setJobs(list.map((f) => ({ name: f.name, status: "uploading" })));
    for (const [i, file] of list.entries()) {
      let result: ActionState;
      if (file.size > maxMb * 1024 * 1024) {
        result = { status: "error", message: `Larger than ${maxMb} MB.` };
      } else {
        const fd = new FormData();
        fd.set("productId", String(productId));
        fd.set("file", file);
        try {
          result = await uploadProductImage(idle, fd);
        } catch {
          result = { status: "error", message: "Upload failed. Check the file size and try again." };
        }
      }
      setJobs((js) => js.map((j, k) => (k === i ? { ...j, status: result.status === "success" ? "done" : "error", message: result.status === "error" ? result.message : undefined } : j)));
    }
    startTransition(() => router.refresh());
  };

  const run = async (imageId: number, action: typeof makeMainImage, extra: Record<string, string> = {}) => {
    setBusy(imageId);
    const fd = new FormData();
    fd.set("imageId", String(imageId));
    for (const [k, v] of Object.entries(extra)) fd.set(k, v);
    const res = await action(idle, fd);
    setMessage(res);
    setBusy(null);
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed p-5 text-center transition ${dragging ? "border-blue-500 bg-blue-50" : "border-line bg-slate-50"}`}
      >
        <ImagePlus aria-hidden className="mx-auto size-8 text-muted" />
        <p className="mt-2 text-sm font-medium text-ink">Drag images here or</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="admin-btn admin-btn-secondary mt-2">
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) upload(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="mt-2 text-xs text-muted">JPEG, PNG, WebP or AVIF, up to {maxMb} MB each. Resized and converted to WebP.</p>
      </div>

      {jobs.length > 0 && (
        <ul className="space-y-1 text-sm" aria-live="polite">
          {jobs.map((j, i) => (
            <li key={`${j.name}-${i}`} className="flex items-center gap-2">
              {j.status === "uploading" ? <Loader2 aria-hidden className="size-4 animate-spin text-muted" /> : null}
              <span className="truncate">{j.name}</span>
              <span className={j.status === "error" ? "text-red-700" : j.status === "done" ? "text-emerald-700" : "text-muted"}>
                {j.status === "uploading" ? "Uploading…" : j.status === "done" ? "Uploaded" : j.message}
              </span>
            </li>
          ))}
        </ul>
      )}

      {message.status === "error" && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
          {message.message}
        </p>
      )}

      {images.length === 0 ? (
        <p className="text-sm text-muted">No images yet. The website shows the range icon until one is added.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {images.map((img, i) => (
            <li key={img.id} className="rounded-xl bg-white p-3 ring-1 ring-line">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 640px) 300px, 100vw" className="object-contain" />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">Main image</span>}
                {img.isVisualAid && (
                  <span
                    title="Physician-facing visual aid: hidden on the website until SHOW_VISUAL_AIDS is on."
                    className="absolute bottom-2 left-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/25"
                  >
                    Visual aid · hidden on site
                  </span>
                )}
              </div>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(img.id, updateImageAlt, { alt: String(new FormData(e.currentTarget).get("alt") ?? "") });
                }}
              >
                <label htmlFor={`alt-${img.id}`} className="sr-only">
                  Alt text
                </label>
                <input id={`alt-${img.id}`} name="alt" defaultValue={img.alt} placeholder="Describe the image" className="admin-input min-w-0 flex-1" />
                <button type="submit" disabled={busy === img.id} className="admin-btn admin-btn-secondary">
                  Save
                </button>
              </form>
              <div className="mt-2 flex flex-wrap gap-2">
                {i > 0 && (
                  <button type="button" disabled={busy === img.id} onClick={() => run(img.id, makeMainImage)} className="admin-btn admin-btn-ghost">
                    <Star aria-hidden className="size-4" /> Make main
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy === img.id}
                  onClick={() => {
                    if (window.confirm("Delete this image?")) run(img.id, deleteProductImage);
                  }}
                  className="admin-btn admin-btn-danger ml-auto"
                >
                  {busy === img.id ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Trash2 aria-hidden className="size-4" />} Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
