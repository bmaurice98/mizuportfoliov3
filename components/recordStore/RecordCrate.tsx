"use client";

import { Fragment, useEffect, useRef } from "react";
import { groupByDivider, type RecordDef } from "@/util/records";
import { SleeveArt } from "./SleeveArt";
import type { Listener } from "@/components/realtime/listening";

export type CrateSlotState = "rest" | "pulling" | "out" | "settling";

/**
 * The browsable collection: sleeves filed behind cardboard dividers inside a
 * wooden crate. Horizontal scrolling via wheel, trackpad, click-drag, touch
 * swipe and arrow keys (roving tabindex).
 */
export function RecordCrate({
  records,
  activeId,
  selectedId,
  slotState,
  listeners = {},
  onActivate,
  onSelect,
  disabled,
}: {
  records: RecordDef[];
  activeId: string;
  selectedId: string | null;
  slotState: CrateSlotState;
  /** Other visitors currently playing each record (by record id). */
  listeners?: Record<string, Listener[]>;
  onActivate: (id: string) => void;
  onSelect: (id: string) => void;
  disabled: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const groups = groupByDivider(records);
  const order = records.map((r) => r.id);

  // Vertical wheel → horizontal browse (only while the crate can still move).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || e.ctrlKey) return;
      const max = el.scrollWidth - el.clientWidth;
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = el.scrollLeft >= max - 1 && e.deltaY > 0;
      if (max <= 0 || atStart || atEnd) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Touch: whichever sleeve settles in the middle after a swipe is the one
  // being looked at (feeds the shelf-talker card).
  const activateRef = useRef(onActivate);
  useEffect(() => {
    activateRef.current = onActivate;
  });
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !window.matchMedia("(pointer: coarse)").matches) return;
    let t = 0;
    const settle = () => {
      const mid = el.getBoundingClientRect().left + el.clientWidth / 2;
      let best: { id: string; d: number } | null = null;
      el.querySelectorAll<HTMLElement>("[data-crate-sleeve]").forEach((b) => {
        const r = b.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (!best || d < best.d) best = { id: b.dataset.crateSleeve!, d };
      });
      if (best) activateRef.current((best as { id: string }).id);
    };
    const onScroll = () => {
      window.clearTimeout(t);
      t = window.setTimeout(settle, 120);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Click-and-drag with a mouse. Touch keeps native momentum scrolling.
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = scrollerRef.current!;
    drag.current = { down: true, x: e.clientX, left: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      scrollerRef.current!.setPointerCapture(e.pointerId);
      scrollerRef.current!.dataset.dragging = "true";
    }
    if (d.moved) scrollerRef.current!.scrollLeft = d.left - dx;
  };
  const endDrag = (e: React.PointerEvent) => {
    const el = scrollerRef.current!;
    drag.current.down = false;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    delete el.dataset.dragging;
  };
  // Swallow the click that ends a drag so it doesn't select a record.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.stopPropagation();
      e.preventDefault();
      drag.current.moved = false;
    }
  };

  const focusRecord = (id: string) => {
    const btn = scrollerRef.current?.querySelector<HTMLButtonElement>(
      `[data-crate-sleeve="${id}"]`,
    );
    btn?.focus({ preventScroll: true });
    btn?.scrollIntoView({ inline: "center", block: "nearest", behavior: smooth() });
    onActivate(id);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Navigate from the focused sleeve (the mouse may have moved the highlight).
    const focused = (e.target as HTMLElement).closest<HTMLElement>("[data-crate-sleeve]")
      ?.dataset.crateSleeve;
    const i = order.indexOf(focused ?? activeId);
    let next: string | undefined;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[Math.min(order.length - 1, i + 1)];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[Math.max(0, i - 1)];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next) {
      e.preventDefault();
      focusRecord(next);
    }
  };

  return (
    <div
      ref={scrollerRef}
      className="rs-crate-scroller"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      onKeyDown={onKeyDown}
    >
      <div className="rs-crate-inner">
      <ul className="rs-crate-track" aria-label="Record collection">
        {groups.map((g) => (
          <Fragment key={g.divider}>
            <li className="rs-crate-item rs-crate-item--divider" aria-hidden="true">
              <div className="rs-divider">
                <span className="rs-divider-tab">{g.divider}</span>
                <span className="rs-divider-face">{g.divider}</span>
              </div>
            </li>
            {g.records.map((r) => {
              const isSel = r.id === selectedId;
              const state: CrateSlotState = isSel ? slotState : "rest";
              const playing = listeners[r.id] ?? [];
              const playingLabel = playing.length
                ? ` ${playing.length} other ${playing.length === 1 ? "visitor is" : "visitors are"} playing it.`
                : "";
              return (
                <li
                  key={r.id}
                  className="rs-crate-item"
                  data-state={state}
                  data-active={r.id === activeId || undefined}
                >
                  <button
                    type="button"
                    className="rs-sleeve-btn"
                    data-crate-sleeve={r.id}
                    tabIndex={r.id === activeId ? 0 : -1}
                    disabled={disabled}
                    aria-label={`${r.title} — ${r.format}, filed under ${r.divider}. ${r.description}${playingLabel} Play this record.`}
                    onClick={() => onSelect(r.id)}
                    onFocus={() => onActivate(r.id)}
                    onMouseEnter={() => onActivate(r.id)}
                  >
                    <span className="rs-sleeve">
                      <SleeveArt record={r} />
                      <span className="rs-sleeve-wear" />
                    </span>
                  </button>
                  {playing.length > 0 && (
                    <span className="rs-marker" aria-hidden="true">
                      <span className="rs-marker-disc" />
                      {playing.slice(0, 4).map((l) => (
                        <span key={l.id} className="rs-who-dot" style={{ background: l.color }} />
                      ))}
                      <span className="rs-marker-count">{playing.length}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </Fragment>
        ))}
        <li className="rs-crate-item rs-crate-item--end" aria-hidden="true">
          <div className="rs-divider rs-divider--end">
            <span className="rs-divider-tab">More soon</span>
          </div>
        </li>
      </ul>
      <div className="rs-crate-front" aria-hidden="true">
        <span className="rs-crate-stencil">DEV·MIZU RECORDS — NEW &amp; USED</span>
      </div>
      </div>
    </div>
  );
}

function smooth(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}
