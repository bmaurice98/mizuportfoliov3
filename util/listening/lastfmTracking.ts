// Server-only: imported by the /api/listening/* route handlers (reads secret env vars).
/**
 * Song tracking for Heavy Rotation, ported from the MizuMaiNichi logger
 * (~/mizumainichilogger: lastfm_fetcher.py + recommender.py).
 *
 * What came across:
 *  - Daily log: recent scrobbles, de-duplicated per day by (artist, track),
 *    up to SONGS_PER_DAY each, with the "loved" flag and album art.
 *  - Enrichment: track.getInfo (my play count + tags) merged with
 *    artist.getInfo (tags, listeners, URL) — same merge rules as Python.
 *  - Genre mix: tags weighted by how much each artist was played.
 *  - Recommender ("by artists" mode): recent artists → similar artists →
 *    their top tracks, scored with the same RULES (log-scaled popularity,
 *    novelty / familiarity bonus, min-listener floor).
 *
 * What didn't: SQLite/CSV storage and video metadata. Instead of a database,
 * Next's fetch cache holds the upstream responses (see REVALIDATE).
 */
import type {
  Artwork,
  GenreSlice,
  ListeningLog,
  LogDay,
  LoggedSong,
  Recommendation,
  Recommendations,
} from "./types";

const API = "https://ws.audioscrobbler.com/2.0/";

/** Days shown in the listening diary. */
const LOG_DAYS = 7;
/** Same as SONGS_PER_DAY in lastfm_fetcher.py. */
const SONGS_PER_DAY = 5;
/** Days whose songs get the full track/artist enrichment (newest first). */
const ENRICHED_DAYS = 1;
/** Artists considered for the genre mix (by plays). */
const GENRE_ARTISTS = 12;
const GENRE_SLICES = 8;

/** Seconds each kind of upstream response may be served from cache. */
const REVALIDATE = {
  recent: 300,
  trackInfo: 3600,
  artistInfo: 86400,
  similar: 6 * 3600,
};

/** recommender.py RULES, unchanged. */
const RULES = {
  listenerWeight: 2.0,
  playcountWeight: 1.0,
  noveltyBonus: 8.0,
  familiarityBonus: 5.0,
  knownTrackPenalty: 4.0,
  minListeners: 5_000,
};
const TARGET_COUNT = 5;
const ARTIST_SOURCES = 4;
const SIMILAR_PER_SOURCE = 5;
const TOP_TRACKS_PER_ARTIST = 5;

/** Tags that describe the listener, not the music. */
const JUNK_TAGS = new Set(
  [
    "seen live", "favorites", "favourites", "favorite", "favourite", "discovered",
    "love", "loved", "awesome", "beautiful", "my favorite", "albums i own",
    "spotify", "check out", "under 2000 listeners", "male vocalists",
    "female vocalists", "all", "music",
  ].map((t) => t.replace(/[^a-z0-9]/g, "")),
);

export const timeZone = () => process.env.LISTENING_TIMEZONE || "America/Los_Angeles";

/* ------------------------------------------------------------------ */
/* Upstream                                                            */
/* ------------------------------------------------------------------ */

type LfmImage = { "#text": string; size: string };

async function lfm<T>(
  method: string,
  params: Record<string, string>,
  revalidate: number,
): Promise<T> {
  const url = new URL(API);
  url.search = new URLSearchParams({
    method,
    api_key: process.env.LASTFM_API_KEY!,
    format: "json",
    ...params,
  }).toString();
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`Last.fm ${method} failed: ${res.status}`);
  const data = (await res.json()) as T & { error?: number; message?: string };
  if (data.error) throw new Error(`Last.fm ${method} error ${data.error}: ${data.message}`);
  return data;
}

/** Like `_call` wrapped in try/except in the Python: a miss is not fatal. */
async function soft<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

/** Run async jobs with a small concurrency cap (Last.fm asks for ≤5 req/s). */
async function pool<I, O>(items: I[], size: number, job: (i: I) => Promise<O>): Promise<O[]> {
  const out = new Array<O>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await job(items[i]);
      }
    }),
  );
  return out;
}

