/**
 * Central theme table for the record store.
 *
 * Every visual token used by the store is an `--rs-*` custom property.
 * Records pick a theme by id (see util/records.ts); the store shell applies
 * the tokens as inline custom properties, which are registered with
 * `@property` in recordStore.css so they cross-fade instead of flashing.
 *
 * Kept in a separate namespace from the shared `--color-*` tokens that the
 * live (SpacetimeDB) theme editor controls — except "bsides", which reads
 * those shared tokens on purpose.
 */

export type ThemeTokens = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  deck: string;
  deckEdge: string;
  fontDisplay: string;
  fontBody: string;
};

export type ThemeId =
  | "shop"
  | "about"
  | "discography"
  | "session"
  | "technical"
  | "bsides"
  | "devlog"
  | "rotation"
  | "darkroom"
  | "contact";

const SERIF = "var(--font-rs-serif), Georgia, serif";
const GROTESK = "var(--font-rs-grotesk), system-ui, sans-serif";
const MONO = "var(--font-rs-mono), ui-monospace, monospace";
const SYNE = "var(--font-rs-syne), system-ui, sans-serif";
const INTER = "Inter, var(--font-geist-sans), system-ui, sans-serif";

export const THEMES: Record<ThemeId, ThemeTokens> = {
  // The shop floor itself: warm, dim, wood and cardboard.
  shop: {
    bg: "#16110c",
    surface: "#241b13",
    text: "#f1e6d2",
    muted: "#b5a385",
    accent: "#e0a458",
    accent2: "#7a4a24",
    deck: "#3a2a1c",
    deckEdge: "#1c140d",
    fontDisplay: SERIF,
    fontBody: INTER,
  },
  // Warm analog: cream, amber, muted orange, editorial serif.
  about: {
    bg: "#f1e4c9",
    surface: "#e6d2ab",
    text: "#2b1d10",
    muted: "#6b5236",
    accent: "#b4541a",
    accent2: "#e3a33b",
    deck: "#8a5a34",
    deckEdge: "#4d2f18",
    fontDisplay: SERIF,
    fontBody: SERIF,
  },
  // Digital / technical: deep blue, charcoal, silver.
  discography: {
    bg: "#0d1626",
    surface: "#16233a",
    text: "#e7edf5",
    muted: "#93a4bd",
    accent: "#6aa0e2",
    accent2: "#c3ccd8",
    deck: "#2a3446",
    deckEdge: "#121a26",
    fontDisplay: GROTESK,
    fontBody: GROTESK,
  },
  // Late-night session room: oxblood and brass.
  session: {
    bg: "#1d0f12",
    surface: "#2c171b",
    text: "#f3e3d3",
    muted: "#c7a99a",
    accent: "#d4a24c",
    accent2: "#8c2f39",
    deck: "#4a2a22",
    deckEdge: "#22110e",
    fontDisplay: SERIF,
    fontBody: INTER,
  },
  // Schematic paper with a signal-orange accent.
  technical: {
    bg: "#e9ece6",
    surface: "#dde2da",
    text: "#13201b",
    muted: "#4b5a52",
    accent: "#c2410c",
    accent2: "#3c6e5a",
    deck: "#c9cec6",
    deckEdge: "#8d958b",
    fontDisplay: MONO,
    fontBody: GROTESK,
  },
  // Experimental — colours come from the shared, visitor-edited tokens.
  bsides: {
    bg: "var(--color-background)",
    surface: "var(--color-surface-container-high)",
    text: "var(--color-primary)",
    muted: "var(--color-on-surface-variant)",
    accent: "var(--color-secondary)",
    accent2: "#ff5fa2",
    deck: "var(--color-secondary-container)",
    deckEdge: "#05080a",
    fontDisplay: SYNE,
    fontBody: GROTESK,
  },
  // Notebook: lined paper, fountain-pen blue, red margin.
  devlog: {
    bg: "#f3efe3",
    surface: "#e8e2d0",
    text: "#1b2a4a",
    muted: "#4f5d7a",
    accent: "#b8323f",
    accent2: "#1d3c78",
    deck: "#b9ad94",
    deckEdge: "#7d715a",
    fontDisplay: SERIF,
    fontBody: MONO,
  },
  // Late-night radio: indigo, violet and a warm dial-light yellow.
  rotation: {
    bg: "#100c1f",
    surface: "#1b1533",
    text: "#efe9ff",
    muted: "#a69cc9",
    accent: "#f7c548",
    accent2: "#7b5cff",
    deck: "#2a2148",
    deckEdge: "#120d22",
    fontDisplay: GROTESK,
    fontBody: GROTESK,
  },
  // Darkroom: near-black under a red safelight.
  darkroom: {
    bg: "#110b0a",
    surface: "#1d1412",
    text: "#f5ebe4",
    muted: "#b9a59c",
    accent: "#ef5350",
    accent2: "#7a1f1d",
    deck: "#2a1c19",
    deckEdge: "#0b0706",
    fontDisplay: SERIF,
    fontBody: INTER,
  },
  // Minimal: black, white, one restrained accent.
  contact: {
    bg: "#0a0a0a",
    surface: "#161616",
    text: "#fafafa",
    muted: "#a3a3a3",
    accent: "#ff6a4d",
    accent2: "#fafafa",
    deck: "#1d1d1d",
    deckEdge: "#000000",
    fontDisplay: INTER,
    fontBody: INTER,
  },
};

/** Tokens → inline style object of CSS custom properties. */
export function themeStyle(id: ThemeId): React.CSSProperties {
  const t = THEMES[id];
  return {
    "--rs-bg": t.bg,
    "--rs-surface": t.surface,
    "--rs-text": t.text,
    "--rs-muted": t.muted,
    "--rs-accent": t.accent,
    "--rs-accent-2": t.accent2,
    "--rs-deck": t.deck,
    "--rs-deck-edge": t.deckEdge,
    "--rs-font-display": t.fontDisplay,
    "--rs-font-body": t.fontBody,
  } as React.CSSProperties;
}
