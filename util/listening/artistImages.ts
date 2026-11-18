// Server-only: reads secret env vars. Used by the Last.fm provider.
/**
 * Artist photos for Heavy Rotation.
 *
 * Last.fm stopped serving artist images in 2019 — every artist comes back
 * with the same grey-star placeholder. So:
 *   1. Spotify (client-credentials app token, no user sign-in): search the
 *      artist and use its photo, but only on an exact name match, so a
 *      similarly named artist never borrows someone else's face.
 *   2. Otherwise, the artist's most-played album cover from Last.fm.
 *   3. Otherwise null (the UI shows a blank disc).
 *
 * Needs SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET for step 1.
 */
import type { Artwork } from "./types";

const ONE_WEEK = 7 * 86400;
const LASTFM_PLACEHOLDER = "2a96cbd8b46e442fc41c2b86b821562f";

/* ---------------- Spotify ---------------- */

let token: { value: string; expires: number } | null = null;

async function spotifyToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (token && token.expires > Date.now() + 60_000) return token.value;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify token failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return token.value;
}

/** Case-, width- and punctuation-insensitive name key ("Ｄｅａｎ" = "dean"). */
const nameKey = (s: string) =>
  s.normalize("NFKC").toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");

type SpotifyArtist = {
  name: string;
  images: { url: string; width: number | null }[];
  followers?: { total?: number };
  popularity?: number;
};

/** Spotify localises artist names via Accept-Language; match the name's script. */
function localeFor(name: string): string | null {
  if (/[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(name)) return "ja";
  if (/\p{Script=Hangul}/u.test(name)) return "ko";
  if (/\p{Script=Han}/u.test(name)) return "ja,zh;q=0.8";
  return null;
}

async function spotifySearch(auth: string, name: string, lang: string | null) {
  const url = new URL("https://api.spotify.com/v1/search");
  url.search = new URLSearchParams({ q: name, type: "artist", limit: "10" }).toString();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${auth}`, ...(lang ? { "Accept-Language": lang } : {}) },
    // Cached per artist name (+ language); the bearer token isn't part of the key.
    next: { revalidate: ONE_WEEK },
  });
  if (!res.ok) throw new Error(`Spotify search failed: ${res.status}`);
  const data = (await res.json()) as { artists?: { items?: SpotifyArtist[] } };
  const want = nameKey(name);
  // Exact name matches only; several artists can share a name, so take the biggest.
  return (data.artists?.items ?? [])
    .filter((a) => nameKey(a.name) === want && a.images.length)
    .sort((a, b) => (b.followers?.total ?? b.popularity ?? 0) - (a.followers?.total ?? a.popularity ?? 0))[0];
}

async function spotifyArtistImage(name: string): Promise<string | null> {
  const auth = await spotifyToken();
  if (!auth) return null;
  const lang = localeFor(name);
  const match = (await spotifySearch(auth, name, null)) ?? (lang ? await spotifySearch(auth, name, lang) : undefined);
  if (!match) return null;
  // Images come largest first; pick the smallest that's still ≥ 300px.
  const fit = [...match.images].reverse().find((i) => (i.width ?? 0) >= 300);
  return (fit ?? match.images[0]).url;
}

/* ---------------- Last.fm fallback ---------------- */

async function lastfmTopAlbumCover(name: string): Promise<string | null> {
  const key = process.env.LASTFM_API_KEY;
  if (!key) return null;
  const url = new URL("https://ws.audioscrobbler.com/2.0/");
  url.search = new URLSearchParams({
    method: "artist.gettopalbums",
    artist: name,
    autocorrect: "1",
    limit: "3",
    api_key: key,
    format: "json",
  }).toString();
  const res = await fetch(url, { next: { revalidate: ONE_WEEK } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    topalbums?: { album?: { image?: { "#text": string; size: string }[] }[] };
  };
  for (const album of data.topalbums?.album ?? []) {
    const src = album.image?.find((i) => i.size === "extralarge")?.["#text"];
    if (src && !src.includes(LASTFM_PLACEHOLDER)) return src;
  }
  return null;
}

/* ---------------- Public ---------------- */

export async function artistImage(name: string): Promise<Artwork> {
  let src: string | null = null;
  try {
    src = await spotifyArtistImage(name);
  } catch (err) {
    console.warn("[artistImage] Spotify lookup failed:", (err as Error).message);
  }
  if (!src) src = await lastfmTopAlbumCover(name).catch(() => null);
  return src ? { src, alt: name } : null;
}