function art(images: LfmImage[] | undefined, alt: string): Artwork {
  const src =
    images?.find((i) => i.size === "extralarge")?.["#text"] ||
    images?.find((i) => i.size === "large")?.["#text"];
  if (!src || src.includes("2a96cbd8b46e442fc41c2b86b821562f")) return null;
  return { src, alt };
}

const asList = <T,>(x: T | T[] | undefined): T[] => (x == null ? [] : Array.isArray(x) ? x : [x]);
const tagKey = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, "");
const isUseful = (t: string) => {
  const k = tagKey(t);
  return !!k && !JUNK_TAGS.has(k) && !/^\d{4}$/.test(k);
};
/** Canonical spellings for tags people write many ways (keyed by tagKey). */
const TAG_NAMES: Record<string, string> = {
  rnb: "R&B", randb: "R&B", krnb: "K-R&B", jrnb: "J-R&B",
  hiphop: "Hip-Hop", khiphop: "K-Hip-Hop", jpop: "J-Pop", kpop: "K-Pop",
  jrock: "J-Rock", krock: "K-Rock", kindie: "K-Indie", edm: "EDM", idm: "IDM",
  ost: "OST", uk: "UK", lofi: "Lo-Fi",
};
const titleCase = (t: string) =>
  TAG_NAMES[tagKey(t)] ?? t.toLowerCase().replace(/(^|[\s-])(\w)/g, (_, p, c) => p + c.toUpperCase());

/* ------------------------------------------------------------------ */
/* Recent scrobbles                                                    */
/* ------------------------------------------------------------------ */

type RecentTrack = {
  name: string;
  url: string;
  loved?: string;
  artist: { name?: string; "#text"?: string; url?: string };
  album: { "#text"?: string };
  image: LfmImage[];
  date?: { uts: string };
  "@attr"?: { nowplaying?: string };
};

type Scrobble = {
  title: string;
  artist: string;
  album?: string;
  url?: string;
  artistUrl?: string;
  art: Artwork;
  loved: boolean;
  at: Date;
};

async function recentScrobbles(): Promise<Scrobble[]> {
  // Round the window start to the hour so the request URL (= cache key) is stable.
  const hour = 3600;
  const from = Math.floor(Date.now() / 1000 / hour) * hour - LOG_DAYS * 86400;
  const data = await lfm<{ recenttracks: { track: RecentTrack | RecentTrack[] } }>(
    "user.getrecenttracks",
    { user: process.env.LASTFM_USERNAME!, limit: "200", extended: "1", from: String(from) },
    REVALIDATE.recent,
  );
  return asList(data.recenttracks?.track)
    .map((t) => {
      const artist = t.artist?.name || t.artist?.["#text"] || "";
      const live = t["@attr"]?.nowplaying === "true";
      return {
        title: t.name,
        artist,
        album: t.album?.["#text"] || undefined,
        url: t.url,
        artistUrl: t.artist?.url,
        art: art(t.image, `${t.album?.["#text"] || t.name} cover`),
        loved: t.loved === "1",
        at: live ? new Date() : new Date(Number(t.date?.uts ?? 0) * 1000),
      };
    })
    .filter((s) => s.title && s.artist);
}

/* ------------------------------------------------------------------ */
/* Enrichment (fetch_track_info / fetch_artist_info)                   */
/* ------------------------------------------------------------------ */

type ArtistInfo = { tags: string[]; listeners: number; url?: string };

async function artistInfo(artist: string): Promise<ArtistInfo> {
  const data = await soft(
    lfm<{ artist: { url?: string; stats?: { listeners?: string }; tags?: { tag?: { name: string }[] | { name: string } } } }>(
      "artist.getinfo",
      { artist, autocorrect: "1" },
      REVALIDATE.artistInfo,
    ),
  );
  const a = data?.artist;
  return {
    tags: asList(a?.tags?.tag).map((t) => t.name).filter(isUseful).slice(0, 5),
    listeners: Number(a?.stats?.listeners ?? 0),
    url: a?.url,
  };
}

