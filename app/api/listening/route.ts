import { lastfm } from "@/util/listening/lastfm";
import { spotify } from "@/util/listening/spotify";
import { emptyListening, type ListeningProvider } from "@/util/listening/types";

/**
 * GET /api/listening — listening stats for the Heavy Rotation record.
 * Uses the first configured provider. Upstream calls are cached for 5 minutes
 * (fetch `next.revalidate` inside the provider); secrets never reach the client.
 */

// Order = preference. Set LISTENING_PROVIDER=spotify|lastfm to force one.
const PROVIDERS: ListeningProvider[] = [lastfm, spotify];

export async function GET() {
  const forced = process.env.LISTENING_PROVIDER;
  const provider = PROVIDERS.find(
    (p) => p.isConfigured() && (!forced || p.source === forced),
  );

  if (!provider) {
    return Response.json(
      emptyListening("Not connected yet — listening stats will appear here."),
    );
  }

  try {
    const data = await provider.fetch();
    return Response.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    console.error("[listening]", err);
    return Response.json(
      emptyListening("The turntable skipped — couldn't reach the music service."),
      { status: 200 },
    );
  }
}
