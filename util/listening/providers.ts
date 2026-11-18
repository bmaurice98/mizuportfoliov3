// Server-only: shared by the /api/listening/* route handlers.
import { lastfm } from "./lastfm";
import { spotify } from "./spotify";
import type { ListeningProvider } from "./types";

// Order = preference. Set LISTENING_PROVIDER=spotify|lastfm to force one.
const PROVIDERS: ListeningProvider[] = [lastfm, spotify];

export function pickProvider(): ListeningProvider | undefined {
  const forced = process.env.LISTENING_PROVIDER;
  return PROVIDERS.find((p) => p.isConfigured() && (!forced || p.source === forced));
}

export const NOT_CONNECTED = "Not connected yet — listening stats will appear here.";
export const SKIPPED = "The turntable skipped — couldn't reach the music service.";
