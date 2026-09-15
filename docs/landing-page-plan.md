# Atin HealthCare — Landing Page & Site Plan

Status: plan, ready to build. Backend, admin, compliance and data rules follow the supplied
"pharma website" brief unchanged; this document fixes the **UI direction**, the **home page**, and
the places where Atin's real inputs differ from that brief.

---

## 1. What the inputs actually say

### Logo (`ATIN LOGO.jpeg`)
Blue "A" inside a sweeping circular arc, a green leaf crossing it, "HEALTHCARE PVT LTD" in green.
Colours sampled from the file:

| Token | Hex | Source | Use |
|---|---|---|---|
| `--brand-navy` | `#0A1F66` | darkest "A" shading | headings, footer ground, dark bands |
| `--brand-blue` | `#0054B4` | main "A"/"TIN" | hero panel, primary surfaces, links (7.1:1 on white) |
| `--brand-sky` | `#1E8FE1` | outer arc highlight | decorative only: arcs, pattern, icon tints |
| `--brand-green` | `#008424` | "HEALTHCARE PVT LTD" | primary buttons (white text 4.8:1), small accents |
| `--brand-leaf` | `#4CAA1C` | leaf | decorative only (never text): underline bars, dots |
| `--ink` | `#16203A` | — | body text |
| `--muted` | `#5B6784` | — | secondary text |
| `--surface` | `#F3F6FC` | — | alternating section ground (Pavilion's grey band, tinted blue) |

The fit with reference #1 is almost one-to-one: Remedial's **indigo panel → Atin blue**, Remedial's
**green CTA → Atin green**. That's why design #1 stays the primary direction.

Logo prep: the JPEG has an off-white background. Export `public/brand/atin-logo.png` (transparent),
`atin-logo-white.png` (all-white version for the blue hero/footer), and `atin-mark.svg`
(A + arc + leaf only) for favicon/app icons. Trace the mark to SVG so it's crisp at every size.

### Product sheet (`ATIN HEALTHCARE PVT LTD._segment wise list.xlsx`)
**Differs from the other agent's brief** — the importer must be written for this layout:

- Sheet1 only, title row "ATINE PRODUCT LIST", header row 7: `S.NO | BRAND NAME | COMPOSITION | PACKING`.
- **No MRP, GST, dosage-form or prescribing-specialities columns.** Those DB fields stay (nullable)
  and are filled in the admin later; `SHOW_MRP_PUBLIC` defaults off and nothing price-related renders.
- Section headings are **not merged cells**: a row with only one text cell (sometimes column B,
  sometimes column C, trailing colon/space). Detect "S.NO empty + exactly one text cell".
- Dosage form is inferred from brand suffix (`TAB.`, `CAP.`, `SYP.`, `INJ.`, `SOFTGEL`, `SACHET`,
  `EYE DROP`, `NASAL SPRAY`, `SOAP`, `OINT.`, `GEL`…) with the section as fallback; brand is stored
  without the suffix in title case (`ACLOAGE-P TAB.` → brand `Acloage-P`, form `Tablet`).
- Clean-ups: trim leading spaces (`' ATIPROB SACHET'`), collapse `\n` and double spaces in
  compositions, keep S.NO gaps (serials 144, 155, 157, 158 are missing — log, don't fail).
- **179 products in 10 segments** (S.NO runs to 184; 5 numbers are skipped) → `data/catalogue/ranges.json`:

| Slug | Short name | Source heading | Count |
|---|---|---|---|
| `tablets-capsules` | Tablets & Capsules | TABLETS: | 67 |
| `syrups-suspensions` | Syrups & Suspensions | SYRUP/PEDIATRIC SYRUP/DRY SYP/SUSP. | 29 |
| `softgel-capsules` | Softgel Capsules | SOFTGEL CAPSULES: | 10 |
| `injectables` | Injectables | INJECTABLES: | 11 |
| `ayurvedic` | Ayurvedic Range | AYURVEDIC PRODUCTS: | 14 |
| `dental` | Dental Range | DENTAL RANGE: | 6 |
| `topicals` | Gels, Ointments & Soaps | GEL/OINT./SOAP/DUSTING POWDER | 11 |
| `nutrition` | Sachets & Nutrition Powders | SACHET/PROTEIN POWDER/ENERGY DRINKS: | 5 |
| `derma-cosmetics` | Derma & Cosmetics | DERMA & COSMETICS: | 14 |
| `eye-ear-nasal` | Eye, Ear & Nasal Drops | EYE/EAR DROPS: | 12 |

(Counted from the sheet; `db:seed --dry-run` re-verifies.) Segments are dosage-form / category names, never
disease names — already compliant with the copy standard.

**Headline figures (facts only, computed from DB, not typed):** `179 products · 10 segments ·
N dosage forms` (N counted after dosage-form normalisation). No invented "years of experience", doctor counts or city counts until the client
supplies them.

**Compliance flags found in the sheet** (import as-is but set `isPublished = false`, list in the
dashboard "catalogue checks" for client review):
- `AYURATIN- (STONE CAP)` — composition "Herbal Stone Removing Cap." is a disease/cure claim.
- Any composition text carrying a purpose word ("ULCER GEL", "ANTI SEPTIC") — show composition
  only, strip the bracketed purpose from the public listing via a reviewed `publicComposition` override.
- Obvious typos to confirm with client, not silently fix: "Caffiene", "Mafenamic", "CHOLEIFEROL",
  "CARBOXYMETYLLCELLULOSE", "benzakonium", brand heading "ATINE".

---

## 2. UI direction — "Remedial structure, Pavilion restraint"

Take from **Remedial (primary)**:
- Big saturated brand panel as the hero with an **angled/curved bottom-right edge** and a subtle
  **hexagon (molecule) pattern** at ~6% opacity.
- Image/visual panel sitting to the right, cut by the same diagonal.
- Green pill CTAs, white nav on blue, clean sans-serif, generous whitespace.
- "Different Types of Departments" layout → **segment grid**: intro copy left, 3-column icon cards
  right, one card highlighted solid (green) on hover/focus instead of permanently.
- Curved blue footer top edge carrying the newsletter-style band (reused as the enquiry band).

Take from **Pavilion (secondary)**:
- Short **green underline bar** under every section title (use `--brand-leaf`).
- **Overlapping offset panels**: a light surface block that bleeds off one edge with an image
  overlapping it (used for About and "How we work").
- Elevated white cards with a soft shadow and a text-link CTA with arrow ("View range →").
- Dot-grid texture in corners; **"Our Affiliations"** strip → our credentials strip.
- Dark navy footer with 4 columns + bottom legal row.

Echo the **logo** itself: the circular arc becomes a recurring motif — a large thin sky-blue
arc behind the hero visual, around the stat counters, and as the section divider curve. The leaf
appears only as a small bullet/accent glyph. This makes the site feel like Atin, not a template.

Drop from references (don't fit a B2B pharma distributor / Indian pharma ad rules):
- Doctor-in-scrubs hero photo and play button (implies medical endorsement; we have no video).
- Partner logos strip (Dropbox/Netflix) — never fake partners. Replaced by the segment marquee.
- Patient testimonials orbit (Remedial) — only trade testimonials, and only when admin-published.
- Shop / refill prescription / mobile-app sections (Pavilion) — not our business model.
- "Book an appointment" — becomes "Send a trade enquiry" / "Request a call".

### Typography
- Headings: **Plus Jakarta Sans** 700/800 (geometric, echoes the logo lettering; tighter than Remedial's default).
- Body/UI: **Inter** 400/500/600. Both via `next/font/google`, `display: swap`, CSS variables.
- Scale: hero 56/64 (desktop) → 36/44 (mobile); section title 40/48 → 30/38; body 16/26; small 14/22.
  Wide letter-spacing uppercase eyebrow labels (Pavilion "WELCOME TO").

### Shape, depth, motion
- Radii: cards 16px, buttons full pill, inputs 12px.
- Shadow: `0 10px 30px -12px rgb(10 31 102 / .18)` (blue-tinted, not grey).
- Hero diagonal: `clip-path: polygon(...)` on desktop plus an SVG curve for the rounded corner;
  on mobile the panel becomes a straight block with a soft bottom curve.
- Motion (CSS + a tiny IntersectionObserver `Reveal` component, no animation library): fade-up
  12px on scroll, count-up figures, infinite marquee for segments, card lift 4px on hover.
  Everything disabled under `prefers-reduced-motion`; content visible without JS (`.js` class gate).

### Imagery
No real photos supplied. Default visuals are built, not stock-faked:
- Hero visual: an illustrated composition (SVG) of Atin-style packs — a tablet strip, syrup bottle,
  eye-drop vial, tube — in brand blues/greens, floating inside the logo arc. Replaceable with a
  real product/warehouse photo from **Admin → Company details → Hero image**.
- 10 segment icons (lucide-based or custom line icons): pill/capsule, bottle, softgel, syringe,
  leaf, tooth, tube, sachet/jar, droplet+sparkle, eye-dropper. Each on a tinted rounded square
  (alternating blue/green tints like Remedial's department icons).
- Product images: uploaded via admin; fallback is the segment icon on a tinted card — never a
  "placeholder" box.

---

## 3. Home page — section by section

Order top to bottom (desktop wireframe; every section stacks to one column under 768px).

### 3.1 Header (sticky)
- Over hero: transparent, white logo, white links. After scrolling past a top sentinel: white
  background, colour logo, navy links, shadow.
- Left: logo. Centre: Home · About ▾ · Products ▾ · Quality · Blog · Contact.
  Products ▾ = All products, New additions, top 6 segments from DB.
- Right: phone link (Pavilion's green phone block, shrunk to a pill) + green **Request a call** button.
- Mobile: logo + call icon + menu button → full-height drawer with nested links.

### 3.2 Hero (Remedial layout)
- Left 55%: blue panel with hex pattern and angled/curved edge.
  - Eyebrow: `PHARMACEUTICAL MARKETING & DISTRIBUTION`
  - H1: **"Quality medicines, delivered to every counter."** (alt: "A complete pharma range for
    distributors, chemists and hospitals.") — no cure/efficacy wording.
  - Sub: "Atin HealthCare markets and distributes 179 products across 10 segments — from
    tablets and syrups to injectables, ayurvedic and dental care." (numbers from DB).
  - CTAs: green **Explore products** (→ /products) + white outline **Request a call** (opens dialog).
  - Inline trust row: `179 products` · `10 segments` · `PAN-India trade enquiries` (last one only if client confirms; otherwise omit).
- Right 45%: hero visual inside the sky-blue logo arc, overlapping the diagonal.
- **Floating search card** straddling the hero's bottom edge (the Remedial "Log in" green block
  moved down and made useful): "Find a product" input with live suggestions (brand or composition),
  segment select, Search button. Combobox with keyboard nav, "View all N results".

### 3.3 Segment marquee (replaces partner logos)
Thin white strip, slow infinite scroll of the 10 segment names with small leaf dots in muted blue —
same visual weight as Remedial's logo row. Pauses on hover, static list for reduced motion.

### 3.4 About teaser (Pavilion "A Customized Pharmacy For You" + offset panel)
- Left: eyebrow "ABOUT ATIN", title "A trusted partner for the pharma trade", green bar,
  2 short paragraphs from company profile (admin), text link "More about us →".
- Right: overlapping surface panel with 3 count-up figures inside arc rings:
  products · segments · dosage forms (+ years/partners only when supplied).
- Hidden sections if company profile empty → falls back to a single neutral line.

### 3.5 Our product segments (Remedial "Different Types of Departments")
- Remedial's grid, 3 columns on desktop: **cell 1** is the intro (title "Our product segments",
  green bar, one-line intro), **cells 2–11** are the 10 segment cards (icon tile, name,
  "N products", "View range →"), **cell 12** is a solid-blue "View all 179 products →" card —
  4 even rows, no orphan. 2 columns on tablet, 1 on mobile (intro on top).
- Hover/focus: card fills solid **brand-green** with white text + icon (Remedial's "Medicine" state).

### 3.6 New additions
Horizontal card rail (scroll-snap, arrow buttons) of products flagged `isNew`, Pavilion card style:
image/icon top, brand, dosage form, composition (2-line clamp), pack, "Enquire →". Hidden if none.

### 3.7 Who we work with (audiences)
Blue full-bleed band with hex pattern + curved top: 4 white tiles — **Distributors & stockists**,
**Retail chemists**, **Hospitals & clinics**, **Institutional buyers** — one line each about the
trade relationship (no clinical claims). CTA "Become a distribution partner" → /contact?type=partner.

### 3.8 Why Atin (Pavilion "Download our app" layout repurposed)
Offset surface panel left with 4 icon features in a 2×2 grid, image/illustration right overlapping:
- Wide multi-segment range (fact)
- Consistent packaging & supply (only phrasing client approves)
- Responsive trade support
- Documentation on request (licences/certificates)
Copy runs through `check:copy`; any feature the client can't substantiate is removed.

### 3.9 Credentials strip (Pavilion "Our Affiliations")
"Licences & registrations" title left, credential chips right (Drug Licence no., GSTIN, FSSAI for
nutrition range, AYUSH for ayurvedic) from the `credentials` table. Hidden when empty.

### 3.10 Testimonials (Remedial orbit, simplified)
Only published trade testimonials with permission. Layout: quote card right, circular arc on the
left with initials avatars (no faces unless supplied) orbiting the logo mark; dots pagination.
Entire section hidden when none (default).

### 3.11 Latest from the blog (Remedial "Our Latest News")
3 cards: cover (or brand-pattern fallback), title, date, "Read more". Hidden when no posts.

### 3.12 Enquiry band + footer (Remedial curved footer, Pavilion columns)
- Curved blue top band: "Have a trade enquiry?" + short line + inline form (name, phone, segment,
  Send) or buttons **Send enquiry** / **Request a call**. Enquiry note: "For trade enquiries only.
  We do not provide medical advice."
- Navy footer, 4 columns: logo-white + one-line profile + address · Quick links · Product segments
  (all 10) · Contact (phone, email, WhatsApp, hours).
- Bottom row: © Atin HealthCare Pvt Ltd · Disclaimer · Privacy · catalogue note.
- Floating WhatsApp button (bottom-right), callback `<dialog>` (auto-opens once after 8 s, 30-day quiet).

---

## 4. Other public pages — same system

| Page | Layout notes |
|---|---|
| `/products` | Short blue header band with curved bottom + breadcrumb; left filter panel (search, segment chips, new-only) / results grid; catalogue note. `noindex`. |
| `/products/[range]` | Header band with segment icon + facts (count, forms); product grid; "Other segments" rail. |
| `/products/[range]/[product]` | 2-col: gallery / facts list (brand, form, composition, pack, segment); green "Enquire about this product"; related rail; JSON-LD. |
| `/about` | Pavilion offset panels: profile · figures · vision & mission (two cards) · director's message (photo + quote card). |
| `/quality-certifications` | Credentials table or "details available on request". |
| `/blog`, `/blog/[slug]` | Remedial news cards; article max-width 720px. |
| `/contact` | Split: contact details card on blue panel / enquiry form on white. Map embed only if client supplies address. |
| `/disclaimer`, 404 | Plain header band + prose. |

---

## 5. Build order

1. **Foundation** — install pinned deps from the brief (keep installed `next@16.3.5`/`eslint-config-next@16.3.5`,
   already newer than the brief's 16.3.4); read `node_modules/next/dist/docs` sections on proxy,
   async params, images, fonts, caching. Tokens + fonts in `app/globals.css` (`@theme`), root layout
   with `js` class script, logo assets, SiteChrome shell (header, footer, WhatsApp, dialog).
2. **Data** — Drizzle schema, pool, migrations; `data/catalogue/ranges.json`; seed script adapted
   to this sheet (section-row detection, suffix → dosage form, flags above); `db:seed --dry-run`
   report reviewed.
3. **Home page** — sections 3.1–3.12 as server components reading `lib/data/*`; client islands only
   for header scroll state, search combobox, marquee, count-up, carousel, dialog.
4. **Catalogue pages** + `/api/search`, sitemap, robots.
5. **Content pages** (about, quality, blog, contact, disclaimer) + enquiry/callback actions + mail.
6. **Auth + admin panel** exactly as the brief (admin theme remaps tokens to a neutral navy UI).
7. **Compliance & QA** — `check:copy`, typecheck, lint, build; browser pass at 375 / 768 / 1280 /
   1440; Lighthouse ≥ 90 on home (perf, a11y, SEO); keyboard + screen-reader pass on nav, search,
   dialog; reduced-motion check; no empty/placeholder blocks with an empty DB.

---

## 6. Decisions taken without asking (change any of these later)

- Design #1 (Remedial) is the base; Pavilion supplies section treatments and footer.
- Colours sampled from the logo as above; green buttons use the darker text-green for AA contrast.
- Fonts: Plus Jakarta Sans + Inter.
- No stock doctor/patient photos; illustrated hero until real imagery is uploaded.
- Segments = the 10 spreadsheet headings, renamed to clean short names.
- Figures shown are only those computable from the catalogue; everything else waits for client data.
- MRP/GST/specialities: absent in sheet → fields nullable, hidden publicly.
- "Stone" ayurvedic product imported unpublished pending compliance review.
- Business model line: "pharmaceutical marketing and distribution company".
