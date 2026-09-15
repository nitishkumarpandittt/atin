type Props = {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  id?: string;
  as?: "h2" | "h3";
};

export function SectionHeading({ eyebrow, title, intro, align = "left", tone = "dark", id, as: Tag = "h2" }: Props) {
  const centered = align === "center";
  const light = tone === "light";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-xl"} data-reveal>
      {eyebrow && <p className={`eyebrow mb-3 ${light ? "text-sky-100" : "text-green"}`}>{eyebrow}</p>}
      <Tag id={id} className={`text-3xl font-extrabold leading-tight md:text-[2.5rem] md:leading-[1.15] ${light ? "!text-white" : ""}`}>
        {title}
      </Tag>
      <span aria-hidden className={`mt-5 block h-1 w-14 rounded-full bg-leaf ${centered ? "mx-auto" : ""}`} />
      {intro && <p className={`mt-5 text-base leading-relaxed md:text-lg ${light ? "text-white/80" : "text-muted"}`}>{intro}</p>}
    </div>
  );
}
