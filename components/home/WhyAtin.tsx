import { FileText, Headset, LayoutGrid, PackageCheck } from "lucide-react";
import { SectionHeading } from "@/components/primitives/SectionHeading";

const features = [
  { icon: LayoutGrid, title: "Wide, organised range", text: "Tablets, syrups, softgels, injectables, topicals, dental, derma and drops in one catalogue." },
  { icon: PackageCheck, title: "Clear pack details", text: "Every listing states composition and pack size, so orders are placed with confidence." },
  { icon: Headset, title: "Responsive trade support", text: "A direct line for enquiries, availability questions and callbacks." },
  { icon: FileText, title: "Documentation on request", text: "Licences and product documents are shared with verified trade partners." },
];

export function WhyAtin({ totalProducts, samples }: { totalProducts: number; samples: { name: string; meta: string }[] }) {
  return (
    <section aria-labelledby="why-title" className="relative py-20 md:py-28">
      <div className="container-site grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
        <div className="relative">
          <div className="absolute -left-[50vw] -top-10 bottom-[-2.5rem] right-10 rounded-r-[2.5rem] bg-surface" aria-hidden />
          <div className="relative py-4 lg:pr-16">
            <SectionHeading id="why-title" eyebrow="Why Atin HealthCare" title="Sourcing made simple" />
            <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, text }, i) => (
                <li key={title} data-reveal style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}>
                  <span className={`grid size-12 place-items-center rounded-xl ring-1 ${i % 2 ? "bg-leaf-100 text-green ring-leaf/20" : "bg-sky-100 text-brand ring-sky/20"}`}>
                    <Icon aria-hidden className="size-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Overlapping catalogue card (Pavilion offset image panel) */}
        <div className="relative lg:-ml-24" data-reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand to-navy p-8 text-white shadow-lift md:p-10">
            <div className="hex-pattern absolute inset-0" aria-hidden />
            <svg aria-hidden viewBox="0 0 120 120" className="absolute -right-10 -top-10 size-52 text-white/10">
              <path d="M20 95 A50 50 0 1 1 100 92" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
            </svg>
            <p className="eyebrow text-sky-100">Trade catalogue</p>
            <p className="mt-4 font-display text-6xl font-extrabold">{totalProducts}</p>
            <p className="mt-1 text-white/80">products, searchable by brand, composition and pack</p>
            <div className="mt-8 space-y-3">
              {samples.map(({ name, meta }) => (
                <div key={name} className="flex items-center justify-between gap-4 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                  <span>
                    <span className="block text-sm font-semibold">{name}</span>
                    <span className="block text-xs text-white/65">{meta}</span>
                  </span>
                  <span className="size-2.5 shrink-0 rounded-full bg-leaf" aria-hidden />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
