"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { tables, reducers } from "../src/module_bindings";
import { useTable, useReducer, useSpacetimeDB } from "spacetimedb/react";

import { useBotCursors } from "@/components/useBotCursors";
import { useBotCursorsEnabled } from "@/components/botSettings";
import { roomFor, usePresence } from "@/shared/presence";

const MIN_VISIBLE_CURSORS = 5; // total cursors you want on screen (including you)
const IDLE_MS = 5_000;

export function CursorLayer() {
  const conn = useSpacetimeDB();
  const [cursors, isReady] = useTable(tables.cursor);
  const updateCursor = useReducer(reducers.updateCursor);
  const [readyPlayers] = useTable(tables.readyPlayer);
  const pathname = usePathname();
  // Cursors are shared per *room*: the page, plus the record on the turntable.
  const { record } = usePresence();
  const room = roomFor(pathname, record);
  const lastSent = useRef(0);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [games] = useTable(tables.hotPotatoGame);
  const game = games[0];

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
  }, [room]); // re-measure on room change since content differs per room

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
      lastPos.current = { x: normX, y: normY };
      updateCursor({ x: normX, y: normY, page: room });
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [room, updateCursor]);

  // Changing rooms without moving the mouse (keyboard, touch) still moves
  // this visitor's cursor row into the new room.
  useEffect(() => {
    if (!conn?.isActive || !lastPos.current) return;
    updateCursor({ ...lastPos.current, page: room }).catch(() => {});
  }, [room, conn?.isActive, updateCursor]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Who's actually opted into the current lobby/round — only relevant
  // while a round is forming or live; readyPlayer rows are cleared once
  // it ends, so this naturally empties out again after the round.
  const participantIds = useMemo(() => {
    if (!game || (game.status !== "lobby" && game.status !== "active")) {
      return new Set<string>();
    }
    return new Set(
      readyPlayers
        .filter((r) => r.roundId === game.roundId)
        .map((r) => r.identity.toHexString()),
    );
  }, [readyPlayers, game?.status, game?.roundId]);

  const botsEnabled = useBotCursorsEnabled();

  const othersActive = useMemo(() => {
    const me = conn?.identity?.toHexString();
    return cursors.filter((c) => {
      if (c.identity.toHexString() === me) return false;
      return now - Number(c.updatedAt.microsSinceUnixEpoch) / 1000 < IDLE_MS;
    }).length;
  }, [cursors, now, conn?.identity]);

  const gameBusy = game?.status === "lobby" || game?.status === "active";
  const botCount =
    botsEnabled && !gameBusy
      ? Math.max(0, MIN_VISIBLE_CURSORS - 1 - othersActive) // -1 for yourself
      : 0;

  const { bots, register } = useBotCursors(botCount, room);

  if (!isReady || !conn || docSize.w === 0) return null;

  const myIdentity = conn.identity?.toHexString();

  return (
    <div
      className={`absolute inset-0 w-[${docSize.w}px] h-[${docSize.h}px] pointer-events-none z-9999 overflow-hidden`}
    >
      {cursors
        .filter((c) => {
          if (c.page !== room || c.identity.toHexString() === myIdentity)
            return false;
          const updatedMs = Number(c.updatedAt.microsSinceUnixEpoch) / 1000;
          return now - updatedMs < IDLE_MS;
        })
        .map((c) => {
          const isHolder =
            game?.status === "active" &&
            game.bombHolder?.toHexString() === c.identity.toHexString();
          const isParticipant = participantIds.has(c.identity.toHexString());
          const dimmedOpacity = isParticipant ? 1 : 0.4;

          return (
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
              {isHolder ? (
                <div
                  key={c.identity.toHexString()}
                  style={{
                    fontSize: 22,
                    filter: "drop-shadow(0 0 6px #ef4444)",
                  }}
                >
                  💣
                </div>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    opacity={dimmedOpacity}
                  >
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
                      opacity: dimmedOpacity,
                      boxShadow: "0 0 2px rgba(0,0,0,0.5)",
                    }}
                  >
                    {c.name}
                  </span>
                </>
              )}
            </div>
          );
        })}
      {bots.map((b) => (
        <div
          key={b.id}
          ref={register(b.id)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            opacity: 0,
            willChange: "transform, opacity",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path
              d="M2 2L18 9L11 11L9 18L2 2Z"
              fill={b.color}
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
              background: b.color,
              padding: "2px 6px",
              borderRadius: 4,
              boxShadow: "0 0 2px rgba(0,0,0,0.5)",
            }}
          >
            {"🤖" + b.name}
          </span>
        </div>
      ))}
    </div>
  );
}
