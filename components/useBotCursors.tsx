"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { roomFor } from "@/shared/presence";
import { RECORDS } from "@/util/records";

// Rooms simulated visitors wander between: the crate floor and each record.
export const BOT_PAGES = ["/", ...RECORDS.map((r) => roomFor("/", r.id))];

export type BotMeta = { id: string; name: string; color: string };

type V = { x: number; y: number };
type Seg = { p0: V; p1: V; p2: V; p3: V; dur: number; t0: number };

type Bot = BotMeta & {
  page: string;
  pos: V;
  cur: Seg | null;
  segs: Seg[];
  pauseUntil: number;
  leaveAt: number;
  leaving: boolean; // heading to the navbar to "click" a link
  awayUntil: number; // when it returns from another page
  shown: boolean;
  opacity: number;
  seed: number;
  el: HTMLDivElement | null;
};

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];
const ADJECTIVES = [
  "Curious",
  "Sneaky",
  "Cosmic",
  "Quiet",
  "Swift",
  "Lucky",
  "Bold",
  "Gentle",
];
const ANIMALS = [
  "Otter",
  "Panda",
  "Falcon",
  "Fox",
  "Koala",
  "Lynx",
  "Heron",
  "Wren",
];
const GHOST_OPACITY = 0.35;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// minimum-jerk easing: gentle start, fast middle, gentle stop
const minJerk = (u: number) => u * u * u * (u * (6 * u - 15) + 10);

function bez(s: Seg, k: number): V {
  const m = 1 - k;
  const a = m * m * m;
  const b = 3 * m * m * k;
  const c = 3 * m * k * k;
  const d = k * k * k;
  return {
    x: a * s.p0.x + b * s.p1.x + c * s.p2.x + d * s.p3.x,
    y: a * s.p0.y + b * s.p1.y + c * s.p2.y + d * s.p3.y,
  };
}

function makeSeg(from: V, to: V, curve = 1, fixedDur?: number): Seg {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;
  const bow1 = rand(-0.18, 0.18) * dist * curve;
  const bow2 = rand(-0.18, 0.18) * dist * curve;
  // Fitts-like: longer moves take longer, but sub-linearly
  const dur =
    fixedDur ??
    clamp((260 + 170 * Math.log2(dist / 40 + 1)) * rand(0.85, 1.25), 220, 1800);
  return {
    p0: from,
    p1: { x: from.x + dx * 0.3 + nx * bow1, y: from.y + dy * 0.3 + ny * bow1 },
    p2: { x: from.x + dx * 0.7 + nx * bow2, y: from.y + dy * 0.7 + ny * bow2 },
    p3: to,
    dur,
    t0: 0,
  };
}

// ---- target pickers (page-pixel coordinates) ----
const viewportPoint = (): V => ({
  x: rand(0.04, 0.96) * window.innerWidth,
  y: window.scrollY + rand(0.1, 0.9) * window.innerHeight,
});

const nearbyPoint = (from: V): V => {
  const a = rand(0, Math.PI * 2);
  const r = rand(50, 220);
  return {
    x: clamp(from.x + Math.cos(a) * r, 10, window.innerWidth - 30),
    y: clamp(
      from.y + Math.sin(a) * r,
      window.scrollY + 10,
      window.scrollY + window.innerHeight - 30,
    ),
  };
};

// Assumes a navbar fixed to the top of the viewport.
const navPoint = (): V => ({
  x: rand(0.35, 0.9) * window.innerWidth,
  y: window.scrollY + rand(26, 52),
});

function planMove(b: Bot, to: V) {
  const from = b.pos;
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  if (dist > 350 && Math.random() < 0.3) {
    // overshoot slightly, then correct
    const k = rand(10, 26) / dist;
    const over = {
      x: to.x + (to.x - from.x) * k,
      y: to.y + (to.y - from.y) * k,
    };
    b.segs.push(makeSeg(from, over));
    b.segs.push(makeSeg(over, to, 0, rand(140, 240)));
  } else {
    b.segs.push(makeSeg(from, to));
  }
}

