// Licensed stock photography (Unsplash License), hotlinked from the Unsplash CDN.
// To replace a slot with a licensed or real Atin photo, drop the file into public/photos/ named after
// the slot (e.g. public/photos/chemist-counter.jpg); it takes over without a code change.
import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

export type Photo = {
  src: string;
  alt: string;
  /** CSS object-position for cropping. */
  position?: string;
  credit?: string;
};

type Slot =
  | "hero"
  | "warehouse"
  | "team"
  | "lab-quality"
  | "chemist-counter"
  | "hospital-corridor"
  | "contact"
  | "blog-1"
  | "blog-2"
  | "blog-3"
  | "tablets-capsules"
  | "syrups-suspensions"
  | "softgel-capsules"
  | "injectables"
  | "ayurvedic"
  | "dental"
  | "topicals"
  | "nutrition"
  | "derma-cosmetics"
  | "eye-ear-nasal";

const unsplash = (id: string, alt: string, extra: Partial<Photo> = {}): Photo => ({
  src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2000&q=80`,
  alt,
  ...extra,
});

const PHOTOS: Record<Slot, Photo> = {
  // copy-check: photographer credit (Unsplash account name), not marketing copy
  "hero": unsplash("photo-1580281658626-ee379f3cce93", "Pharmacist in a white coat holding a medicine box in front of dispensary shelves", { credit: "National Cancer Institute", position: "70% 20%" }),
  "warehouse": unsplash("photo-1587293852726-70cdb56c2866", "Cardboard boxes stacked on warehouse racks", { credit: "CHUTTERSNAP" }),
  "team": unsplash("photo-1577962917302-cd874c4e31d2", "Business team in a meeting around an office table", { credit: "Smartworks Coworking" }),
  "lab-quality": unsplash("photo-1532187643603-ba119ca4109e", "Scientist pouring liquid into laboratory glassware", { credit: "Louis Reed" }),
  "chemist-counter": unsplash("photo-1739289696449-cba3a5ef085d", "Two people looking at a medicine pack in a bright pharmacy aisle", { credit: "Ninthgrid", position: "60% center" }),
  "hospital-corridor": unsplash("photo-1777269749032-d8d458ae594d", "Empty hospital corridor with benches and doors", { credit: "Tasha Kostyuk" }),
  "contact": unsplash("photo-1626863905121-3b0c0ed7b94c", "Support team wearing headsets in a bright office", { credit: "Charanjeet Dhiman" }),
  // copy-check: photographer credit (Unsplash account name), not marketing copy
  "blog-1": unsplash("photo-1580281658223-9b93f18ae9ae", "Pharmacist checking stock at a pharmacy display case", { credit: "National Cancer Institute" }),
  "blog-2": unsplash("photo-1642055514517-7b52288890ec", "Storage room with shelves of neatly organised boxes", { credit: "Árpád Czapp" }),
  "blog-3": unsplash("photo-1471864190281-a93a3070b6de", "Assorted tablets and capsules in different colours", { credit: "freestocks" }),
  "tablets-capsules": unsplash("photo-1779923328024-eea5dd1a1e34", "Capsules beside a blister pack on a blue background", { credit: "Jorge Campos" }),
  "syrups-suspensions": unsplash("photo-1635166304271-04931640a450", "Bottle of liquid medicine on a table", { credit: "Towfiqu barbhuiya" }),
  "softgel-capsules": unsplash("photo-1565071783280-719b01b29912", "Close-up of golden softgel capsules", { credit: "Michele Blackwell" }),
  "injectables": unsplash("photo-1787338718257-acd30301069b", "Small glass vials with caps on a surface", { credit: "Navy Medicine" }),
  "ayurvedic": unsplash("photo-1492552085122-36706c238263", "Hands grinding herbs with a mortar and pestle", { credit: "Katherine Hanlon" }),
  "dental": unsplash("photo-1582672509455-d2001e78a3a2", "Toothbrush with toothpaste", { credit: "Joshua Hoehne" }),
  "topicals": unsplash("photo-1616750819574-7e38aa8046fa", "Plain white cream tube on a pink surface", { credit: "Birgith Roosipuu" }),
  "nutrition": unsplash("photo-1593095948071-474c5cc2989d", "Scoop filled with supplement powder", { credit: "HowToGym" }),
  "derma-cosmetics": unsplash("photo-1748543668676-ea8241cb3886", "Gel, cream and oil textures with leaves on a light background", { credit: "ibnu ihza" }),
  "eye-ear-nasal": unsplash("photo-1576426863848-c21f53c60b19", "White dropper bottle on a white surface", { credit: "Content Pixie" }),
};

const LOCAL_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

/** Public URL of a drop-in photo for the slot, or null when none has been added. */
function localPhoto(slot: string): string | null {
  for (const ext of LOCAL_EXTENSIONS) {
    if (existsSync(path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "photos", `${slot}.${ext}`))) return `/photos/${slot}.${ext}`;
  }
  return null;
}

export function photo(slot: string): Photo | undefined {
  const stock = PHOTOS[slot as Slot];
  if (!stock) return undefined;
  const local = localPhoto(slot);
  // A drop-in photo keeps the slot's alt text but not the stock crop position or credit.
  return local ? { src: local, alt: stock.alt } : stock;
}


/** Uploaded range image when set, otherwise the stock photo for that segment. */
export function rangePhoto(range: { slug: string; shortName: string; image?: string; imageAlt?: string }): Photo | undefined {
  if (range.image) return { src: range.image, alt: range.imageAlt || range.shortName };
  return photo(range.slug);
}
