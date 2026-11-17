"use client";

import { useMemo, useState } from "react";
import { tables, reducers } from "../../src/module_bindings";
import { useTable, useReducer, useSpacetimeDB } from "spacetimedb/react";
import { THEME_TOKENS, checkSnippet, type ThemeKey } from "../themeTokens";

export function ThemeEditor() {
  const conn = useSpacetimeDB();
  const [rows] = useTable(tables.themeToken);
  const applyTheme = useReducer(reducers.applyTheme);
  const resetTheme = useReducer(reducers.resetTheme);

  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const current = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [k, d] of Object.entries(THEME_TOKENS)) map[k] = d.default;
    for (const r of rows) map[r.token] = r.value;
    return map;
  }, [rows]);

  const lastChange = useMemo(() => {
    if (rows.length === 0) return null;
    return [...rows].sort((a, b) =>
      a.updatedAt.microsSinceUnixEpoch > b.updatedAt.microsSinceUnixEpoch
        ? -1
        : 1,
    )[0];
  }, [rows]);

  const currentSnippet = Object.keys(THEME_TOKENS)
    .map((k) => `theme.${k} = "${current[k]}";`)
    .join("\n");
  const value = draft ?? currentSnippet;

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      setDraft(null);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function handleApply() {
    const problem = checkSnippet(value);
    if (problem) return setError(problem);
    run(() => applyTheme({ snippet: value }));
  }

  return (
    <div className="col-span-1 md:col-span-4 bg-[#05080a] border border-white/10 rounded-xl font-code text-code overflow-hidden">
      <div className="h-8 bg-surface-container flex items-center px-4 gap-2 border-b border-white/5">
        <div className="w-2 h-2 rounded-full bg-error" />
        <div className="w-2 h-2 rounded-full bg-secondary" />
        <div className="w-2 h-2 rounded-full bg-primary-fixed" />
        <span className="ml-3 text-xs text-on-surface-variant">
          theme.config.ts — live for everyone
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <textarea
          value={value}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          rows={7}
          maxLength={600}
          aria-label="Theme snippet"
          className="w-full resize-none rounded-lg bg-white/3 border border-white/10 p-3 text-secondary outline-none focus:border-secondary/60"
        />

        <div className="flex flex-col justify-between gap-4">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(THEME_TOKENS) as ThemeKey[]).map((k) => (
              <div
                key={k}
                className="flex items-center gap-2 text-xs text-on-surface-variant"
              >
                <span
                  className="h-4 w-4 rounded border border-white/20"
                  style={{ background: current[k] }}
                />
                {k}
              </div>
            ))}
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              onClick={handleApply}
              disabled={!conn || busy}
              className="rounded bg-primary px-4 py-2 text-xs font-semibold text-surface disabled:opacity-50 cursor-pointer"
            >
              {busy ? "Applying…" : "Apply to site"}
            </button>
            <button
              onClick={() => run(() => resetTheme())}
              disabled={!conn || busy}
              className="rounded border border-white/20 px-4 py-2 text-xs text-primary hover:bg-white/10 disabled:opacity-50 cursor-pointer"
            >
              Reset
            </button>
            {lastChange && (
              <span className="ml-auto text-xs text-on-surface-variant">
                last change by {lastChange.setBy}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
