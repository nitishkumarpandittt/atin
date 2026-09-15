import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { site, telHref } from "@/lib/site/config";

export function EnquiryBand() {
  return (
    <section aria-labelledby="enquiry-title" className="relative mt-10 bg-navy-950">
      {/* White sweep into the footer colour (Remedial curved footer) */}
      <svg aria-hidden viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-16 w-full fill-white md:h-28">
        <path d="M0 0 H1440 V0 C 1000 0, 620 30, 0 120 Z" />
      </svg>
      <div className="container-site relative pt-24 md:pt-36">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand via-brand-600 to-brand px-6 py-12 text-center shadow-lift md:px-16 md:py-16" data-reveal>
          <div className="hex-pattern absolute inset-0" aria-hidden />
          <div className="absolute -left-16 -top-24 size-72 rounded-full border-[14px] border-white/10" aria-hidden />
          <div className="absolute -bottom-28 -right-10 size-80 rounded-full border-[14px] border-leaf/25" aria-hidden />
          <h2 id="enquiry-title" className="relative text-3xl font-extrabold !text-white md:text-4xl">
            Have a trade enquiry?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/85">
            Tell us which products you are looking for and our team will get back to you with availability and details.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn btn-green">
              Send an enquiry <ArrowRight aria-hidden className="size-4" />
            </Link>
            {site.phone ? (
              <a href={telHref(site.phone)} className="btn btn-white">
                <Phone aria-hidden className="size-4" /> {site.phone}
              </a>
            ) : (
              <Link href="/products" className="btn btn-outline-light">
                Browse products
              </Link>
            )}
          </div>
          <p className="relative mt-6 text-xs text-white/65">For trade enquiries only. We do not provide medical advice.</p>
        </div>
      </div>
    </section>
  );
}
