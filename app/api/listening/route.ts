import { NOT_CONNECTED, SKIPPED, pickProvider } from "@/util/listening/providers";
import { emptyListening } from "@/util/listening/types";

/**
 * GET /api/listening — listening stats for the Heavy Rotation record.
 * Uses the first configured provider. Upstream calls are cached for 5 minutes
 * (fetch `next.revalidate` inside the provider); secrets never reach the client.
 */
export async function GET() {
  const provider = pickProvider();
  if (!provider) return Response.json(emptyListening(NOT_CONNECTED));

  try {
    const data = await provider.fetch();
    return Response.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    console.error("[listening]", err);
    return Response.json(emptyListening(SKIPPED));
  }
}
