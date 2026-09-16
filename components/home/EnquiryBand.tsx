import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { site, telHref } from "@/lib/site/config";
import type { Photo } from "@/lib/site/photos";
import { RequestCallButton } from "@/components/site/RequestCallButton";

export function EnquiryBand({ photo }: { photo: Photo }) {
  return (
    <section aria-labelledby="enquiry-title" className="relative mt-10 bg-navy-950">
      {/* White sweep into the footer colour (Remedial curved footer) */}
      <svg aria-hidden viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-16 w-full fill-white md:h-28">
        <path d="M0 0 H1440 V0 C 1000 0, 620 30, 0 120 Z" />
      </svg>
      <div className="container-site relative pt-16 md:pt-28 lg:pt-36">
        <div className="relative isolate overflow-hidden rounded-3xl bg-brand px-5 py-10 text-center shadow-lift sm:px-8 sm:py-12 md:rounded-[2rem] md:px-16 md:py-16" data-reveal>
          <Image src={photo.src} alt="" fill sizes="(min-width: 1216px) 1152px, 100vw" className="-z-20 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-brand/95 via-brand/85 to-brand/95" />
          <div className="hex-pattern absolute inset-0" aria-hidden />
          <div className="absolute -left-16 -top-24 size-72 rounded-full border-[14px] border-white/10" aria-hidden />
          <div className="absolute -bottom-28 -right-10 size-80 rounded-full border-[14px] border-leaf/25" aria-hidden />
          <h2 id="enquiry-title" className="relative text-[1.75rem] font-extrabold !text-white sm:text-3xl md:text-4xl">
            Have a trade enquiry?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/85">
            Tell us which products you are looking for and our team will get back to you with availability and details.
          </p>
          <div className="btn-row relative mx-auto mt-8 max-w-sm sm:max-w-none sm:justify-center">
            <Link href="/contact" className="btn btn-green">
              Send an enquiry <ArrowRight aria-hidden className="size-4" />
            </Link>
            {site.phone ? (
              <a href={telHref(site.phone)} className="btn btn-white">
                <Phone aria-hidden className="size-4" /> {site.phone}
              </a>
            ) : (
              <RequestCallButton className="btn btn-outline-light" />
            )}
          </div>
          <p className="relative mt-6 text-xs text-white/65">For trade enquiries only. We do not provide medical advice.</p>
        </div>
      </div>
    </section>
  );
}
