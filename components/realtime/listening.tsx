"use client";

import { useEffect, useMemo, useState } from "react";
import { reducers, tables } from "../../src/module_bindings";
import { useReducer, useSpacetimeDB, useTable } from "spacetimedb/react";
import { usePresence, useShareListening } from "@/shared/presence";

/**
 * Real-time layer for "what's on everyone's turntable".
 * - <ListeningSync/> publishes this visitor's record + track (opt-in).
 * - useListeners() returns everyone who is sharing, joined with their cursor
 *   name/colour, for markers and follow mode.
 */

export type Listener = {
  id: string;
  name: string;
  color: string;
  record: string;
  track: number;
  isMe: boolean;
};

const SEND_DEBOUNCE_MS = 400;
/**
 * A listener row with no live cursor is only trusted this long after its last
 * change. Rows can outlive a dropped connection (the disconnect callback
 * doesn't always fire), and they'd otherwise pile up as "A visitor".
 */
const STALE_WITHOUT_CURSOR_MS = 5 * 60_000;

export function ListeningSync() {
  const conn = useSpacetimeDB();
  const setListening = useReducer(reducers.setListening);
  const { record, track } = usePresence();
  const share = useShareListening();

  useEffect(() => {
    if (!conn?.isActive) return;
    const t = window.setTimeout(() => {
      setListening({
        record: share && record ? record : "",
        track: share && record ? track : 0,
      }).catch(() => {
        // Module not published yet, or offline — presence is best-effort.
      });
    }, SEND_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [conn?.isActive, record, track, share, setListening]);

  return null;
}

export function useListeners(): Listener[] {
  const conn = useSpacetimeDB();
  const [rows] = useTable(tables.listener);
  const [cursors] = useTable(tables.cursor);
  const me = conn?.identity?.toHexString();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  return useMemo(() => {
    const byId = new Map(cursors.map((c) => [c.identity.toHexString(), c]));
    return rows.flatMap((r) => {
      const id = r.identity.toHexString();
      const c = byId.get(id);
      const age = now - Number(r.updatedAt.microsSinceUnixEpoch) / 1000;
      if (!c && id !== me && age > STALE_WITHOUT_CURSOR_MS) return [];
      return [{
        id,
        name: c?.name ?? "A visitor",
        color: c?.color ?? "#8c9292",
        record: r.record,
        track: r.track,
        isMe: id === me,
      }];
    });
  }, [rows, cursors, me, now]);
}
