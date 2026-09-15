import { searchProducts } from "@/lib/data/catalogue";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").slice(0, 80);
  const range = searchParams.get("range") ?? undefined;
  const data = await searchProducts(q, range);
  return Response.json(data, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
