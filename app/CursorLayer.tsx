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

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      const now = performance.now();
      if (now - lastSent.current < 40) return;
      lastSent.current = now;
      updateCursor({ x: e.clientX, y: e.clientY, page: pathname });
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [pathname, updateCursor]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!isReady || !conn) return null;

  const IDLE_MS = 5_000;

  const myIdentity = conn.identity?.toHexString();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
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
              left: c.x,
              top: c.y,
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
