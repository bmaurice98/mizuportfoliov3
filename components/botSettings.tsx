"use client";

import { useSyncExternalStore } from "react";

const KEY = "portfolio_bot_cursors_enabled";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== "false"; // default: on
  } catch {
    return true;
  }
}

export function setBotCursorsEnabled(value: boolean) {
  try {
    localStorage.setItem(KEY, String(value));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb); // sync across tabs
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useBotCursorsEnabled() {
  return useSyncExternalStore(subscribe, read, () => true);
}
