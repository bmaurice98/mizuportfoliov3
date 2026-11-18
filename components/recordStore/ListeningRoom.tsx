"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { isDoubleSided, sideOf, trackLength, trackNo, type RecordDef, type Side } from "@/util/records";
import { SleeveArt } from "./SleeveArt";
import { Turntable } from "./Turntable";
import { VinylDisc } from "./VinylDisc";
import { TrackBlocks } from "./TrackBlocks";

/* Track menu collapsed? Per-viewer preference, remembered in localStorage. */
const MENU_KEY = "rs_tracklist_collapsed";
const menuListeners = new Set<() => void>();
function readMenuCollapsed() {
  try {
    return localStorage.getItem(MENU_KEY) === "1";
  } catch {
    return false;
  }
}
function setMenuCollapsed(v: boolean) {
  try {
    localStorage.setItem(MENU_KEY, v ? "1" : "0");
  } catch {
    /* storage unavailable: still toggles for this page view below */
  }
  memo = v;
  menuListeners.forEach((l) => l());
}
let memo: boolean | null = null;
function useMenuCollapsed() {
  return useSyncExternalStore(
    (l) => {
      menuListeners.add(l);
      return () => menuListeners.delete(l);
    },
    () => (memo ??= readMenuCollapsed()),
    () => false,
  );
}

export type RoomStage = "hidden" | "deck" | "playing" | "listening" | "leaving";

/**
 * The listening state: the record's own room. Not a modal — it *is* the page
 * while a record is on the platter. Turntable + artwork stay anchored while
 * the tracks scroll beside (desktop) or below (mobile) them.
 */
