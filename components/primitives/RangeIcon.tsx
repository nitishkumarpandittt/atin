import { FlaskConical, Leaf, Milk, Pill, Pipette, Sparkles, Syringe, Tablets, Toothbrush, Bandage, Package, type LucideProps } from "lucide-react";

const ICONS = {
  pill: Tablets,
  bottle: FlaskConical,
  softgel: Pill,
  syringe: Syringe,
  leaf: Leaf,
  tooth: Toothbrush,
  tube: Bandage,
  jar: Milk,
  sparkles: Sparkles,
  droplet: Pipette,
} as const;

export function RangeIcon({ icon, ...props }: { icon: string } & LucideProps) {
  const Icon = ICONS[icon as keyof typeof ICONS] ?? Package;
  return <Icon aria-hidden strokeWidth={1.75} {...props} />;
}
