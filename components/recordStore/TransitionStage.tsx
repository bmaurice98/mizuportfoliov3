"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { RecordDef } from "@/util/records";
import type { MachineEvent } from "./useRecordMachine";
import { SleeveArt } from "./SleeveArt";
import { VinylDisc, readRotation } from "./VinylDisc";

/**
 * The choreography layer. A fixed, non-interactive overlay that holds a
 * stand-in sleeve + vinyl and flies them between *measured* positions in the
 * real layouts (crate slot → hand-held → artwork slot / platter, and back).
 * At rest positions the stand-ins are visually identical to the real
 * elements, so swapping between them is invisible. No layout is animated;
 * everything is transform/opacity on a handful of elements.
 */

const S = 400; // intrinsic size of the stand-in sleeve / vinyl (px)
const VINYL_INSET = 0.04; // vinyl sits 4% inside the jacket
const PULL_OUT = -0.64; // vinyl slides out of the open (left) edge, towards the deck (× S)
const COVER_OPEN = 158; // deg — the jacket hinges on its right edge

type Rect = { x: number; y: number; w: number };
type Signal = AbortSignal;

const ease = {
  lift: "cubic-bezier(.3,.6,.2,1)",
  hinge: "cubic-bezier(.6,0,.3,1)",
  slide: "cubic-bezier(.5,0,.25,1)",
  carry: "cubic-bezier(.45,0,.2,1)",
};

const toRect = (el: Element | null): Rect | null => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width };
};
// Rotation is about the element centre; same function list in every keyframe
// so the browser can interpolate between them.
const tf = (r: Rect, rot = 0, lift = 0, grow = 1) =>
  `translate(${r.x}px, ${r.y - lift}px) scale(${(r.w / S) * grow}) ` +
  `translate(${S / 2}px, ${S / 2}px) rotate(${rot}deg) translate(${-S / 2}px, ${-S / 2}px)`;

/** Where the sleeve is held while it's opened: centre stage, nudged right so
 *  the disc comes out towards the turntable column. */
function presentRect(): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const mobile = vw < 768;
  const w = Math.min(mobile ? vw * 0.5 : vw * 0.34, vh * 0.42, 360);
  return {
    x: vw / 2 - w / 2 - w * PULL_OUT * (mobile ? 0.5 : 0.85),
    y: Math.max(96, vh / 2 - w / 2),
    w,
  };
}
const extractedVinylRect = (p: Rect): Rect => ({
  x: p.x + (VINYL_INSET + PULL_OUT) * p.w,
  y: p.y + VINYL_INSET * p.w,
  w: (1 - VINYL_INSET * 2) * p.w,
});

const wait = (ms: number, signal: Signal) =>
  new Promise<void>((res, rej) => {
    const id = setTimeout(res, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(id);
      rej(new DOMException("aborted", "AbortError"));
    });
  });
// One layout frame. Falls back to a timeout so a background tab (no rAF) never stalls the sequence.
const frame = () =>
  new Promise<void>((r) => {
    const id = setTimeout(r, 60);
    requestAnimationFrame(() => {
      clearTimeout(id);
      r();
    });
  });

export type StageMode = "in" | "out";

