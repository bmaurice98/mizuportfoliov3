import { NOT_CONNECTED, SKIPPED, pickProvider } from "@/util/listening/providers";
import { emptyLog } from "@/util/listening/types";

/**
 * GET /api/listening/log — the listening diary (five unique songs a day,
 * enriched with genres and play counts) and the week's genre mix.
 */
export async function GET() {
  const provider = pickProvider();
  if (!provider?.log) return Response.json(emptyLog(NOT_CONNECTED));

  try {
    return Response.json(await provider.log(), {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
    });
  } catch (err) {
    console.error("[listening/log]", err);
    return Response.json(emptyLog(SKIPPED));
  }
}
