import { readFile } from "node:fs/promises";
import { resolveUpload } from "@/lib/uploads/paths";

export async function GET(_request: Request, { params }: RouteContext<"/uploads/[...path]">) {
  const { path: parts } = await params;
  const full = resolveUpload(parts.join("/"));
  if (!full) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(full);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
