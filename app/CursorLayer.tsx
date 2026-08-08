"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { tables, reducers } from "../src/module_bindings";
import { useTable, useReducer, useSpacetimeDB } from "spacetimedb/react";

export function CursorLayer() {
  const conn = useSpacetimeDB();
  const [cursors, isLoading] = useTable(tables.cursor);
  const updateCursor = useReducer(reducers.updateCursor);
  const pathname = usePathname();
  const lastSent = useRef(0);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      const now = performance.now();
      if (now - lastSent.current < 40) return; // cap at ~25 updates/sec
      lastSent.current = now;
      updateCursor({ x: e.clientX, y: e.clientY, page: pathname });
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [pathname, updateCursor]);

  if (isLoading || !conn) return null;

  const myIdentity = conn.identity?.toHexString() || "";

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
        .filter(
          (c) => c.page === pathname && c.identity.toHexString() !== myIdentity,
        )
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
          </div>
        ))}
    </div>
  );
}
