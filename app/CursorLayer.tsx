"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { tables, reducers } from "../src/module_bindings";
import { useTable, useReducer, useSpacetimeDB } from "spacetimedb/react";

export function CursorLayer() {
  const conn = useSpacetimeDB();
  const [cursors, isReady] = useTable(tables.cursor);
  const updateCursor = useReducer(reducers.updateCursor);
  const pathname = usePathname();
  const lastSent = useRef(0);

  const [docSize, setDocSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    function measure() {
      setDocSize({
        w: document.documentElement.scrollWidth,
        h: document.documentElement.scrollHeight,
      });
    }
    measure();

    // Re-measure on window resize AND on content size changes
    // (images loading, dynamic content expanding the page, etc).
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pathname]); // re-measure on route change since content differs per page

  // Track this viewer's own viewport size so we can convert
  // received fractions back into real pixel positions on THIS screen.
  // const [viewport, setViewport] = useState({ w: 0, h: 0 });
  // useEffect(() => {
  //   function updateViewport() {
  //     setViewport({ w: window.innerWidth, h: window.innerHeight });
  //   }
  //   updateViewport();
  //   window.addEventListener("resize", updateViewport);
  //   return () => window.removeEventListener("resize", updateViewport);
  // }, []);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      const now = performance.now();
      if (now - lastSent.current < 40) return;
      lastSent.current = now;

      const docW = document.documentElement.scrollWidth;
      const docH = document.documentElement.scrollHeight;
      // pageX/pageY already include scroll offset, unlike clientX/clientY.
      const normX = Math.min(1, Math.max(0, e.pageX / docW));
      const normY = Math.min(1, Math.max(0, e.pageY / docH));
      updateCursor({ x: normX, y: normY, page: pathname });
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [pathname, updateCursor]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!isReady || !conn || docSize.w === 0) return null;

  const IDLE_MS = 5_000;

  const myIdentity = conn.identity?.toHexString();

  return (
    <div
      className={`fixed inset-0 w-[${docSize.w}px] h-[${docSize.h}px] pointer-events-none z-9999 overflow-hidden`}
    >
      {cursors
        .filter((c) => {
          if (c.page !== pathname || c.identity.toHexString() === myIdentity)
            return false;
          const updatedMs = Number(c.updatedAt.microsSinceUnixEpoch) / 1000;
          return now - updatedMs < IDLE_MS;
        })
        .map((c) => (
          <div
            key={c.identity.toHexString()}
            style={{
              position: "absolute",
              left: c.x * docSize.w,
              top: c.y * docSize.h,
              transition: "left 80ms linear, top 80ms linear",
              willChange: "left, top",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path
                d="M2 2L18 9L11 11L9 18L2 2Z"
                fill={c.color}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            <span
              style={{
                position: "absolute",
                left: 18,
                top: 14,
                whiteSpace: "nowrap",
                fontSize: 11,
                fontWeight: 600,
                color: "white",
                background: c.color,
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              {c.name}
            </span>
          </div>
        ))}
    </div>
  );
}
