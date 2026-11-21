"use client";

import { useCallback, useEffect, useMemo, useRef, type PointerEvent as ReactPointerEvent } from "react";
import type { RecordDef } from "@/util/records";

const REV_MS = 1800; // 33⅓ rpm

/**
 * A vinyl disc: grooves + centre label rotate, the light sheen does not.
 * Spinning uses one Web Animation whose playbackRate is ramped, so the platter
 * spins up and coasts down like a real motor instead of snapping.
 *
 * With `spinnable`, the disc can also be grabbed and spun by hand (purely
 * cosmetic). The hand's rotation lives on its own layer (.rs-vinyl-hand)
 * so it composes with the motor animation instead of fighting it.
 */
export function VinylDisc({
  record,
  spinning = false,
  side = "A",
  className = "",
  spinnable = false,
}: {
  record: RecordDef;
  spinning?: boolean;
  side?: "A" | "B";
  className?: string;
  /** Let the visitor drag the record round (listening room only). */
  spinnable?: boolean;
}) {
  const discRef = useRef<HTMLDivElement>(null);
  const motor = useSpin(discRef, spinning);
  const handRef = useRef<HTMLDivElement>(null);
  const handlers = useHandSpin(handRef, motor);
  const { paper, ink, accent } = record.palette;

  return (
    <div
      className={`rs-vinyl ${className}`}
      aria-hidden="true"
      data-spinnable={spinnable || undefined}
      {...(spinnable ? handlers : {})}
    >
      <div ref={handRef} className="rs-vinyl-hand">
      <div ref={discRef} className="rs-vinyl-disc">
        <div
          className="rs-vinyl-label"
          style={{ background: accent, color: labelInk(accent, ink, paper) }}
        >
          <span className="rs-vinyl-label-title">{record.title}</span>
          <span className="rs-vinyl-label-meta">
            {record.artist} · {record.catalog}
          </span>
          <span className="rs-vinyl-label-rpm">33⅓ RPM · SIDE {side}</span>
          <span className="rs-vinyl-hole" />
        </div>
      </div>
      </div>
      <div className="rs-vinyl-sheen" />
    </div>
  );
}

