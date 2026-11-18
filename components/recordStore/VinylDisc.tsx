"use client";

import { useEffect, useRef } from "react";
import type { RecordDef } from "@/util/records";

const REV_MS = 1800; // 33⅓ rpm

/**
 * A vinyl disc: grooves + centre label rotate, the light sheen does not.
 * Spinning uses one Web Animation whose playbackRate is ramped, so the platter
 * spins up and coasts down like a real motor instead of snapping.
 */
export function VinylDisc({
  record,
  spinning = false,
  className = "",
}: {
  record: RecordDef;
  spinning?: boolean;
  className?: string;
}) {
  const discRef = useRef<HTMLDivElement>(null);
  useSpin(discRef, spinning);
  const { paper, ink, accent } = record.palette;

  return (
    <div className={`rs-vinyl ${className}`} aria-hidden="true">
      <div ref={discRef} className="rs-vinyl-disc">
        <div
          className="rs-vinyl-label"
          style={{ background: accent, color: labelInk(accent, ink, paper) }}
        >
          <span className="rs-vinyl-label-title">{record.title}</span>
          <span className="rs-vinyl-label-meta">
            {record.artist} · {record.catalog}
          </span>
          <span className="rs-vinyl-label-rpm">33⅓ RPM · SIDE A</span>
          <span className="rs-vinyl-hole" />
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

function useSpin(
  ref: React.RefObject<HTMLDivElement | null>,
  spinning: boolean,
) {
  const animRef = useRef<Animation | null>(null);
  const rampRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    let anim = animRef.current;
    if (spinning && !anim) {
      anim = el.animate(
        [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
        { duration: REV_MS, iterations: Infinity },
      );
      anim.playbackRate = 0;
      animRef.current = anim;
    }
    if (!anim) return;

    cancelAnimationFrame(rampRef.current);
    const from = anim.playbackRate;
    const to = spinning ? 1 : 0;
    const dur = spinning ? 1100 : 900;
    const t0 = performance.now();
    if (spinning) anim.play();

    const step = (t: number) => {
      const u = Math.min(1, (t - t0) / dur);
      const eased = spinning ? 1 - Math.pow(1 - u, 2) : 1 - Math.pow(1 - u, 3);
      anim!.playbackRate = from + (to - from) * eased;
      if (u < 1) rampRef.current = requestAnimationFrame(step);
      else if (!spinning) anim!.pause();
    };
    rampRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rampRef.current);
  }, [spinning, ref]);

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
}

/** Current rotation (deg) of a disc element, read from its computed matrix. */
export function readRotation(el: Element | null): number {
  if (!el) return 0;
  const disc = el.querySelector(".rs-vinyl-disc") ?? el;
  const m = getComputedStyle(disc).transform;
  if (!m || m === "none") return 0;
  const v = m.match(/matrix\(([^)]+)\)/)?.[1].split(",").map(Number);
  if (!v) return 0;
  const deg = (Math.atan2(v[1], v[0]) * 180) / Math.PI;
  return (deg + 360) % 360;
}