export function ListeningRoom({
  record,
  stage,
  handoff,
  currentTrack,
  onTrack,
  onReturn,
  followTrack = null,
  followBar,
}: {
  record: RecordDef;
  stage: RoomStage;
  /** True while the transition stage is holding the artwork + vinyl. */
  handoff: boolean;
  currentTrack: number;
  onTrack: (index: number) => void;
  onReturn: () => void;
  /** In follow mode: the leader's current track, which we scroll to. */
  followTrack?: number | null;
  /** Who else is here / follow controls (real-time, optional). */
  followBar?: ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [paused, setPaused] = useState(false);
  const live = stage === "playing" || stage === "listening";
  const spinning = live && !paused;
  const headingId = `room-${record.id}-title`;

  // Move focus into the room once it's interactive.
  useEffect(() => {
    if (stage === "listening") titleRef.current?.focus({ preventScroll: true });
  }, [stage]);

  // Scroll-spy: the track nearest the top of the reading area is "playing".
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !live) return;
    const sections = Array.from(
      root.querySelectorAll<HTMLElement>("[data-track-index]"),
    );
    const visible = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.trackIndex);
          if (e.isIntersecting) visible.set(i, e.boundingClientRect.top);
          else visible.delete(i);
        }
        if (visible.size) onTrack(Math.min(...visible.keys()));
      },
      { root, rootMargin: "0px 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [live, record.id, onTrack]);

  const goToTrack = (i: number, focus = true) => {
    const el = scrollRef.current?.querySelector<HTMLElement>(
      `[data-track-index="${i}"]`,
    );
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollRef.current!.scrollTo({
      top: el.offsetTop - 8,
      behavior: reduce ? "auto" : "smooth",
    });
    onTrack(i);
    if (focus) el.focus({ preventScroll: true });
  };

  // Follow mode: when the leader changes track, so do we.
  const goRef = useRef(goToTrack);
  useEffect(() => {
    goRef.current = goToTrack;
  });
  useEffect(() => {
    if (followTrack == null || !live) return;
    if (followTrack >= record.tracks.length) return;
    goRef.current(followTrack, false);
  }, [followTrack, live, record.tracks.length]);

  const track = record.tracks[currentTrack] ?? record.tracks[0];
  const doubleSided = isDoubleSided(record);
  const menuCollapsed = useMenuCollapsed();
  const menuId = `${record.id}-tracklist`;
  const side = sideOf(track);
  const sides = (["A", "B"] as Side[])
    .map((s) => ({
      side: s,
      tracks: record.tracks
        .map((t, i) => ({ t, i }))
        .filter(({ t }) => sideOf(t) === s),
    }))
    .filter((g) => g.tracks.length);
  const lastSide = sides[sides.length - 1]?.side ?? "A";

  // Flip the disc over when playback crosses to the other side.
  const vinylRef = useRef<HTMLDivElement>(null);
  const prevSide = useRef(side);
  useEffect(() => {
    if (prevSide.current === side) return;
    prevSide.current = side;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    vinylRef.current?.animate(
      [
        { transform: "rotateY(0deg)" },
        { transform: "rotateY(90deg)", offset: 0.5 },
        { transform: "rotateY(0deg)" },
      ],
      { duration: 520, easing: "cubic-bezier(.45,0,.2,1)" },
    );
  }, [side]);

  return (
    <section
      className="rs-room"
      data-stage={stage}
      data-handoff={handoff || undefined}
      aria-labelledby={headingId}
      inert={!live}
    >
      <div className="rs-room-deck">
        <div className="rs-room-head">
          <div className="rs-room-artwork" data-slot="artwork">
            <span className="rs-sleeve">
              <SleeveArt record={record} />
              <span className="rs-sleeve-wear" />
            </span>
          </div>
          <div className="rs-room-meta">
            <p className="rs-kicker">
              {record.catalog} · {record.format} · {record.year}
            </p>
            <h2 id={headingId} ref={titleRef} tabIndex={-1} className="rs-room-title">
              {record.title}
            </h2>
            <p className="rs-room-desc">{record.description}</p>
          </div>
        </div>

        <div className="rs-room-turntable">
          <Turntable
            playing={spinning}
            armDown={spinning}
            label={record.title}
            onToggle={live ? () => setPaused((p) => !p) : undefined}
          >
            <div className="rs-room-vinyl" ref={vinylRef}>
              <VinylDisc record={record} spinning={spinning} side={side} />
            </div>
          </Turntable>
        </div>

        <div className="rs-now-playing">
          <span className="rs-eq" data-on={spinning} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <p aria-live="polite">
            <span className="rs-kicker">
              {spinning ? "Now playing" : "Paused"} ·{" "}
              {doubleSided ? `Side ${side} · ` : ""}Track {trackNo(record, currentTrack)}
            </span>
            <span className="rs-now-title">{track.title}</span>
          </p>
        </div>

        {followBar}

        <button type="button" className="rs-return" onClick={onReturn}>
          <Icon name="undo" />
          Return to the crates
          <kbd>Esc</kbd>
        </button>
      </div>

      <div className="rs-room-main">
        <nav
          className="rs-tracklist"
          aria-label={`${record.title} tracks`}
          data-collapsed={menuCollapsed || undefined}
        >
          <div className="rs-tracklist-bar">
            <p className="rs-kicker rs-tracklist-count">
              {menuCollapsed ? (
                <>
                  <span className="rs-tracklist-now">
                    {trackNo(record, currentTrack)} · {track.title}
                  </span>
                  <span aria-hidden="true"> · </span>
                  {record.tracks.length} tracks{doubleSided && " · 2 sides"}
                </>
              ) : (
                <>
                  Tracklist · {record.tracks.length} tracks{doubleSided && " · 2 sides"}
                </>
              )}
            </p>
            <button
              type="button"
              className="rs-tracklist-toggle"
              aria-expanded={!menuCollapsed}
              aria-controls={menuId}
              onClick={() => setMenuCollapsed(!menuCollapsed)}
            >
              {menuCollapsed ? "Show tracks" : "Hide tracks"}
              <Icon name={menuCollapsed ? "expand_more" : "expand_less"} />
            </button>
          </div>
          <div className="rs-tracklist-body" id={menuId} inert={menuCollapsed}>
          <div className="rs-tracklist-inner">
          <div className="rs-tracklist-sides">
            {sides.map((g) => (
              <div key={g.side} className="rs-tracklist-group" data-side={g.side}>
                <p className="rs-kicker rs-tracklist-side" id={`${record.id}-side-${g.side}`}>
                  Side {g.side}
                </p>
                <ol aria-labelledby={`${record.id}-side-${g.side}`}>
                  {g.tracks.map(({ t, i }) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => goToTrack(i)}
                        aria-current={i === currentTrack ? "true" : undefined}
                      >
                        <span className="rs-track-no">{trackNo(record, i)}</span>
                        <span className="rs-track-name">{t.title}</span>
                        <span className="rs-track-len">{trackLength(t)}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          </div>
          </div>
        </nav>

        <div ref={scrollRef} className="rs-room-scroll">
          {record.tracks.map((t, i) => (
            <Fragment key={t.id}>
            {doubleSided && i > 0 && sideOf(t) !== sideOf(record.tracks[i - 1]) && (
              <div className="rs-flip" role="separator" aria-label={`End of side ${sideOf(record.tracks[i - 1])}, side ${sideOf(t)} begins`}>
                <span className="rs-kicker">End of side {sideOf(record.tracks[i - 1])}</span>
                <span className="rs-flip-title">Flip the record · Side {sideOf(t)}</span>
              </div>
            )}
            <section
              className="rs-track"
              data-track-index={i}
              tabIndex={-1}
              aria-labelledby={`${record.id}-${t.id}`}
            >
              <header className="rs-track-head">
                <span className="rs-track-no">
                  {doubleSided ? `Side ${sideOf(t)} · ` : ""}Track {trackNo(record, i)}
                </span>
                <h3 id={`${record.id}-${t.id}`} className="rs-track-title">
                  {t.title}
                </h3>
              </header>
              <TrackBlocks blocks={t.blocks} />
            </section>
            </Fragment>
          ))}
          <footer className="rs-runout">
            <span className="rs-kicker">End of side {lastSide}</span>
            <button type="button" className="rs-action rs-action--ghost" onClick={onReturn}>
              Put it back and browse <Icon name="arrow_back" />
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
}