function labelInk(bg: string, a: string, b: string) {
  return contrast(bg, a) >= contrast(bg, b) ? a : b;
}
function lum(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    })
    .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0);
}
function contrast(x: string, y: string) {
  const [a, b] = [lum(x), lum(y)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type Motor = {
  /** A hand is on the record: stop the motor driving it. */
  hold(): void;
  /** Hand lifted: the motor takes over again (spins back up if playing). */
  release(): void;
};

function useSpin(
  ref: React.RefObject<HTMLDivElement | null>,
  spinning: boolean,
): Motor {
  const animRef = useRef<Animation | null>(null);
  const rampRef = useRef(0);
  const spinningRef = useRef(spinning);
  const heldRef = useRef(false);

  /** Ramp the motor's playbackRate to `to` over `dur` ms. */
  const rampTo = useCallback((to: number, dur: number, easeOut: number) => {
    const anim = animRef.current;
    if (!anim) return;
    cancelAnimationFrame(rampRef.current);
    const from = anim.playbackRate;
    const t0 = performance.now();
    if (to > 0) anim.play();
    const step = (t: number) => {
      const u = Math.min(1, (t - t0) / dur);
      anim.playbackRate = from + (to - from) * (1 - Math.pow(1 - u, easeOut));
      if (u < 1) rampRef.current = requestAnimationFrame(step);
      else if (to === 0) anim.pause();
    };
    rampRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    spinningRef.current = spinning;
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    if (spinning && !animRef.current) {
      const anim = el.animate(
        [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
        { duration: REV_MS, iterations: Infinity },
      );
      anim.playbackRate = 0;
      animRef.current = anim;
    }
    // While a hand holds the record the motor stays off; release() resumes.
    if (heldRef.current) return;
    rampTo(spinning ? 1 : 0, spinning ? 1100 : 900, spinning ? 2 : 3);
    return () => cancelAnimationFrame(rampRef.current);
  }, [spinning, ref, rampTo]);

  // Don't burn frames in a background tab.
  useEffect(() => {
    const onVis = () => {
      const anim = animRef.current;
      if (!anim) return;
      if (document.hidden) anim.pause();
      else if (anim.playbackRate > 0) anim.play();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      animRef.current?.cancel();
      animRef.current = null;
    };
  }, []);

  return useMemo<Motor>(() => ({
    hold() {
      heldRef.current = true;
      cancelAnimationFrame(rampRef.current);
      const anim = animRef.current;
      if (anim) {
        anim.playbackRate = 0;
        anim.pause();
      }
    },
    release() {
      heldRef.current = false;
      // A spinning platter drags the record back up to speed quickly.
      if (spinningRef.current) rampTo(1, 650, 2);
    },
  }), [rampTo]);
}

/* ------------------------------------------------------------------ */
/* Spinning by hand                                                    */
/* ------------------------------------------------------------------ */

/** Velocity decay per millisecond after a fling (lower = longer coast). */
const FRICTION = 0.0028;
/** Faster than this (deg/ms) and a fling is clamped — ~6 turns a second. */
const MAX_VELOCITY = 2.2;

function useHandSpin(ref: React.RefObject<HTMLDivElement | null>, motor: Motor) {
  const state = useRef({
    angle: 0,
    pointer: -1,
    last: 0,
    lastT: 0,
    velocity: 0,
    raf: 0,
  });

  const apply = () => {
    if (ref.current) ref.current.style.transform = `rotate(${state.current.angle}deg)`;
  };

  /** Pointer angle (deg) around the disc's centre. */
  const angleOf = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  const coast = () => {
    const s = state.current;
    let prev = performance.now();
    const step = (t: number) => {
      const dt = Math.min(64, t - prev);
      prev = t;
      s.angle += s.velocity * dt;
      s.velocity *= Math.exp(-FRICTION * dt);
      apply();
      if (Math.abs(s.velocity) > 0.004) s.raf = requestAnimationFrame(step);
      else motor.release();
    };
    s.raf = requestAnimationFrame(step);
  };

  useEffect(() => () => cancelAnimationFrame(state.current.raf), []);

  return {
    onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
      if (e.button !== 0 || state.current.pointer !== -1) return;
      const s = state.current;
      cancelAnimationFrame(s.raf);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone; the drag still works while over the disc */
      }
      s.pointer = e.pointerId;
      s.last = angleOf(e);
      s.lastT = e.timeStamp;
      s.velocity = 0;
      motor.hold();
    },
    onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
      const s = state.current;
      if (e.pointerId !== s.pointer) return;
      const a = angleOf(e);
      let d = a - s.last;
      if (d > 180) d -= 360;
      else if (d < -180) d += 360;
      const dt = Math.max(1, e.timeStamp - s.lastT);
      s.angle += d;
      // Smoothed so one jittery sample doesn't decide the fling.
      s.velocity = s.velocity * 0.6 + (d / dt) * 0.4;
      s.last = a;
      s.lastT = e.timeStamp;
      apply();
    },
    onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
      const s = state.current;
      if (e.pointerId !== s.pointer) return;
      s.pointer = -1;
      // Held still before letting go = no fling.
      if (e.timeStamp - s.lastT > 80) s.velocity = 0;
      s.velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, s.velocity));
      if (prefersReducedMotion() || Math.abs(s.velocity) < 0.01) motor.release();
      else coast();
    },
    onPointerCancel(e: ReactPointerEvent<HTMLDivElement>) {
      if (e.pointerId !== state.current.pointer) return;
      state.current.pointer = -1;
      state.current.velocity = 0;
      motor.release();
    },
  };
}

/** Current rotation (deg) of a disc element, read from its computed matrix. */
export function readRotation(el: Element | null): number {
  if (!el) return 0;
  const angleOf = (node: Element | null) => {
    if (!node) return 0;
    const m = getComputedStyle(node).transform;
    if (!m || m === "none") return 0;
    const v = m.match(/matrix\(([^)]+)\)/)?.[1].split(",").map(Number);
    return v ? (Math.atan2(v[1], v[0]) * 180) / Math.PI : 0;
  };
  // Motor rotation + any rotation the visitor added by hand.
  const deg = angleOf(el.querySelector(".rs-vinyl-disc") ?? el) + angleOf(el.querySelector(".rs-vinyl-hand"));
  return ((deg % 360) + 360) % 360;
}
