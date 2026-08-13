"use client";

import { useEffect, useState } from "react";
import { tables, reducers } from "../../src/module_bindings";
import { useTable, useReducer, useSpacetimeDB } from "spacetimedb/react";

export function LobbyToast() {
  const conn = useSpacetimeDB();
  const [games] = useTable(tables.hotPotatoGame);
  const [readyPlayers] = useTable(tables.readyPlayer);
  const readyUp = useReducer(reducers.readyUp);

  const [dismissed, setDismissed] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const game = games[0];
  const isLobby = game?.status === "lobby";

  // Re-show the toast for a fresh lobby even if a previous one was dismissed.
  useEffect(() => {
    if (isLobby) setDismissed(false);
  }, [game?.roundId, isLobby]);

  if (!conn || !isLobby || dismissed) return null;

  const myIdentity = conn.identity?.toHexString();
  const readyForRound = readyPlayers.filter((r) => r.roundId === game.roundId);
  const iAmReady = readyForRound.some(
    (r) => r.identity.toHexString() === myIdentity,
  );
  const secondsLeft = Math.max(
    0,
    Math.ceil((Number(game.lobbyEndsAtMicros / 1000n) - now) / 1000),
  );

  async function handleReady() {
    setSubmitting(true);
    try {
      await readyUp();
    } catch {
      // lobby likely closed right as they clicked — it'll disappear on the next tick regardless
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-10001 w-[min(92vw,360px)] -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-xl bg-neutral-900 px-4 py-3 text-white shadow-xl">
        <div className="text-2xl">💣</div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Hot Potato is starting!</p>
          <p className="text-xs text-neutral-400">
            {readyForRound.length} ready · starts in {secondsLeft}s
          </p>
        </div>
        {iAmReady ? (
          <span className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold">
            You&apos;re in ✓
          </span>
        ) : (
          <button
            onClick={handleReady}
            disabled={submitting}
            className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 disabled:opacity-50"
          >
            Ready up
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="cursor-pointer text-neutral-500 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