function makeBot(path: string): Bot {
  return {
    id: `bot-${crypto.randomUUID()}`,
    name: `${pick(ADJECTIVES)} ${pick(ANIMALS)}`,
    color: pick(COLORS),
    page: Math.random() < 0.7 ? path : pick(BOT_PAGES),
    pos: { x: 0, y: 0 },
    cur: null,
    segs: [],
    pauseUntil: 0,
    leaveAt: 0,
    leaving: false,
    awayUntil: performance.now() + rand(1000, 6000),
    shown: false,
    opacity: 0,
    seed: Math.random() * 1000,
    el: null,
  };
}

export function useBotCursors(count: number, pathname: string) {
  const botsRef = useRef<Bot[]>([]);
  const pathRef = useRef(pathname);
  const [metas, setMetas] = useState<BotMeta[]>([]);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  // add / remove bots when the requested count changes
  useEffect(() => {
    const bots = botsRef.current;
    while (bots.length < count) bots.push(makeBot(pathRef.current));
    if (bots.length > count) bots.length = count;
    setMetas(bots.map(({ id, name, color }) => ({ id, name, color })));
  }, [count]);

  // ref callback so the loop can write transforms straight to the DOM
  const register = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      const b = botsRef.current.find((x) => x.id === id);
      if (b) b.el = el;
    },
    [],
  );

  useEffect(() => {
    if (count <= 0) return;
    let raf = 0;
    let last = performance.now();

    const enter = (b: Bot, t: number) => {
      b.pos = navPoint();
      b.segs = [];
      b.cur = null;
      b.leaving = false;
      b.pauseUntil = t + rand(100, 500);
      b.leaveAt = t + rand(15000, 45000);
      b.shown = true;
      b.opacity = 0;
    };

    const depart = (b: Bot, t: number) => {
      const others = BOT_PAGES.filter((p) => p !== b.page);
      b.leaving = false;
      if (others.length) b.page = pick(others);
      b.awayUntil = t + rand(3000, 9000);
    };

    const tick = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      const path = pathRef.current;
      const W = document.documentElement.scrollWidth;
      const H = document.documentElement.scrollHeight;

      for (const b of botsRef.current) {
        const here = b.page === path;

        if (!here) {
          b.shown = false;
          if (t >= b.awayUntil) {
            // come back to the page the viewer is on, or wander elsewhere
            b.page = Math.random() < 0.6 ? path : pick(BOT_PAGES);
            if (b.page !== path) b.awayUntil = t + rand(4000, 12000);
          }
        } else if (!b.shown) {
          enter(b, t);
        }

        if (here && b.shown) {
          if (!b.cur && t >= b.pauseUntil) {
            if (!b.segs.length) {
              if (b.leaving) {
                depart(b, t); // "clicked" a nav link
              } else if (BOT_PAGES.length > 1 && t >= b.leaveAt) {
                b.leaving = true;
                planMove(b, navPoint());
              } else {
                planMove(
                  b,
                  Math.random() < 0.4 ? nearbyPoint(b.pos) : viewportPoint(),
                );
              }
            }
            if (b.segs.length) {
              b.cur = b.segs.shift()!;
              b.cur.t0 = t;
            }
          }

          if (b.cur) {
            const u = (t - b.cur.t0) / b.cur.dur;
            if (u >= 1) {
              b.pos = b.cur.p3;
              b.cur = null;
              b.pauseUntil =
                t +
                (b.segs.length
                  ? 0
                  : b.leaving
                    ? rand(350, 800)
                    : rand(200, 2200));
            } else {
              b.pos = bez(b.cur, minJerk(u));
            }
          }
        }

        // fade, tremor, and write to the DOM
        const target = here && b.shown ? GHOST_OPACITY : 0;
        b.opacity += (target - b.opacity) * Math.min(1, dt * 8);

        if (b.el) {
          const tx =
            Math.sin(t / 170 + b.seed) * 0.6 +
            Math.sin(t / 61 + b.seed * 2) * 0.3;
          const ty =
            Math.sin(t / 143 + b.seed * 3) * 0.6 +
            Math.sin(t / 73 + b.seed) * 0.3;
          const x = clamp(b.pos.x + tx, 0, Math.max(0, W - 20));
          const y = clamp(b.pos.y + ty, 0, Math.max(0, H - 20));
          b.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          b.el.style.opacity = String(b.opacity);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count > 0]);

  return { bots: count > 0 ? metas : [], register };
}
