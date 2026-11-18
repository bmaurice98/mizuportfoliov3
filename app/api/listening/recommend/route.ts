import { NOT_CONNECTED, SKIPPED, pickProvider } from "@/util/listening/providers";
import { emptyRecommendations } from "@/util/listening/types";

/**
 * GET /api/listening/recommend — picks seeded from recent listening
 * (similar artists' top tracks, scored for novelty and popularity).
 * This fans out to ~25 upstream calls, so it's cached for hours.
 */
export async function GET() {
  const provider = pickProvider();
  if (!provider?.recommend) return Response.json(emptyRecommendations(NOT_CONNECTED));

  try {
    return Response.json(await provider.recommend(), {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=21600" },
    });
  } catch (err) {
    console.error("[listening/recommend]", err);
    return Response.json(emptyRecommendations(SKIPPED));
  }
}
