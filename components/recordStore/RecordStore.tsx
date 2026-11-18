"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { RECORDS, RECORDS_BY_ID, RESUME_HREF } from "@/util/records";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { themeStyle, type ThemeId } from "./themes";
import { isIntro, useRecordMachine, type Phase } from "./useRecordMachine";
import { RecordCrate, type CrateSlotState } from "./RecordCrate";
import { ListeningRoom, type RoomStage } from "./ListeningRoom";
import { TransitionStage, type StageMode } from "./TransitionStage";

/* ------------------------------------------------------------------ */
/* Small hooks                                                         */
/* ------------------------------------------------------------------ */

const RM_QUERY = "(prefers-reduced-motion: reduce)";
function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(RM_QUERY);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(RM_QUERY).matches,
    () => false,
  );
}

const recordFromUrl = () => {
  const id = new URLSearchParams(window.location.search).get("record");
  return id && RECORDS_BY_ID[id] ? id : null;
};

/* ------------------------------------------------------------------ */
/* Derived presentation state (kept out of the machine on purpose)     */
/* ------------------------------------------------------------------ */

const themeFor = (phase: Phase, theme: ThemeId | undefined): ThemeId =>
  theme &&
  (phase === "placing-vinyl" || phase === "playing" || phase === "listening")
    ? theme
    : "shop";

const roomStageFor = (phase: Phase): RoomStage => {
  switch (phase) {
    case "opening-sleeve":
    case "removing-vinyl":
    case "placing-vinyl":
      return "deck";
    case "playing":
      return "playing";
    case "listening":
      return "listening";
    case "returning":
      return "leaving";
    default:
      return "hidden";
  }
};

/* ------------------------------------------------------------------ */
/* The store                                                           */
/* ------------------------------------------------------------------ */

