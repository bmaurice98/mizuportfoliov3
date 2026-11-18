"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import type { ListeningView } from "@/util/records";
import type {
  ListeningData,
  ListeningLog,
  LogDay,
  RankedItem,
  Recommendations,
} from "@/util/listening/types";

/**
 * Heavy Rotation widgets. All views share one request to /api/listening per
 * page load; until a provider is configured they show a skeleton plus a note.
 */

// One in-flight/settled request per endpoint, shared by every view on the page.
const requests = new Map<string, Promise<unknown>>();
function load<T>(url: string): Promise<T | null> {
  if (!requests.has(url)) {
    requests.set(
      url,
      fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    );
  }
  return requests.get(url) as Promise<T | null>;
}

/** undefined = loading, null = failed. */
function useEndpoint<T>(url: string | null) {
  const [data, setData] = useState<{ url: string; value: T | null } | undefined>(undefined);
  useEffect(() => {
    if (!url) return;
    let live = true;
    load<T>(url).then((value) => live && setData({ url, value }));
    return () => {
      live = false;
    };
  }, [url]);
  return data && data.url === url ? data.value : undefined;
}

const ENDPOINT: Record<ListeningView, string> = {
  "now-playing": "/api/listening",
  "top-artists": "/api/listening",
  "top-albums": "/api/listening",
  "top-tracks": "/api/listening",
  stats: "/api/listening",
  "daily-log": "/api/listening/log",
  genres: "/api/listening/log",
  recommendations: "/api/listening/recommend",
};

const plays = (n: number) => `${n.toLocaleString("en-US")} ${n === 1 ? "play" : "plays"}`;
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

const SOURCE_LABEL = { lastfm: "Last.fm", spotify: "Spotify", none: "" } as const;

export function ListeningWidget({ view }: { view: ListeningView }) {
  if (view === "daily-log" || view === "genres") return <LogWidget view={view} />;
  if (view === "recommendations") return <RecommendWidget />;
  return <StatsWidget view={view} />;
}

/** Shared frame: loading state, "not connected" note, source credit. */
function Frame({
  data,
  children,
  credit,
}: {
  data: { source: ListeningData["source"]; notice?: string } | null | undefined;
  children: ReactNode;
  credit?: ReactNode;
}) {
  const loading = data === undefined;
  const connected = !!data && data.source !== "none";
  return (
    <div className="rs-listen" aria-busy={loading}>
      {!loading && !connected && (
        <p className="rs-note rs-listen-note">{data?.notice ?? "Couldn't load listening stats."}</p>
      )}
      {children}
      {connected && credit && <p className="rs-listen-source">{credit}</p>}
    </div>
  );
}

function StatsWidget({ view }: { view: ListeningView }) {
  const data = useEndpoint<ListeningData>(ENDPOINT[view]);
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
            {t.plays != null && <span className="rs-chart-plays">{plays(t.plays)}</span>}
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
            {t.plays != null && <span className="rs-chart-plays">{plays(t.plays)}</span>}
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

/* ------------------------------------------------------------------ */
/* Song tracking (MizuMaiNichi)                                        */
/* ------------------------------------------------------------------ */

function LogWidget({ view }: { view: "daily-log" | "genres" }) {
  const data = useEndpoint<ListeningLog>(ENDPOINT[view]);
  const log = data && data.source !== "none" ? data : null;
  return (
    <Frame data={data} credit={<>Last {log?.days.length ?? 0} days · via Last.fm</>}>
      {view === "daily-log" ? <DailyLog log={log} /> : <GenreMix log={log} />}
    </Frame>
  );
}

function dayLabel(date: string, timeZone: string) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  const now = new Date();
  if (today.format(now) === date) return "Today";
  if (today.format(new Date(now.getTime() - 86400000)) === date) return "Yesterday";
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function DailyLog({ log }: { log: ListeningLog | null }) {
  if (!log) {
    return (
      <ol className="rs-chart" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="rs-skeleton-item">
            <span className="rs-skeleton-line" />
            <span className="rs-skeleton-line rs-skeleton-line--short" />
          </li>
        ))}
      </ol>
    );
  }
  if (!log.days.length) return <p className="rs-note">Nothing scrobbled this week.</p>;

  const [latest, ...older] = log.days;
  return (
    <div className="rs-daylog">
      <Day day={latest} tz={log.timeZone} detailed />
      {older.map((d) => (
        <details key={d.date} className="rs-daylog-older">
          <summary>
            <span className="rs-daylog-date">{dayLabel(d.date, log.timeZone)}</span>
            <span className="rs-chart-plays">
              {d.songs.length} songs · {d.scrobbles} scrobbles
            </span>
          </summary>
          <Day day={d} tz={log.timeZone} />
        </details>
      ))}
    </div>
  );
}

