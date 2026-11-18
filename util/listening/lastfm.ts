// Server-only: imported by app/api/listening/route.ts (reads secret env vars).
import type { Artwork, ListeningData, ListeningProvider, RankedItem } from "./types";

/**
 * Last.fm provider. Needs only a (free) API key and a public username:
 *   LASTFM_API_KEY=…   LASTFM_USERNAME=…
 * Optional: LASTFM_PERIOD = 7day | 1month | 3month | 6month | 12month | overall
 * Docs: https://www.last.fm/api
 */

const API = "https://ws.audioscrobbler.com/2.0/";
const REVALIDATE_SECONDS = 300;
const LIMIT = 8;

const PERIOD_LABEL: Record<string, string> = {
  "7day": "Last 7 days",
  "1month": "Last 30 days",
  "3month": "Last 3 months",
  "6month": "Last 6 months",
  "12month": "Last 12 months",
  overall: "All time",
};

type LfmImage = { "#text": string; size: string };
type LfmNamed = { name?: string; "#text"?: string };

function art(images: LfmImage[] | undefined, alt: string): Artwork {
  const src = images?.find((i) => i.size === "extralarge")?.["#text"] ||
    images?.find((i) => i.size === "large")?.["#text"];
  // Last.fm serves a generic star placeholder for missing art; skip it.
  if (!src || src.includes("2a96cbd8b46e442fc41c2b86b821562f")) return null;
  return { src, alt };
}

async function call<T>(method: string, params: Record<string, string>): Promise<T> {
  const url = new URL(API);
  url.search = new URLSearchParams({
    method,
    user: process.env.LASTFM_USERNAME!,
    api_key: process.env.LASTFM_API_KEY!,
    format: "json",
    ...params,
  }).toString();
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`Last.fm ${method} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

const nameOf = (n: LfmNamed | undefined) => n?.name ?? n?.["#text"] ?? "";

export const lastfm: ListeningProvider = {
  source: "lastfm",
  isConfigured: () => !!process.env.LASTFM_API_KEY && !!process.env.LASTFM_USERNAME,

  async fetch(): Promise<ListeningData> {
    const period = process.env.LASTFM_PERIOD ?? "1month";
    const ranged = { period, limit: String(LIMIT) };

    const [artists, albums, tracks, recent, info] = await Promise.all([
      call<{ topartists: { artist: { name: string; playcount: string; url: string; image: LfmImage[] }[] } }>(
        "user.gettopartists",
        ranged,
      ),
      call<{ topalbums: { album: { name: string; playcount: string; url: string; artist: LfmNamed; image: LfmImage[] }[] } }>(
        "user.gettopalbums",
        ranged,
      ),
      call<{ toptracks: { track: { name: string; playcount: string; url: string; artist: LfmNamed; image: LfmImage[] }[] } }>(
        "user.gettoptracks",
        ranged,
      ),
      call<{ recenttracks: { track: { name: string; url: string; artist: LfmNamed; album: LfmNamed; image: LfmImage[]; date?: { uts: string }; "@attr"?: { nowplaying?: string } }[] } }>(
        "user.getrecenttracks",
        { limit: "1" },
      ),
      call<{ user: { playcount: string; artist_count?: string; track_count?: string; album_count?: string; registered: { unixtime: string }; url: string } }>(
        "user.getinfo",
        {},
      ),
    ]);

    const ranked = (items: { name: string; playcount: string; url: string; artist?: LfmNamed; image: LfmImage[] }[]): RankedItem[] =>
      items.map((i) => ({
        name: i.name,
        by: i.artist ? nameOf(i.artist) : undefined,
        plays: Number(i.playcount),
        url: i.url,
        art: art(i.image, i.artist ? `${i.name} by ${nameOf(i.artist)}` : i.name),
      }));

    const last = recent.recenttracks.track[0];
    const since = new Date(Number(info.user.registered.unixtime) * 1000);
    const fmt = (n: string | undefined) => (n ? Number(n).toLocaleString("en-US") : undefined);

    return {
      source: "lastfm",
      period: PERIOD_LABEL[period] ?? period,
      profileUrl: info.user.url,
      nowPlaying: last
        ? {
            title: last.name,
            artist: nameOf(last.artist),
            album: nameOf(last.album) || undefined,
            url: last.url,
            art: art(last.image, `${nameOf(last.album) || last.name} cover`),
            live: last["@attr"]?.nowplaying === "true",
            playedAt: last.date ? new Date(Number(last.date.uts) * 1000).toISOString() : undefined,
          }
        : null,
      topArtists: ranked(artists.topartists.artist),
      topAlbums: ranked(albums.topalbums.album),
      topTracks: ranked(tracks.toptracks.track),
      stats: [
        { label: "Scrobbles", value: fmt(info.user.playcount) ?? "—" },
        ...(info.user.artist_count ? [{ label: "Artists", value: fmt(info.user.artist_count)! }] : []),
        ...(info.user.album_count ? [{ label: "Albums", value: fmt(info.user.album_count)! }] : []),
        ...(info.user.track_count ? [{ label: "Tracks", value: fmt(info.user.track_count)! }] : []),
        { label: "Scrobbling since", value: since.getUTCFullYear().toString() },
      ],
      updatedAt: new Date().toISOString(),
    };
  },
};
