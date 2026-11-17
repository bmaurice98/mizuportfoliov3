"use client";

import { useEffect } from "react";
import { tables } from "../src/module_bindings";
import { useTable } from "spacetimedb/react";
import { THEME_TOKENS, HEX6 } from "@/components/themeTokens";

export function ThemeSync() {
  const [rows] = useTable(tables.themeToken);

  useEffect(() => {
    const root = document.documentElement;
    const active = new Map(rows.map((r) => [r.token, r.value]));
    for (const [key, def] of Object.entries(THEME_TOKENS)) {
      const value = active.get(key);
      for (const cssVar of def.vars) {
        // re-validate before touching the DOM (defense in depth)
        if (value && HEX6.test(value)) root.style.setProperty(cssVar, value);
        else root.style.removeProperty(cssVar);
      }
    }
  }, [rows]);

  return null;
}
