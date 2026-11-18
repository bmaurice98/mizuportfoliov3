# Record Store Refactor — Repository Audit & Plan

_Phase 1 deliverable for the "Record Store Portfolio" spec (Section 14)._

## 1. Architecture overview

| Concern | What exists |
|---|---|
| Framework | Next.js **16.2.6** (App Router, Turbopack), React **19.2.4**, TypeScript strict |
| Entry | `app/layout.tsx` (root layout) → `app/page.tsx` (home). Other routes: `/projects`, `/experience`, `/contact`, `not-found` |
| Styling | Tailwind CSS v4 (`@theme` tokens in `app/globals.css`, Material-style names such as `bg-surface`, `text-on-surface-variant`). Fonts: Geist via `next/font`, Inter/Montserrat + Material Symbols via Google Fonts `<link>` |
| Animation | **No animation library.** Only Tailwind transitions, a hand-rolled FLIP in `expandableModal.tsx`, and a rAF loop in `useBotCursors.tsx` |
| Data | Static: `util/projects.json`, `util/experienceData.ts` (timeline, tech stack, practices), `util/siteConfig.ts`. Home/contact copy is hardcoded in components |
| Server actions | `app/actions.tsx#createInquiry` — reads the form but sends nothing (stub) |
| Realtime | SpacetimeDB 2.8 (`spacetimedb/` module, generated bindings in `src/module_bindings/`) |

## 2. Component inventory

**Global (rendered by `app/layout.tsx` on every route)** — all must keep working:
- `Providers` — `SpacetimeDBProvider` with `DbConnection.builder()` (env `NEXT_PUBLIC_SPACETIMEDB_HOST`/`_DB_NAME`, light mode).
- `NameGate` — first-visit cursor-name prompt (overlay), remembers name in localStorage for 30 days.
- `ThemeSync` — applies shared `theme_token` rows to `--color-*` CSS vars on `<html>`.
- `LobbyToast` — Hot Potato ready-up toast (fixed bottom-center).
- `CursorLayer` — renders other visitors' cursors + simulated "ghost" bots; sends `updateCursor` (normalized page coords + pathname) every 40 ms.
- `GameHUD` — left-edge 🎮 tab (start Hot Potato, toggle bots, rename) + top-right status stack.
- `Footer`.

**Per page**: `Navbar`/`MobileNavbar` (each page renders its own), `Hero`, `ProfessionalSummary`, `TechDisplay` (contains `ThemeEditor` — the live, shared theme console), `ProjectCard`, `ContactForm`, `SocialGraph`, `ExperienceTimelineSection` / `ExperienceTechStackSection` (+ `ExpandableModal`).

## 3. SpacetimeDB integration

Tables: `cursor` (public; identity, x, y, page, color, name, updatedAt), `hot_potato_game` (singleton), `ready_player`, `theme_token` (public), private `theme_rate`, scheduled `sweep` / `lobby_job` / `explosion_job`.

Reducers: `updateCursor`, `setCursorName`, `startHotPotato`, `readyUp`, `applyTheme`, `resetTheme`, plus scheduled `sweep_idle_cursors`, `resolve_lobby`, `trigger_explosion`. `clientDisconnected` cleans up rows.

Key coupling facts:
- Cursor position is **page-relative** (`pageX / scrollWidth`) and keyed by `pathname`; bomb transfer compares `page` + distance server-side.
- `ThemeSync` writes `--color-background`, `--color-primary`, `--color-secondary`, etc. Anything styled with those tokens is re-themed by visitors.
- Nothing in the realtime layer knows about page content, so the record store can be added without touching the module or bindings.

## 4. Functionality that must be preserved

1. Live visitor cursors + names, idle filtering, ghost bots and their toggle.
2. Name gate + rename.
3. Hot Potato (lobby, ready-up, bomb transfer, explosion, banners, audio).
4. Shared live theme editor (`applyTheme` / `resetTheme`) and its contrast guard.
5. All portfolio content: hero copy, three pillars, tech bento, projects, experience timeline, tech stack, practices, contact links, contact form, resume download.
6. Existing routes `/projects`, `/experience`, `/contact` (SEO metadata and JSON-LD on `/experience`).

## 5. Mapping to the new architecture

