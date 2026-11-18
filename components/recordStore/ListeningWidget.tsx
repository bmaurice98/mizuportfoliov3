"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ListeningView } from "@/util/records";
import type { ListeningData, RankedItem } from "@/util/listening/types";

/**
 * Heavy Rotation widgets. All views share one request to /api/listening per
 * page load; until a provider is configured they show a skeleton plus a note.
 */

let pending: Promise<ListeningData | null> | null = null;
function loadListening() {
  pending ??= fetch("/api/listening")
    .then((r) => (r.ok ? (r.json() as Promise<ListeningData>) : null))
    .catch(() => null);
  return pending;
}

function useListening() {
  const [data, setData] = useState<ListeningData | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    loadListening().then((d) => live && setData(d));
    return () => {
      live = false;
    };
  }, []);
  return data;
}

const SOURCE_LABEL = { lastfm: "Last.fm", spotify: "Spotify", none: "" } as const;

export function ListeningWidget({ view }: { view: ListeningView }) {
  const data = useListening();
  const loading = data === undefined;
  const connected = !!data && data.source !== "none";

  return (
    <div className="rs-listen" aria-busy={loading}>
      {!loading && !connected && (
        <p className="rs-note rs-listen-note">
          {data?.notice ?? "Couldn't load listening stats."}
        </p>
      )}
      {view === "now-playing" && <NowPlayingView data={connected ? data : null} />}
      {view === "top-artists" && <Ranked items={connected ? data.topArtists : null} round />}
      {view === "top-albums" && <Ranked items={connected ? data.topAlbums : null} />}
      {view === "top-tracks" && <Ranked items={connected ? data.topTracks : null} list />}
      {view === "stats" && <StatsView data={connected ? data : null} />}
      {connected && (
        <p className="rs-listen-source">
          {data.period && <>{data.period} · </>}
          via{" "}
          {data.profileUrl ? (
            <a href={data.profileUrl} target="_blank" rel="noreferrer">
              {SOURCE_LABEL[data.source]}
            </a>
          ) : (
            SOURCE_LABEL[data.source]
          )}
        </p>
      )}
    </div>
  );
}

function Art({ art, round }: { art?: RankedItem["art"]; round?: boolean }) {
  return (
    <span className="rs-listen-art" data-round={round || undefined}>
      {art ? (
        <Image src={art.src} alt={art.alt} width={300} height={300} loading="lazy" unoptimized />
      ) : (
        <span className="rs-listen-art-blank" aria-hidden="true" />
      )}
    </span>
  );
}

function Ranked({
  items,
  round,
  list,
}: {
  items: RankedItem[] | null;
  round?: boolean;
  list?: boolean;
}) {
  if (!items) {
    return (
      <ol className={list ? "rs-chart" : "rs-crate-grid"} aria-hidden="true">
        {Array.from({ length: list ? 6 : 8 }, (_, i) => (
          <li key={i} className="rs-skeleton-item">
            {!list && <Art round={round} />}
            <span className="rs-skeleton-line" />
            <span className="rs-skeleton-line rs-skeleton-line--short" />
          </li>
        ))}
      </ol>
    );
  }
  if (!items.length) return <p className="rs-note">Nothing in rotation for this period.</p>;

  if (list) {
    return (
      <ol className="rs-chart">
        {items.map((t, i) => (
          <li key={`${t.name}-${t.by}`}>
            <span className="rs-chart-no">{String(i + 1).padStart(2, "0")}</span>
            <span className="rs-chart-name">
              {t.url ? (
                <a href={t.url} target="_blank" rel="noreferrer">
                  {t.name}
                </a>
              ) : (
                t.name
              )}
              {t.by && <span className="rs-chart-by">{t.by}</span>}
            </span>
            {t.plays != null && <span className="rs-chart-plays">{t.plays} plays</span>}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className="rs-crate-grid">
      {items.map((t, i) => (
        <li key={`${t.name}-${t.by}`}>
          <a href={t.url} target="_blank" rel="noreferrer" className="rs-grid-card">
            <Art art={t.art} round={round} />
            <span className="rs-grid-name">
              <span className="rs-chart-no">{String(i + 1).padStart(2, "0")}</span> {t.name}
            </span>
            {t.by && <span className="rs-chart-by">{t.by}</span>}
            {t.plays != null && <span className="rs-chart-plays">{t.plays} plays</span>}
          </a>
        </li>
      ))}
    </ol>
  );
}

function NowPlayingView({ data }: { data: ListeningData | null }) {
  const np = data?.nowPlaying;
  return (
    <div className="rs-np">
      <Art art={np?.art} />
      <div className="rs-np-text">
        <span className="rs-kicker">
          {np ? (np.live ? "Playing right now" : "Last played") : "Now playing"}
        </span>
        {np ? (
          <>
            <span className="rs-np-title">
              {np.url ? (
                <a href={np.url} target="_blank" rel="noreferrer">
                  {np.title}
                </a>
              ) : (
                np.title
              )}
            </span>
            <span className="rs-chart-by">
              {np.artist}
              {np.album && ` · ${np.album}`}
            </span>
          </>
        ) : (
          <>
            <span className="rs-skeleton-line" />
            <span className="rs-skeleton-line rs-skeleton-line--short" />
          </>
        )}
      </div>
    </div>
  );
}

function StatsView({ data }: { data: ListeningData | null }) {
  const stats = data?.stats ?? null;
  return (
    <dl className="rs-statgrid">
      {(stats ?? Array.from({ length: 4 }, () => null)).map((s, i) => (
        <div key={s?.label ?? i} className="rs-statcell">
          <dt className="rs-kicker">{s?.label ?? <span className="rs-skeleton-line rs-skeleton-line--short" />}</dt>
          <dd className="rs-stat-value">{s?.value ?? <span className="rs-skeleton-line" />}</dd>
        </div>
      ))}
    </dl>
  );
}
