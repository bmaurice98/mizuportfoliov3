"use client";

import { useEffect, useMemo } from "react";
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

  return useMemo(() => {
    const byId = new Map(cursors.map((c) => [c.identity.toHexString(), c]));
    return rows.map((r) => {
      const id = r.identity.toHexString();
      const c = byId.get(id);
      return {
        id,
        name: c?.name ?? "A visitor",
        color: c?.color ?? "#8c9292",
        record: r.record,
        track: r.track,
        isMe: id === me,
      };
    });
  }, [rows, cursors, me]);
}
