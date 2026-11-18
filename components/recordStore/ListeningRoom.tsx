"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { trackLength, type RecordDef } from "@/util/records";
import { SleeveArt } from "./SleeveArt";
import { Turntable } from "./Turntable";
import { VinylDisc } from "./VinylDisc";
import { TrackBlocks } from "./TrackBlocks";

export type RoomStage = "hidden" | "deck" | "playing" | "listening" | "leaving";

const pad = (n: number) => String(n + 1).padStart(2, "0");

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
}: {
  record: RecordDef;
  stage: RoomStage;
  /** True while the transition stage is holding the artwork + vinyl. */
  handoff: boolean;
  currentTrack: number;
  onTrack: (index: number) => void;
  onReturn: () => void;
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

  const goToTrack = (i: number) => {
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
    el.focus({ preventScroll: true });
  };

  const track = record.tracks[currentTrack] ?? record.tracks[0];

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
            <div className="rs-room-vinyl">
              <VinylDisc record={record} spinning={spinning} />
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
              {spinning ? "Now playing" : "Paused"} · Track {pad(currentTrack)}
            </span>
            <span className="rs-now-title">{track.title}</span>
          </p>
        </div>

        <button type="button" className="rs-return" onClick={onReturn}>
          <Icon name="undo" />
          Return to the crates
          <kbd>Esc</kbd>
        </button>
      </div>

      <div className="rs-room-main">
        <nav className="rs-tracklist" aria-label={`${record.title} tracks`}>
          <p className="rs-kicker rs-tracklist-side">Side A</p>
          <ol>
            {record.tracks.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => goToTrack(i)}
                  aria-current={i === currentTrack ? "true" : undefined}
                >
                  <span className="rs-track-no">{pad(i)}</span>
                  <span className="rs-track-name">{t.title}</span>
                  <span className="rs-track-len">{trackLength(t)}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div ref={scrollRef} className="rs-room-scroll">
          {record.tracks.map((t, i) => (
            <section
              key={t.id}
              className="rs-track"
              data-track-index={i}
              tabIndex={-1}
              aria-labelledby={`${record.id}-${t.id}`}
            >
              <header className="rs-track-head">
                <span className="rs-track-no">Track {pad(i)}</span>
                <h3 id={`${record.id}-${t.id}`} className="rs-track-title">
                  {t.title}
                </h3>
              </header>
              <TrackBlocks blocks={t.blocks} />
            </section>
          ))}
          <footer className="rs-runout">
            <span className="rs-kicker">End of side A</span>
            <button type="button" className="rs-action rs-action--ghost" onClick={onReturn}>
              Put it back and browse <Icon name="arrow_back" />
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
}