export function RecordStore() {
  const [state, dispatch] = useRecordMachine();
  const { phase, selection, instant } = state;
  const reduced = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(RECORDS[0].id);
  const [lastId, setLastId] = useState<string | null>(null);
  const [handoff, setHandoff] = useState(false);
  const [crateSlot, setCrateSlot] = useState<CrateSlotState>("rest");
  const pushedRef = useRef(false);

  const record = selection ? RECORDS_BY_ID[selection.id] : null;
  const stageMode: StageMode | null =
    record && !instant && isIntro(phase)
      ? "in"
      : record && phase === "returning"
        ? "out"
        : null;

  // Crate slot of the selected sleeve, reconciled with the phase so a skip
  // or an instant return never leaves it lifted or invisible.
  let slot = crateSlot;
  if (phase === "browsing" && (slot === "out" || slot === "pulling")) slot = "rest";
  if (phase !== "browsing" && phase !== "pulling-record" && slot === "pulling") slot = "out";
  if (phase === "playing" || phase === "listening") slot = "out";

  const storefrontVisible =
    phase === "browsing" ||
    phase === "pulling-record" ||
    (phase === "returning" && handoff);

  const theme = themeFor(phase, record?.theme);

  /* ---------------- actions ---------------- */

  const select = useCallback(
    (id: string) => {
      if (phase !== "browsing") return;
      setLastId(id);
      setActiveId(id);
      setCrateSlot(reduced ? "out" : "pulling");
      dispatch({ type: "SELECT", id, instant: reduced });
      window.history.pushState(null, "", `?record=${id}`);
      pushedRef.current = true;
    },
    [phase, reduced, dispatch],
  );

  const requestReturn = useCallback(() => {
    if (!selection) return;
    if (pushedRef.current) {
      // Let the browser's history drive it, so Back and our button agree.
      pushedRef.current = false;
      window.history.back();
      return;
    }
    window.history.replaceState(null, "", window.location.pathname);
    dispatch({ type: "RETURN", instant: reduced });
  }, [selection, reduced, dispatch]);

  const onTrack = useCallback(
    (index: number) => dispatch({ type: "SET_TRACK", index }),
    [dispatch],
  );

  const onCrate = useCallback((s: "out" | "settling") => {
    setCrateSlot(s);
    if (s === "settling") window.setTimeout(() => setCrateSlot("rest"), 520);
  }, []);

  const query = useCallback(
    (sel: string) => rootRef.current?.querySelector(sel) ?? null,
    [],
  );

  /* ---------------- effects ---------------- */

  // Deep link (?record=id) on first load, and Back/Forward afterwards.
  useEffect(() => {
    const initial = recordFromUrl();
    if (initial) {
      dispatch({ type: "RESTORE", id: initial });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from the URL
      setLastId(initial);
      setActiveId(initial);
    }
  }, [dispatch]);

  useEffect(() => {
    const onPop = () => {
      const id = recordFromUrl();
      pushedRef.current = false;
      if (!id) dispatch({ type: "RETURN", instant: reduced });
      else {
        setLastId(id);
        setActiveId(id);
        dispatch({ type: "RESTORE", id });
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [dispatch, reduced]);

  // PLAYING → LISTENING once the arm is down and the platter is up to speed.
  useEffect(() => {
    if (phase !== "playing") return;
    const t = window.setTimeout(
      () => dispatch({ type: "ADVANCE", from: "playing" }),
      reduced ? 0 : 800,
    );
    return () => window.clearTimeout(t);
  }, [phase, reduced, dispatch]);

  // Escape: leave the record (or bail out of the intro).
  useEffect(() => {
    if (!selection) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      const t = e.target;
      if (t instanceof Element && t.closest("input, textarea, select, [contenteditable='true']")) return;
      e.preventDefault();
      requestReturn();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selection, requestReturn]);

  // Hand focus back to the sleeve that was just filed away.
  const prevPhase = useRef<Phase>(phase);
  useEffect(() => {
    const was = prevPhase.current;
    prevPhase.current = phase;
    if (phase === "browsing" && was !== "browsing" && lastId) {
      query(`[data-crate-sleeve="${lastId}"]`)?.closest("button")?.focus({
        preventScroll: true,
      });
    }
  }, [phase, lastId, query]);

  /* ---------------- render ---------------- */

  const browsing = RECORDS_BY_ID[activeId];

  return (
    <div
      ref={rootRef}
      className="rs-root"
      data-phase={phase}
      data-instant={instant}
      data-theme-id={theme}
      style={themeStyle(theme)}
    >
      <div className="rs-ambience" aria-hidden="true" />

      <header className="rs-header">
        <div className="rs-header-inner">
          <Link href="/" className="rs-brand" onClick={(e) => {
            if (selection) {
              e.preventDefault();
              requestReturn();
            }
          }}>
            <span className="rs-brand-mark" aria-hidden="true" />
            <span>
              DevMizu <em>Records</em>
            </span>
          </Link>
          <p className="rs-header-status" aria-live="polite">
            {record && phase !== "browsing" ? (
              <>
                <span className="rs-dot" data-on={phase === "listening"} />
                {phase === "returning" ? "Filing away" : "On the platter"}:{" "}
                <strong>{record.title}</strong>
              </>
            ) : (
              <>
                <span className="rs-dot" data-on="true" />
                Open — browsing the crates
              </>
            )}
          </p>
          <nav className="rs-header-nav" aria-label="Store">
            {selection && phase !== "returning" ? (
              <button type="button" className="rs-header-btn" onClick={requestReturn}>
                <Icon name="arrow_back" /> <span>Crates</span>
              </button>
            ) : null}
            <a
              className="rs-header-btn rs-header-btn--solid"
              href={RESUME_HREF}
              download="Brandon_Maurice_Developer_Resume.pdf"
            >
              <Icon name="description" /> <span>Résumé</span>
            </a>
          </nav>
        </div>
      </header>

      <main className="rs-floor">
        <section
          className="rs-storefront"
          data-visible={storefrontVisible}
          aria-label="Record store"
          inert={phase !== "browsing"}
        >
          <div className="rs-signage">
            <div className="rs-signage-copy">
              <p className="rs-kicker">New &amp; used · Portfolio pressings</p>
              <h1 className="rs-signage-title">
                Pull a record. <em>Put it on.</em>
              </h1>
              <p className="rs-signage-hint">
                <span className="rs-hint-desktop">
                  Scroll, drag or use <kbd>←</kbd> <kbd>→</kbd> to flip through. Click
                  or press <kbd>Enter</kbd> to play.
                </span>
                <span className="rs-hint-touch">Swipe to browse. Tap a sleeve to play it.</span>
              </p>
            </div>
            {browsing && (
              <aside className="rs-talker" aria-live="polite">
                <p className="rs-talker-kicker">
                  Staff pick · {browsing.divider}
                </p>
                <p className="rs-talker-title">{browsing.title}</p>
                <p className="rs-talker-desc">{browsing.description}</p>
                <p className="rs-talker-meta">
                  {browsing.format} · {browsing.tracks.length} tracks · {browsing.catalog}
                </p>
              </aside>
            )}
          </div>

          <RecordCrate
            records={RECORDS}
            activeId={activeId}
            selectedId={record?.id ?? lastId}
            slotState={slot}
            onActivate={setActiveId}
            onSelect={select}
            disabled={phase !== "browsing"}
          />
        </section>

        {record && (
          <ListeningRoom
            key={record.id}
            record={record}
            stage={roomStageFor(phase)}
            handoff={handoff}
            currentTrack={selection?.currentTrack ?? 0}
            onTrack={onTrack}
            onReturn={requestReturn}
          />
        )}
      </main>

      {record && stageMode && (
        <TransitionStage
          key={`${stageMode}-${record.id}`}
          mode={stageMode}
          record={record}
          dispatch={dispatch}
          onHandoff={setHandoff}
          onCrate={onCrate}
          query={query}
        />
      )}
    </div>
  );
}
