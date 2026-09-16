"use client";

import Image from "next/image";
import { useState } from "react";

type Img = { src: string; alt: string; width: number; height: number };

export function ProductGallery({ images, fallbackAlt }: { images: Img[]; fallbackAlt: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface sm:rounded-3xl lg:aspect-auto lg:min-h-[26rem] lg:flex-1">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt || fallbackAlt}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-contain p-4"
          loading="eager"
        />
      </div>
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Product images">
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                className={`relative block size-16 overflow-hidden rounded-xl bg-surface ring-2 transition sm:size-20 ${i === active ? "ring-brand" : "ring-transparent hover:ring-line"}`}
              >
                <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
