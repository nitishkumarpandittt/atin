import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Photo } from "@/lib/site/photos";

type Crumb = { label: string; href?: string };

type Props = {
  title: string;
  eyebrow?: string;
  intro?: React.ReactNode;
  photo?: Photo;
  crumbs?: Crumb[];
  children?: React.ReactNode;
  /** Extra space under the hero for content that overlaps it. */
  overlap?: boolean;
};

/** Inner-page banner: photo under a brand-blue wash, hex pattern, curved bottom edge. */
export function PageHero({ title, eyebrow, intro, photo, crumbs = [], children, overlap = false }: Props) {
  return (
    <section className={`relative isolate overflow-hidden bg-navy text-white ${overlap ? "pb-32 md:pb-36" : "pb-20 md:pb-28"}`}>
      {photo && (
        <Image
          src={photo.src}
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="-z-20 object-cover"
          style={{ objectPosition: photo.position ?? "center" }}
        />
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-brand/90 to-brand/55" />
      <div aria-hidden className="hex-pattern absolute inset-0 -z-10" />
      <div aria-hidden className="absolute -right-32 -top-32 -z-10 size-[20rem] rounded-full border-[14px] border-white/10 md:-right-24 md:-top-24 md:size-[26rem] md:border-[16px]" />

      <div className="container-site relative pt-28 md:pt-36 lg:pt-40">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/75">
              <li>
                <Link href="/" className="inline-block py-2 hover:text-white">
                  Home
                </Link>
              </li>
              {crumbs.map((c, i) => (
                <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                  <ChevronRight aria-hidden className="size-3.5" />
                  {c.href && i < crumbs.length - 1 ? (
                    <Link href={c.href} className="inline-block py-2 hover:text-white">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-white">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow text-sky-100">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl break-words text-[2.1rem] font-extrabold leading-[1.12] !text-white sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">{title}</h1>
        <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-leaf md:mt-6" />
        {intro && <div className="mt-5 max-w-2xl md:mt-6 text-base leading-relaxed text-white/85 md:text-lg">{intro}</div>}
        {children}
      </div>

      <svg aria-hidden viewBox="0 0 1440 90" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[-1px] h-12 w-full fill-white md:h-20">
        <path d="M0 90 H1440 V60 C 1040 -10, 520 10, 0 80 Z" />
      </svg>
    </section>
  );
}
