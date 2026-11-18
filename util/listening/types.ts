/**
 * Shape of the listening stats shown on the Heavy Rotation record.
 * Providers (Last.fm, Spotify, …) map their APIs onto this.
 */

export type ListeningSource = "lastfm" | "spotify" | "none";

export type Artwork = { src: string; alt: string } | null;

export type RankedItem = {
  name: string;
  /** Secondary line: artist for tracks/albums. */
  by?: string;
  plays?: number;
  url?: string;
  art?: Artwork;
};

export type NowPlaying = {
  title: string;
  artist: string;
  album?: string;
  url?: string;
  art?: Artwork;
  /** True if it's playing right now; false = last played. */
  live: boolean;
  playedAt?: string;
};

export type ListeningStat = { label: string; value: string };

export type ListeningData = {
  source: ListeningSource;
  /** Human-readable window, e.g. "Last 30 days". */
  period: string;
  profileUrl?: string;
  nowPlaying: NowPlaying | null;
  topArtists: RankedItem[];
  topAlbums: RankedItem[];
  topTracks: RankedItem[];
  stats: ListeningStat[];
  updatedAt: string;
  /** Set when no provider is configured or the provider failed. */
  notice?: string;
};

/* ---- Song tracking (ported from the MizuMaiNichi logger) ---------------- */

/** One logged song: a unique (artist, track) for the day, enriched. */
export type LoggedSong = {
  title: string;
  artist: string;
  album?: string;
  url?: string;
  artistUrl?: string;
  art?: Artwork;
  loved?: boolean;
  /** ISO timestamp of the latest play that day. */
  playedAt?: string;
  /** Times it was scrobbled that day. */
  playsThatDay: number;
  /** Lifetime plays of this track on my account (enriched days only). */
  myPlays?: number;
  /** Global Last.fm listeners for the artist (enriched days only). */
  listeners?: number;
  /** Merged track + artist tags (enriched days only). */
  genres?: string[];
};

/** A day in the listening diary: up to five unique songs. */
export type LogDay = {
  /** YYYY-MM-DD in the log's time zone. */
  date: string;
  scrobbles: number;
  songs: LoggedSong[];
};

export type GenreSlice = { name: string; share: number };

export type ListeningLog = {
  source: ListeningSource;
  timeZone: string;
  days: LogDay[];
  /** Genre mix across the window, weighted by plays. */
  genres: GenreSlice[];
  updatedAt: string;
  notice?: string;
};

export type Recommendation = {
  title: string;
  artist: string;
  url?: string;
  listeners: number;
  score: number;
  /** "new discovery", "new track from a familiar artist", … */
  reason: string;
  /** The recently played artist that led here. */
  because?: string;
};

export type Recommendations = {
  source: ListeningSource;
  items: Recommendation[];
  seeds: string[];
  updatedAt: string;
  notice?: string;
};

export interface ListeningProvider {
  source: Exclude<ListeningSource, "none">;
  isConfigured(): boolean;
  fetch(): Promise<ListeningData>;
  /** Daily listening diary + genre mix. Optional per provider. */
  log?(): Promise<ListeningLog>;
  /** Recommendations seeded from recent listening. Optional per provider. */
  recommend?(): Promise<Recommendations>;
}

export const emptyLog = (notice: string): ListeningLog => ({
  source: "none",
  timeZone: "",
  days: [],
  genres: [],
  updatedAt: new Date().toISOString(),
  notice,
});

export const emptyRecommendations = (notice: string): Recommendations => ({
  source: "none",
  items: [],
  seeds: [],
  updatedAt: new Date().toISOString(),
  notice,
});

export const emptyListening = (notice: string): ListeningData => ({
  source: "none",
  period: "",
  nowPlaying: null,
  topArtists: [],
  topAlbums: [],
  topTracks: [],
  stats: [],
  updatedAt: new Date().toISOString(),
  notice,
});
