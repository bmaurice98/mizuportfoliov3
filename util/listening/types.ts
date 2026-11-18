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

export interface ListeningProvider {
  source: Exclude<ListeningSource, "none">;
  isConfigured(): boolean;
  fetch(): Promise<ListeningData>;
}

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