export function TransitionStage({
  mode,
  record,
  dispatch,
  onHandoff,
  onCrate,
  query,
}: {
  mode: StageMode;
  record: RecordDef;
  dispatch: (e: MachineEvent) => void;
  /** Stage has taken over the artwork + vinyl from the room (true) or released them. */
  onHandoff: (held: boolean) => void;
  /** Crate slot visibility: the stage took the sleeve out / put it back. */
  onCrate: (state: "out" | "settling") => void;
  query: (selector: string) => Element | null;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const innerVinylRef = useRef<HTMLDivElement>(null);
  const freeVinylRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});

  // Keep latest callbacks without restarting the sequence.
  const cb = useRef({ dispatch, onHandoff, onCrate, query });
  useLayoutEffect(() => {
    cb.current = { dispatch, onHandoff, onCrate, query };
  });

  useEffect(() => {
    const ctrl = new AbortController();
    const anims: Animation[] = [];
    const group = groupRef.current!;
    const cover = coverRef.current!;
    const inner = innerVinylRef.current!;
    const free = freeVinylRef.current!;

    const play = (
      el: HTMLElement,
      frames: Keyframe[],
      opts: KeyframeAnimationOptions,
    ) => {
      if (ctrl.signal.aborted) throw new DOMException("aborted", "AbortError");
      const a = el.animate(frames, { fill: "forwards", ...opts });
      anims.push(a);
      return a.finished;
    };
    const show = (el: HTMLElement, on: boolean) => {
      el.style.visibility = on ? "visible" : "hidden";
    };
    const set = (el: HTMLElement, transform: string) => {
      el.style.transform = transform;
    };

    const { dispatch: send } = cb.current;
    const q = (s: string) => cb.current.query(s);

    async function intro(signal: Signal) {
      // 1. PULLING — the crate lifts the sleeve out of the divider (CSS).
      await wait(340, signal);
      const from = toRect(q(`[data-crate-sleeve="${record.id}"] .rs-sleeve`));
      const present = presentRect();
      set(group, tf(from ?? present));
      set(cover, "rotateY(0deg)");
      show(group, true);
      cb.current.onCrate("out");
      cb.current.onHandoff(true);
      await play(
        group,
        [
          { transform: tf(from ?? present, 0) },
          { transform: tf(present, -4, 18, 1.02), offset: 0.7 },
          { transform: tf(present, 0) },
        ],
        { duration: 560, easing: ease.lift },
      );
      send({ type: "ADVANCE", from: "pulling-record" });

      // 2. OPENING — the jacket hinges open on its right edge.
      await play(
        cover,
        [{ transform: "rotateY(0deg)" }, { transform: `rotateY(${COVER_OPEN}deg)` }],
        { duration: 520, easing: ease.hinge },
      );
      send({ type: "ADVANCE", from: "opening-sleeve" });

      // 3. REMOVING — the vinyl slides out of its inner sleeve.
      await play(
        inner,
        [
          { transform: "translateX(0px)" },
          { transform: `translateX(${PULL_OUT * S}px)` },
        ],
        { duration: 560, easing: ease.slide },
      );
      send({ type: "ADVANCE", from: "removing-vinyl" });

      // 4. PLACING — carry the disc to the platter, set the sleeve aside.
      await frame();
      const vinylFrom = toRect(inner)!;
      const platter = toRect(q(".rs-room-vinyl"));
      const artwork = toRect(q('[data-slot="artwork"]'));
      set(free, tf(vinylFrom));
      show(free, true);
      show(inner, false);
      const carry = platter
        ? play(
            free,
            [
              { transform: tf(vinylFrom) },
              {
                transform: tf(
                  {
                    x: (vinylFrom.x + platter.x) / 2,
                    y: (vinylFrom.y + platter.y) / 2,
                    w: (vinylFrom.w + platter.w) / 2,
                  },
                  0,
                  36,
                  1.06,
                ),
                offset: 0.55,
              },
              { transform: tf(platter, 0, 0, 1.015), offset: 0.88 },
              { transform: tf(platter) },
            ],
            { duration: 760, easing: ease.carry },
          )
        : Promise.resolve();
      const aside = artwork
        ? play(group, [{ transform: tf(present) }, { transform: tf(artwork) }], {
            duration: 700,
            easing: ease.carry,
          })
        : Promise.resolve();
      const close = play(
        cover,
        [{ transform: `rotateY(${COVER_OPEN}deg)` }, { transform: "rotateY(0deg)" }],
        { duration: 480, delay: 120, easing: ease.hinge },
      );
      await Promise.all([carry, aside, close]);
      send({ type: "ADVANCE", from: "placing-vinyl" });
    }

    async function outro(signal: Signal) {
      // Let the platter coast down and the arm lift (room handles that).
      await wait(700, signal);
      const artwork = toRect(q('[data-slot="artwork"]'));
      const vinylEl = q(".rs-room-vinyl");
      const platter = toRect(vinylEl);
      const angle = readRotation(vinylEl);
      const present = presentRect();
      const out = extractedVinylRect(present);
      if (!artwork || !platter) {
        send({ type: "ADVANCE", from: "returning" });
        return;
      }
      set(group, tf(artwork));
      set(cover, "rotateY(0deg)");
      set(inner, `translateX(${PULL_OUT * S}px)`);
      set(free, tf(platter, angle));
      show(group, true);
      show(inner, false);
      show(free, true);
      cb.current.onHandoff(true);

      // Lift the disc off the platter, bring the sleeve back, open it.
      const spinTo = angle > 0 ? 360 : 0;
      await Promise.all([
        play(
          free,
          [
            { transform: tf(platter, angle) },
            { transform: tf(platter, angle + (spinTo - angle) * 0.3, 30, 1.05), offset: 0.4 },
            { transform: tf(out, spinTo) },
          ],
          { duration: 640, easing: ease.carry },
        ),
        play(group, [{ transform: tf(artwork) }, { transform: tf(present) }], {
          duration: 600,
          easing: ease.carry,
        }),
        play(
          cover,
          [{ transform: "rotateY(0deg)" }, { transform: `rotateY(${COVER_OPEN}deg)` }],
          { duration: 480, delay: 120, easing: ease.hinge },
        ),
      ]);

      // Slide it home.
      show(inner, true);
      show(free, false);
      await play(
        inner,
        [
          { transform: `translateX(${PULL_OUT * S}px)` },
          { transform: "translateX(0px)" },
        ],
        { duration: 460, easing: ease.slide },
      );
      await play(
        cover,
        [{ transform: `rotateY(${COVER_OPEN}deg)` }, { transform: "rotateY(0deg)" }],
        { duration: 380, easing: ease.hinge },
      );

      // File it back in the crate.
      const btn = q(`[data-crate-sleeve="${record.id}"]`);
      btn?.scrollIntoView({ inline: "center", block: "nearest", behavior: "instant" });
      await frame();
      const slot = toRect(btn?.querySelector(".rs-sleeve") ?? null);
      if (slot) {
        await play(
          group,
          [
            { transform: tf(present) },
            { transform: tf(slot, 3, 14, 1.02), offset: 0.6 },
            { transform: tf(slot) },
          ],
          { duration: 540, easing: ease.lift },
        );
      }
      cb.current.onCrate("settling");
      send({ type: "ADVANCE", from: "returning" });
    }

    skipRef.current = () => {
      ctrl.abort();
      if (mode === "in") cb.current.dispatch({ type: "SKIP" });
      else {
        cb.current.onCrate("settling");
        cb.current.dispatch({ type: "ADVANCE", from: "returning" });
      }
    };

    (mode === "in" ? intro : outro)(ctrl.signal).catch((err) => {
      if (err?.name !== "AbortError") {
        console.error(err);
        // Never strand the visitor mid-transition.
        cb.current.dispatch(mode === "in" ? { type: "SKIP" } : { type: "ADVANCE", from: "returning" });
      }
    });

    return () => {
      ctrl.abort();
      anims.forEach((a) => a.cancel());
      cb.current.onHandoff(false);
    };
    // The sequence runs once per mount; the parent remounts us per transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="rs-stage" aria-hidden="true">
        <div
          ref={groupRef}
          className="rs-stage-sleeve"
          style={{ width: S, height: S, visibility: "hidden" }}
        >
          <div className="rs-jacket-back" />
          <div ref={innerVinylRef} className="rs-stage-vinyl-in">
            <VinylDisc record={record} />
          </div>
          <div className="rs-inner-sleeve" />
          <div ref={coverRef} className="rs-cover">
            <div className="rs-cover-front">
              <span className="rs-sleeve">
                <SleeveArt record={record} />
                <span className="rs-sleeve-wear" />
              </span>
            </div>
            <div className="rs-cover-inside" />
          </div>
        </div>
        <div
          ref={freeVinylRef}
          className="rs-stage-vinyl-free"
          style={{ width: S, height: S, visibility: "hidden" }}
        >
          <VinylDisc record={record} />
        </div>
      </div>
      <button
        type="button"
        className="rs-skip"
        onClick={() => skipRef.current()}
      >
        Skip <span aria-hidden="true">⏭</span>
      </button>
    </>
  );
}
