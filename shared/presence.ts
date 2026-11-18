"use client";

import { useSyncExternalStore } from "react";

/**
 * A tiny, framework-free bridge between the record store (application state)
 * and the real-time layer. The store *publishes* what's on the turntable; the
 * real-time components *read* it. Neither imports the other.
 */

export type Presence = { record: string | null; track: number };

let current: Presence = { record: null, track: 0 };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function setPresence(next: Presence) {
  if (next.record === current.record && next.track === current.track) return;
  current = next;
  emit();
}

const SERVER: Presence = { record: null, track: 0 };
export function usePresence(): Presence {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => SERVER,
  );
}

/** Cursor "room": cursors are only shared with visitors in the same room. */
export function roomFor(pathname: string, record: string | null) {
  return record ? `${pathname}?record=${record}` : pathname;
}

/* ---------------- "Share what I'm playing" preference ---------------- */

const SHARE_KEY = "portfolio_share_listening";
const shareListeners = new Set<() => void>();

function readShare(): boolean {
  try {
    return localStorage.getItem(SHARE_KEY) !== "false"; // default: on
  } catch {
    return true;
  }
}

export function setShareListening(value: boolean) {
  try {
    localStorage.setItem(SHARE_KEY, String(value));
  } catch {}
  shareListeners.forEach((l) => l());
}

export function useShareListening() {
  return useSyncExternalStore(
    (cb) => {
      shareListeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        shareListeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    readShare,
    () => true,
  );
}