function Day({ day, tz, detailed }: { day: LogDay; tz: string; detailed?: boolean }) {
  return (
    <section className="rs-daylog-day" aria-label={dayLabel(day.date, tz)}>
      {detailed && (
        <header className="rs-daylog-head">
          <span className="rs-daylog-date">{dayLabel(day.date, tz)}</span>
          <span className="rs-chart-plays">{day.scrobbles} scrobbles</span>
        </header>
      )}
      <ol className="rs-logsongs">
        {day.songs.map((s, i) => (
          <li key={`${s.artist}-${s.title}`} className="rs-logsong" data-detailed={detailed || undefined}>
            {detailed && <Art art={s.art} />}
            <div className="rs-logsong-text">
              <span className="rs-chart-name">
                <span>
                  <span className="rs-chart-no">{String(i + 1).padStart(2, "0")}</span>{" "}
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noreferrer">
                      {s.title}
                    </a>
                  ) : (
                    s.title
                  )}
                  {s.loved && (
                    <span className="rs-loved" title="Loved on Last.fm">
                      {" "}♥<span className="sr-only"> loved</span>
                    </span>
                  )}
                </span>
                <span className="rs-chart-by">
                  {s.artist}
                  {s.album && ` · ${s.album}`}
                </span>
              </span>
              {detailed && s.genres?.length ? (
                <ul className="rs-chips rs-chips--sm">
                  {s.genres.map((g) => (
                    <li key={g} className="rs-chip">
                      {g}
                    </li>
                  ))}
                </ul>
              ) : null}
              <span className="rs-chart-plays rs-logsong-meta">
                {s.playsThatDay > 1 && <span>×{s.playsThatDay} that day</span>}
                {s.myPlays != null && <span>{plays(s.myPlays)} all-time</span>}
                {s.listeners != null && <span>{compact.format(s.listeners)} listeners</span>}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function GenreMix({ log }: { log: ListeningLog | null }) {
  const rows = log?.genres ?? null;
  if (rows && !rows.length) return <p className="rs-note">No genre tags for this week yet.</p>;
  return (
    <ol className="rs-genres" aria-hidden={!rows || undefined}>
      {(rows ?? Array.from({ length: 6 }, () => null)).map((g, i) => (
        <li key={g?.name ?? i} className="rs-genre">
          <span className="rs-genre-name">{g?.name ?? <span className="rs-skeleton-line rs-skeleton-line--short" />}</span>
          <span className="rs-genre-bar" aria-hidden="true">
            <span style={{ width: `${g ? Math.max(4, (g.share / (rows?.[0]?.share || 1)) * 100) : 30}%` }} />
          </span>
          <span className="rs-chart-plays">{g ? `${Math.round(g.share * 100)}%` : ""}</span>
        </li>
      ))}
    </ol>
  );
}

function RecommendWidget() {
  const data = useEndpoint<Recommendations>(ENDPOINT.recommendations);
  const recs = data && data.source !== "none" ? data : null;
  return (
    <Frame
      data={data}
      credit={
        <>
          Seeded from {recs?.seeds.length ? recs.seeds.join(", ") : "recent plays"} · scored like MizuMaiNichi
        </>
      }
    >
      {!recs ? (
        <ol className="rs-chart" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="rs-skeleton-item">
              <span className="rs-skeleton-line" />
              <span className="rs-skeleton-line rs-skeleton-line--short" />
            </li>
          ))}
        </ol>
      ) : !recs.items.length ? (
        <p className="rs-note">No picks right now — check back after a few more plays.</p>
      ) : (
        <ol className="rs-chart rs-recs">
          {recs.items.map((r, i) => (
            <li key={`${r.artist}-${r.title}`}>
              <span className="rs-chart-no">{String(i + 1).padStart(2, "0")}</span>
              <span className="rs-chart-name">
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.title}
                  </a>
                ) : (
                  r.title
                )}
                <span className="rs-chart-by">
                  {r.artist}
                  {r.because && <> · because I played {r.because}</>}
                </span>
                <span className="rs-rec-reason">{r.reason}</span>
              </span>
              <span className="rs-chart-plays">{compact.format(r.listeners)} listeners</span>
            </li>
          ))}
        </ol>
      )}
    </Frame>
  );
}
