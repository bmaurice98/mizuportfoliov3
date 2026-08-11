"use client";

import { useEffect, useRef, useState } from "react";
import { tables, reducers } from "../../src/module_bindings";
import { useTable, useReducer, useSpacetimeDB } from "spacetimedb/react";
import { playExplosion, playWinChime } from "../gameAudio";

const DEFAULT_DURATION = 30;
const LOSER_BANNER_MS = 5000;
const ERROR_TOAST_MS = 4000;

export function GameHUD() {
  const conn = useSpacetimeDB();
  const [games] = useTable(tables.hotPotatoGame);
  const [cursors] = useTable(tables.cursor);
  const startGame = useReducer(reducers.startHotPotato);

  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoserBanner, setShowLoserBanner] = useState(false);
  const [now, setNow] = useState(Date.now());

  // countdown tick
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const game = games[0];
  const myIdentity = conn?.identity?.toHexString();

  // Show the loser banner for a few seconds whenever a round freshly ends,
  // then auto-hide — keyed on roundId so a *new* ended round re-triggers it.
  useEffect(() => {
    if (game?.status === "ended" && game.loserName) {
      setShowLoserBanner(true);
      const timeout = setTimeout(
        () => setShowLoserBanner(false),
        LOSER_BANNER_MS,
      );
      return () => clearTimeout(timeout);
    }
    setShowLoserBanner(false);
  }, [game?.status, game?.roundId, game?.loserName]);

  // Auto-dismiss error toast
  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(null), ERROR_TOAST_MS);
    return () => clearTimeout(timeout);
  }, [error]);

  // Play explosion/win sounds only on an ACTIVE→ENDED transition observed
  // locally — this guards against playing a sound the instant someone loads
  // the page and finds a round that already ended before they arrived.
  const prevStatusRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = game?.status;

    if (
      prevStatus === "active" &&
      game?.status === "ended" &&
      game.loserIdentity &&
      myIdentity
    ) {
      const iAmLoser = game.loserIdentity.toHexString() === myIdentity;
      if (iAmLoser) {
        playExplosion();
      } else {
        playWinChime();
      }
    }
  }, [game?.status, game?.roundId, game?.loserIdentity, myIdentity]);

  if (!conn) return null;

  const isActive = game?.status === "active";
  const iAmHolder = isActive && game?.bombHolder?.toHexString() === myIdentity;
  const secondsLeft = isActive
    ? Math.max(0, Math.ceil((Number(game.endsAtMicros / 1000n) - now) / 1000))
    : 0;
  const canStart = !isActive && cursors.length >= 2;

  async function handleStart() {
    if (!canStart) return;
    setError(null);
    try {
      await startGame({ durationSeconds: DEFAULT_DURATION });
      setMenuOpen(false);
    } catch (err: any) {
      setError(err?.message ?? "Could not start round.");
    }
  }

  return (
    <>
      {/* Half-circle game menu — center-left, expands on hover/tap */}
      <div
        className="fixed left-0 top-1/2 -translate-y-1/2 z-10001 flex items-center"
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Site games"
          aria-expanded={menuOpen}
          className="flex h-20 w-7 items-center justify-center rounded-r-full bg-neutral-900 text-white shadow-lg transition-colors hover:bg-neutral-800"
        >
          🎮
        </button>

        <div
          className={`ml-2 origin-left transition-all duration-200 ${
            menuOpen
              ? "pointer-events-auto scale-x-100 opacity-100"
              : "pointer-events-none scale-x-95 opacity-0"
          }`}
        >
          <div className="w-60 space-y-2 rounded-xl bg-neutral-900 p-3 text-white shadow-xl">
            <p className="px-1 text-xs uppercase tracking-wide text-neutral-400">
              Site games
            </p>
            <button
              onClick={handleStart}
              disabled={!canStart}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                canStart
                  ? "cursor-pointer bg-neutral-800 hover:bg-neutral-700"
                  : "cursor-default bg-neutral-800/50 text-neutral-500"
              }`}
            >
              {isActive
                ? "💣 Round in progress…"
                : canStart
                  ? "💣 Start Hot Potato"
                  : `💣 Waiting for players (${cursors.length}/2)`}
            </button>
          </div>
        </div>
      </div>

      {/* Status stack — top right, out of the navbar's way */}
      <div className="fixed top-4 right-4 z-10001 flex flex-col items-end gap-2">
        {isActive && (
          <div
            className={`rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-lg ${
              iAmHolder ? "animate-pulse bg-red-500" : "bg-neutral-900"
            }`}
          >
            {iAmHolder
              ? `💣 YOU HAVE THE BOMB — ${secondsLeft}s`
              : `💣 Round live — ${secondsLeft}s`}
          </div>
        )}
        {showLoserBanner && (
          <div className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-lg">
            💥 {game?.loserName} got caught with the bomb!
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800 shadow-lg">
            {error}
          </div>
        )}
      </div>
    </>
  );
}