async function trackInfo(artist: string, track: string) {
  const data = await soft(
    lfm<{ track: { userplaycount?: string; toptags?: { tag?: { name: string }[] | { name: string } } } }>(
      "track.getinfo",
      { artist, track, username: process.env.LASTFM_USERNAME!, autocorrect: "1" },
      REVALIDATE.trackInfo,
    ),
  );
  return {
    myPlays: data?.track?.userplaycount != null ? Number(data.track.userplaycount) : undefined,
    tags: asList(data?.track?.toptags?.tag).map((t) => t.name).filter(isUseful).slice(0, 5),
  };
}

/** Track tags first (more specific), then artist tags; de-duplicated; top 5. */
function mergeTags(trackTags: string[], artistTags: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of [...trackTags, ...artistTags]) {
    const k = tagKey(t);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(titleCase(t));
  }
  return out.slice(0, 5);
}

/* ------------------------------------------------------------------ */
/* Daily log + genre mix                                               */
/* ------------------------------------------------------------------ */

export async function lastfmLog(): Promise<ListeningLog> {
  const tz = timeZone();
  const dayOf = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const scrobbles = await recentScrobbles();

  // Group by local day, de-duplicate by (artist, track) — newest first.
  const days = new Map<string, { scrobbles: number; songs: Map<string, LoggedSong> }>();
  for (const s of scrobbles) {
    const date = dayOf.format(s.at);
    let day = days.get(date);
    if (!day) days.set(date, (day = { scrobbles: 0, songs: new Map() }));
    day.scrobbles++;
    const key = `${s.artist.toLowerCase()}||${s.title.toLowerCase()}`;
    const song = day.songs.get(key);
    if (song) {
      song.playsThatDay++;
      song.loved ||= s.loved;
    } else {
      day.songs.set(key, {
        title: s.title,
        artist: s.artist,
        album: s.album,
        url: s.url,
        artistUrl: s.artistUrl,
        art: s.art,
        loved: s.loved,
        playedAt: s.at.toISOString(),
        playsThatDay: 1,
      });
    }
  }

  const log: LogDay[] = [...days.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, LOG_DAYS)
    .map(([date, d]) => ({
      date,
      scrobbles: d.scrobbles,
      songs: [...d.songs.values()].slice(0, SONGS_PER_DAY),
    }));

  // enrich_tracks(): newest day(s) only, to keep the request count small.
  const toEnrich = log.slice(0, ENRICHED_DAYS).flatMap((d) => d.songs);
  await pool(toEnrich, 4, async (song) => {
    const [t, a] = await Promise.all([trackInfo(song.artist, song.title), artistInfo(song.artist)]);
    song.genres = mergeTags(t.tags, a.tags);
    song.myPlays = t.myPlays;
    song.listeners = a.listeners || undefined;
    song.artistUrl = a.url ?? song.artistUrl;
  });

  return {
    source: "lastfm",
    timeZone: tz,
    days: log,
    genres: await genreMix(scrobbles),
    updatedAt: new Date().toISOString(),
  };
}

/** Each artist's top tags, weighted by how often the artist was played. */
async function genreMix(scrobbles: Scrobble[]): Promise<GenreSlice[]> {
  const plays = new Map<string, number>();
  for (const s of scrobbles) plays.set(s.artist, (plays.get(s.artist) ?? 0) + 1);
  const artists = [...plays.entries()].sort((a, b) => b[1] - a[1]).slice(0, GENRE_ARTISTS);

  const infos = await pool(artists, 4, ([name]) => artistInfo(name));
  const weight = new Map<string, { name: string; w: number }>();
  artists.forEach(([, p], i) => {
    infos[i].tags.slice(0, 3).forEach((tag, rank) => {
      const k = tagKey(tag);
      const cur = weight.get(k) ?? { name: titleCase(tag), w: 0 };
      cur.w += p * [1, 0.6, 0.4][rank];
      weight.set(k, cur);
    });
  });
  const top = [...weight.values()].sort((a, b) => b.w - a.w).slice(0, GENRE_SLICES);
  const total = top.reduce((n, g) => n + g.w, 0) || 1;
  return top.map((g) => ({ name: g.name, share: g.w / total }));
}

/* ------------------------------------------------------------------ */
/* Recommendations (recommend_by_artists)                              */
/* ------------------------------------------------------------------ */

