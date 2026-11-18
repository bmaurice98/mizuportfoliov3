"use client";

import { useReducer } from "react";

/**
 * Explicit state machine for the record interaction.
 *
 *  browsing ─SELECT→ pulling-record → opening-sleeve → removing-vinyl
 *           → placing-vinyl → playing → listening ─RETURN→ returning → browsing
 *
 * Animation code never sets state directly: it reports that a phase finished
 * with ADVANCE{from}. The guard on `from` drops stale or duplicate reports
 * (e.g. an animation that resolves after the user skipped).
 */

export type Phase =
  | "browsing"
  | "pulling-record"
  | "opening-sleeve"
  | "removing-vinyl"
  | "placing-vinyl"
  | "playing"
  | "listening"
  | "returning";

export type RecordSelection = {
  id: string;
  currentTrack: number;
};

export type MachineState = {
  phase: Phase;
  selection: RecordSelection | null;
  /** True when the current transition was started without animation. */
  instant: boolean;
};

export type MachineEvent =
  | { type: "SELECT"; id: string; instant?: boolean }
  | { type: "ADVANCE"; from: Phase }
  | { type: "SKIP" }
  | { type: "RETURN"; instant?: boolean }
  | { type: "RESTORE"; id: string }
  | { type: "SET_TRACK"; index: number };

const NEXT: Partial<Record<Phase, Phase>> = {
  "pulling-record": "opening-sleeve",
  "opening-sleeve": "removing-vinyl",
  "removing-vinyl": "placing-vinyl",
  "placing-vinyl": "playing",
  playing: "listening",
  returning: "browsing",
};

export const INTRO_PHASES: Phase[] = [
  "pulling-record",
  "opening-sleeve",
  "removing-vinyl",
  "placing-vinyl",
];

export function isIntro(p: Phase) {
  return INTRO_PHASES.includes(p);
}

/** Phases in which the listening room is (or is becoming) the page. */
export function roomVisible(p: Phase) {
  return p === "playing" || p === "listening";
}

export function machineReducer(
  state: MachineState,
  event: MachineEvent,
): MachineState {
  switch (event.type) {
    case "SELECT":
      if (state.phase !== "browsing") return state; // no double-selects
      return {
        phase: event.instant ? "listening" : "pulling-record",
        selection: { id: event.id, currentTrack: 0 },
        instant: !!event.instant,
      };

    case "RESTORE":
      if (state.phase !== "browsing") return state;
      return {
        phase: "listening",
        selection: { id: event.id, currentTrack: 0 },
        instant: true,
      };

    case "ADVANCE": {
      if (state.phase !== event.from) return state; // stale report
      const next = NEXT[state.phase];
      if (!next) return state;
      return {
        ...state,
        phase: next,
        selection: next === "browsing" ? null : state.selection,
        instant: next === "browsing" ? false : state.instant,
      };
    }

    case "SKIP":
      if (!isIntro(state.phase) && state.phase !== "playing") return state;
      return { ...state, phase: "listening", instant: true };

    case "RETURN":
      if (!state.selection) return state;
      if (state.phase === "returning" || state.phase === "browsing")
        return state;
      // Bailing out mid-intro, or reduced motion: go straight back.
      if (event.instant || isIntro(state.phase)) {
        return { phase: "browsing", selection: null, instant: true };
      }
      return { ...state, phase: "returning", instant: false };

    case "SET_TRACK":
      if (!state.selection || state.selection.currentTrack === event.index)
        return state;
      return {
        ...state,
        selection: { ...state.selection, currentTrack: event.index },
      };
  }
}

export function useRecordMachine() {
  return useReducer(machineReducer, {
    phase: "browsing",
    selection: null,
    instant: false,
  });
}
