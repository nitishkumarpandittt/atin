import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getCatalogueFigures } from "@/lib/data/catalogue";
import { site } from "@/lib/site/config";

// Site-wide share image (link previews in WhatsApp, LinkedIn, X, Facebook…). Rendered at build time.
export const alt = `${site.name} — pharmaceutical marketing and distribution`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [logo, figures] = await Promise.all([
    readFile(path.join(process.cwd(), "public/brand/atin-logo-white.png")),
    getCatalogueFigures().catch(() => null),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const stats = figures
    ? [
        [String(figures.products), "products"],
        [String(figures.ranges), "segments"],
        [String(figures.dosageForms), "dosage forms"],
      ]
    : [];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "linear-gradient(135deg, #0a63c9 0%, #0054b4 45%, #0a1f66 100%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
          <img src={logoSrc} width={203} height={120} alt="" />
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#e3f1fd" }}>FOR THE PHARMA TRADE</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Pharma ranges that</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>reach every counter.</div>
          <div style={{ display: "flex", width: 120, height: 8, borderRadius: 8, background: "#4caa1c", marginTop: 28 }} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 20 }}>
            {stats.map(([n, label]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", padding: "16px 26px", borderRadius: 20, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <div style={{ fontSize: 44, fontWeight: 800 }}>{n}</div>
                <div style={{ fontSize: 22, color: "#e3f1fd" }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 600, color: "#e3f1fd" }}>{site.url.replace(/^https?:\/\//, "")}</div>
        </div>
      </div>
    ),
    size,
  );
}