type Candidate = {
  title: string;
  artist: string;
  url?: string;
  listeners: number;
  playcount: number;
  because: string;
};

function score(c: Candidate, knownTracks: Set<string>, knownArtists: Set<string>) {
  if (c.listeners < RULES.minListeners) return null;
  const isNewTrack = !knownTracks.has(`${c.artist.toLowerCase()}||${c.title.toLowerCase()}`);
  const isNewArtist = !knownArtists.has(c.artist.toLowerCase());

  let s = RULES.listenerWeight * Math.log10(c.listeners);
  if (c.playcount > 0) s += RULES.playcountWeight * Math.log10(c.playcount);

  let reason = "popular in my taste range";
  if (isNewTrack && isNewArtist) {
    s += RULES.noveltyBonus;
    reason = "new discovery";
  } else if (isNewTrack) {
    s += RULES.familiarityBonus;
    reason = "new track from a familiar artist";
  } else {
    s -= RULES.knownTrackPenalty;
  }
  return { s, reason };
}

export async function lastfmRecommend(): Promise<Recommendations> {
  const scrobbles = await recentScrobbles();
  const knownTracks = new Set(scrobbles.map((s) => `${s.artist.toLowerCase()}||${s.title.toLowerCase()}`));
  const knownArtists = new Set(scrobbles.map((s) => s.artist.toLowerCase()));

  // _get_recent_artists(): the N most recently played unique artists.
  const seeds: string[] = [];
  for (const s of scrobbles) {
    if (!seeds.some((a) => a.toLowerCase() === s.artist.toLowerCase())) seeds.push(s.artist);
    if (seeds.length === ARTIST_SOURCES) break;
  }
  if (!seeds.length) {
    return { source: "lastfm", items: [], seeds, updatedAt: new Date().toISOString() };
  }

  // _candidates_from_similar_artist()
  const similar = await pool(seeds, 4, async (seed) => {
    const data = await soft(
      lfm<{ similarartists: { artist: { name: string }[] | { name: string } } }>(
        "artist.getsimilar",
        { artist: seed, limit: String(SIMILAR_PER_SOURCE), autocorrect: "1" },
        REVALIDATE.similar,
      ),
    );
    return asList(data?.similarartists?.artist).map((a) => ({ name: a.name, because: seed }));
  });
  const sources = similar.flat().filter((a, i, all) => all.findIndex((b) => b.name === a.name) === i);

  const tops = await pool(sources, 4, async ({ name, because }) => {
    const data = await soft(
      lfm<{ toptracks: { track: { name: string; url: string; listeners: string; playcount: string }[] } }>(
        "artist.gettoptracks",
        { artist: name, limit: String(TOP_TRACKS_PER_ARTIST), autocorrect: "1" },
        REVALIDATE.similar,
      ),
    );
    return asList(data?.toptracks?.track).map<Candidate>((t) => ({
      title: t.name,
      artist: name,
      url: t.url,
      listeners: Number(t.listeners ?? 0),
      playcount: Number(t.playcount ?? 0),
      because,
    }));
  });

  // _finalise(): de-dup → score → sort → top N. One pick per artist so the
  // list doesn't collapse into a single artist's greatest hits.
  const scored: Recommendation[] = [];
  const seen = new Set<string>();
  for (const c of tops.flat()) {
    const key = `${c.artist.toLowerCase()}||${c.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const r = score(c, knownTracks, knownArtists);
    if (!r) continue;
    scored.push({
      title: c.title,
      artist: c.artist,
      url: c.url,
      listeners: c.listeners,
      score: Math.round(r.s * 100) / 100,
      reason: r.reason,
      because: c.because,
    });
  }
  scored.sort((a, b) => b.score - a.score);
  const picks: Recommendation[] = [];
  const pickedArtists = new Set<string>();
  for (const r of scored) {
    if (pickedArtists.has(r.artist)) continue;
    pickedArtists.add(r.artist);
    picks.push(r);
    if (picks.length === TARGET_COUNT) break;
  }

  return { source: "lastfm", items: picks, seeds, updatedAt: new Date().toISOString() };
}
