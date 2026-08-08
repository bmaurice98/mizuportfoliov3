"use client";

import { useEffect, useState } from "react";
import { reducers } from "../src/module_bindings";
import { useReducer, useSpacetimeDB } from "spacetimedb/react";
import { Filter } from "bad-words";

const STORAGE_KEY = "portfolio_cursor_name";
const REMEMBER_DAYS = 30;
const profanity = new Filter();

function loadStoredName(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { name, expiresAt } = JSON.parse(raw);
    return Date.now() > expiresAt ? null : name;
  } catch {
    return null;
  }
}

function storeName(name: string) {
  const expiresAt = Date.now() + REMEMBER_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, expiresAt }));
}

export function NameGate() {
  const conn = useSpacetimeDB();
  const setCursorName = useReducer(reducers.setCursorName);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // On connect: re-apply a remembered name silently, or prompt if none/expired.
  useEffect(() => {
    if (!conn) return;
    const stored = loadStoredName();
    if (stored) {
      setCursorName({ name: stored }).catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setOpen(true);
      });
    } else {
      setOpen(true);
    }
  }, [conn]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = value.trim();

    if (cleaned.length < 2 || cleaned.length > 20) {
      setError("Name must be 2-20 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9 _'-]+$/.test(cleaned)) {
      setError("Only letters, numbers, spaces, - and _ allowed.");
      return;
    }
    if (profanity.isProfane(cleaned)) {
      setError("Please choose a different name.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await setCursorName({ name: cleaned });
      storeName(cleaned);
      setOpen(false);
    } catch (err: any) {
      setError(err?.message ?? "That name was rejected. Try another.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRandomSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSubmitting(true);
    setError(null);
    try {
      await setCursorName({ name: "random" });
      storeName("random");
      setOpen(false);
    } catch (err: any) {
      setError(err?.message ?? "That name was rejected. Try another.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-background p-6 rounded-md shadow-md w-80 flex flex-col gap-2"
      >
        <h2 className="text-lg font-semibold">Pick a cursor name</h2>
        <p className="text-sm text-muted-foreground">
          Other visitors will see this next to your cursor.
        </p>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={20}
          placeholder="e.g. Alex"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-3 w-full rounded-md bg-primary-container px-3 py-2 text-sm font-semibold text-on-primary shadow-sm hover:bg-primary/80 focus-visible:outlin focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {submitting ? "Saving…" : "Continue"}
        </button>
        <button
          disabled={submitting}
          onClick={handleRandomSubmit}
          className="mt-3 w-full rounded-md bg-tertiary-container px-3 py-2 text-sm font-semibold text-on-tertiary shadow-sm hover:bg-tertiary/80 focus-visible:outlin focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {submitting ? "Saving…" : "Choose Random A Name"}
        </button>
      </form>
    </div>
  );
}
