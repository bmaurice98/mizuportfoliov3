// Server-only: imported by app/api/listening/route.ts (reads secret env vars).
import type { ListeningData, ListeningProvider } from "./types";

/**
 * Spotify provider — SKELETON, not implemented yet.
 *
 * Spotify needs OAuth: a one-time authorization to get a refresh token with
 * the `user-top-read` and `user-read-currently-playing` scopes, then:
 *   SPOTIFY_CLIENT_ID=…  SPOTIFY_CLIENT_SECRET=…  SPOTIFY_REFRESH_TOKEN=…
 *
 * Endpoints to map onto ListeningData:
 *   POST https://accounts.spotify.com/api/token            (refresh → access token)
 *   GET  /v1/me/player/currently-playing                   → nowPlaying
 *   GET  /v1/me/top/artists?time_range=short_term&limit=8   → topArtists
 *   GET  /v1/me/top/tracks?time_range=short_term&limit=8    → topTracks
 *   (no "top albums" endpoint: derive from top tracks' albums)
 * Spotify doesn't expose play counts, so `plays` stays undefined.
 */
export const spotify: ListeningProvider = {
  source: "spotify",
  isConfigured: () =>
    !!process.env.SPOTIFY_CLIENT_ID &&
    !!process.env.SPOTIFY_CLIENT_SECRET &&
    !!process.env.SPOTIFY_REFRESH_TOKEN,

  async fetch(): Promise<ListeningData> {
    throw new Error("Spotify provider not implemented yet.");
  },
};
