import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getProductBySlug, getProductImages, getRange } from "@/lib/data/catalogue";
import { site } from "@/lib/site/config";
import { resolveUpload } from "@/lib/uploads/paths";

// Per-product share image: the pack shot beside brand, form, composition and pack.
export const alt = "Product pack and details";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Pack shot as a PNG data URI (ImageResponse cannot decode WebP), or null when there is none. */
async function packShot(src: string | undefined): Promise<string | null> {
  if (!src) return null;
  const file = src.startsWith("/uploads/") ? resolveUpload(src.slice("/uploads/".length)) : src.startsWith("/") ? path.join(process.cwd(), "public", src) : null;
  if (!file) return null;
  try {
    const png = await sharp(await readFile(file)).resize({ width: 560, height: 560, fit: "inside" }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export default async function ProductOgImage({ params }: { params: Promise<{ range: string; product: string }> }) {
  const { product: slug } = await params;
  const product = await getProductBySlug(slug);
  const [range, images, logo] = await Promise.all([
    product ? getRange(product.rangeSlug) : null,
    product ? getProductImages(product.id) : [],
    readFile(path.join(process.cwd(), "public/brand/atin-logo.png")),
  ]);
  const shot = await packShot(images[0]?.src);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f3f6fc", fontFamily: "sans-serif" }}>
        <div style={{ width: 560, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "white" }}>
          {shot ? (
            // eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img>
            <img src={shot} width={500} height={500} alt="" style={{ objectFit: "contain" }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img>
            <img src={logoSrc} width={338} height={200} alt="" />
          )}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 56px 48px", background: "linear-gradient(160deg, #0054b4 0%, #0a1f66 100%)", color: "white" }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 3, color: "#e3f1fd" }}>{(range?.shortName ?? "Product").toUpperCase()}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>{clip(product?.brand ?? site.name, 26)}</div>
            <div style={{ display: "flex", fontSize: 30, color: "#a7f3a0", marginTop: 12 }}>{product?.dosageForm ?? ""}</div>
            <div style={{ display: "flex", fontSize: 26, lineHeight: 1.35, color: "rgba(255,255,255,0.85)", marginTop: 24 }}>{clip(product?.composition ?? "", 120)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, color: "#e3f1fd" }}>
            <div style={{ display: "flex" }}>{product?.pack ? `Pack: ${clip(product.pack, 34)}` : ""}</div>
            <div style={{ display: "flex", fontWeight: 600 }}>{site.name}</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