| Spec layer | Implementation |
|---|---|
| Presentation | `components/recordStore/*` — `RecordStore` (shell), `StoreHeader`, `RecordCrate` (collection + dividers), `RecordSleeve`/`SleeveArt`, `Turntable` (deck, platter, tonearm), `VinylDisc`, `ListeningRoom`, `TrackBlocks`, `TransitionStage` (choreography) |
| Application state | `useRecordMachine.ts` — explicit reducer state machine, guarded transitions; URL sync (`?record=id`) for back button + deep links |
| Theme engine | `themes.ts` (central token table, typed), applied as `--rs-*` custom properties registered with `@property` so they cross-fade. Separate namespace from the shared `--color-*` tokens so the live theme editor keeps working; the **B-Sides** theme deliberately reads the shared tokens, so visitors' theme edits "press" that record |
| Content | `util/records.ts` — data-driven records → tracks → blocks, built from the existing `projects.json` / `experienceData.ts` (no duplication) |
| Realtime | Unchanged. `CursorLayer`, `GameHUD`, `LobbyToast`, `NameGate`, `ThemeSync` keep rendering from the root layout. `ThemeEditor` and `ContactForm` are reused inside records |

Only `app/page.tsx` changes route-wise: `/` becomes the store. Legacy routes stay as-is.

## 6. Technical challenges

- **Cursor coordinates vs. state**: cursors are keyed by pathname only. A visitor listening to a record and one browsing the crate share `/`, so positions don't map to the same content. Selection stays local (spec 9.4); a later Phase 5 option is a presence "room" key such as `/#record-id`.
- **Inner scroll containers**: listening content scrolls inside a container, while cursors use document coordinates — acceptable for now, same caveat as above.
- **Element hand-off**: the sleeve/vinyl must move from the crate into a different layout. Solved with a fixed "stage" layer that animates clones between measured rects (FLIP) and swaps to the real elements at rest, so no layout is animated.
- **Theme cross-fades**: CSS custom properties only transition when registered with `@property`.
- **Turbopack/Next 16**: native `history.pushState` integrates with the router; used for `?record=` without remounting.
- **No modals**: listening view is the page layout itself; the existing `ExpandableModal` stays only on the legacy `/experience` route.

### Existing bugs found during audit (not yet fixed)
- `Navbar` resume link points to `/Resume/...` but the folder is `public/resume` → 404 on case-sensitive hosts. The store header uses `/resume/...`.
- `SocialGraph` GitHub/LinkedIn hrefs lack `https://` (resolve as relative paths); displayed email differs from the `mailto:`.
- `createInquiry` server action doesn't send anything.
- `NameGate` logs the stored name with `console.log`.

## 7. Phased plan

1. **Audit** (this doc).
2. **Foundation** — record data, theme table, state machine, store header, crate with dividers, wheel/drag/keyboard/touch browsing.
3. **Selection + turntable** — pull → open sleeve → extract vinyl → place → spin, plus the reverse return; skip control, reduced-motion path, URL/back-button support.
4. **Listening** — two-column (desktop) / stacked (mobile) room, track list + now playing, scroll-spy, block renderers, reused `ThemeEditor` / `ContactForm`.
5. **Realtime** — verify cursors/HUD/games over the new page; optional per-record presence rooms.
6. **Refinement** — textures, motion polish, cross-browser, cleanup of now-unused home components, fix the bugs above.

## 8. Status — vertical slice (Phases 2–4)

Implemented in `components/recordStore/`, `util/records.ts`, `app/page.tsx`:
- Crate with dividers; wheel, click-drag, touch swipe (snap), arrow/Home/End keys, Enter/click to play.
- Full choreography: pull → hinge open → extract → carry to platter → spin-up + tonearm → room; and the reverse back into the crate. Skip button, Escape, browser Back, `?record=` deep links, reduced-motion instant path.
- Six themed records built from existing data; `ThemeEditor` (live SpacetimeDB theme) lives on **B-Sides**, `ContactForm` on **Contact**.
- Realtime layer untouched; cursors, bots, Hot Potato HUD and name gate still render from the root layout.

Not done yet: per-record presence rooms (Phase 5), cleanup of the now-unused home components (`hero`, `professionalSummary`, `techDisplay`), the audit bugs in §6, and real-device / Safari / Firefox testing. The "Why A Record Store" track copy in `util/records.ts` is new placeholder text to review.
