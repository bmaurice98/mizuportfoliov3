export const THEME_TOKENS = {
  background: {
    vars: ["--color-background", "--color-surface", "--color-surface-dim"],
    default: "#09151a",
  },
  text: { vars: ["--color-primary"], default: "#ffffff" },
  muted: { vars: ["--color-on-surface-variant"], default: "#c2c7c8" },
  accent: { vars: ["--color-secondary"], default: "#98d0d7" },
  accentDeep: { vars: ["--color-secondary-container"], default: "#115157" },
  card: { vars: ["--color-surface-container-high"], default: "#202c32" },
} as const;

export type ThemeKey = keyof typeof THEME_TOKENS;

export const HEX6 = /^#[0-9a-f]{6}$/i;
const STATEMENT_RE =
  /^theme\.([A-Za-z]+)\s*=\s*["']?(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}))["']?$/;

// Client-side pre-check for instant feedback. The server is the authority.
export function checkSnippet(snippet: string): string | null {
  const statements = snippet
    .split(/[\n;]/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("//"));
  if (statements.length === 0) return "Nothing to apply.";
  for (const stmt of statements) {
    const m = STATEMENT_RE.exec(stmt);
    if (!m) return `Couldn't read: ${stmt.slice(0, 40)}`;
    if (!Object.hasOwn(THEME_TOKENS, m[1])) {
      return `Unknown target "${m[1]}". Try: ${Object.keys(THEME_TOKENS).join(", ")}`;
    }
  }
  return null;
}
