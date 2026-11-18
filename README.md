# DevMizu Records

The portfolio of Brandon Maurice, built as an interactive vinyl record store.

Visitors browse a crate of records, pull one from its divider, open the sleeve, and place the vinyl on a turntable. Once it's spinning, the site takes on that record's look and its contents become the page: projects, experience, tech stack, experiments and contact details, each organised as tracks.

Other visitors browse alongside you: their cursors are synced live through SpacetimeDB, and a few multiplayer extras (a shared theme editor and a cursor game) run on top.

---

## Features

### The record store (`/`)
- **Crate browsing** — sleeves filed behind cardboard dividers in a wooden crate. Hover or focus lifts a sleeve and nudges its neighbours aside. Browse with the scroll wheel, trackpad, click-and-drag, touch swipe, or the arrow / Home / End keys.
- **Selection sequence** — pull the record → the jacket hinges open → the vinyl slides out of its inner sleeve → it's carried onto the platter → the tonearm lowers and the platter spins up → the room changes to the record's theme.
- **Listening room** — not a modal; it *is* the page while a record plays. Artwork and turntable stay anchored while the tracks scroll (side-by-side on desktop, stacked on mobile). The track list follows your scroll position, and the turntable's Start/Stop key pauses the spin.
- **Returning** — the same sequence in reverse, back into the same slot in the crate. Leave via the Crates button, `Esc`, or the browser's Back button.
- **Deep links** — every record has a URL (`/?record=discography`).
- **Accessible** — semantic buttons and landmarks, roving keyboard focus, visible focus states, live-region announcements, a Skip button during transitions, and an instant path for `prefers-reduced-motion`. No sound is ever required.

### The collection

| Record | Divider | Content | Theme |
|---|---|---|---|
| About Me | Intro | Introduction and principles | Warm analog — cream, amber, editorial serif |
| Discography | Releases | Projects, one per track | Digital — deep blue, silver, grotesk |
| Session Work | Releases | Client and studio experience | Late-night — oxblood and brass |
| Technical Notes | Studio | Stack, infrastructure, practices | Schematic — paper and signal orange, mono |
| B-Sides | Studio | Live theme editor, Hot Potato, ghost cursors | Uses the shared, visitor-edited theme |
| Contact | Booking | Links and contact form | Minimal — black, white, one accent |

### Real-time (SpacetimeDB)
- **Live cursors** with names and colours for every visitor, plus simulated "ghost" visitors when the site is quiet (toggleable).
- **Name gate** — pick or randomise a cursor name; it's remembered for 30 days.
- **Hot Potato** — an opt-in multiplayer cursor game. Ready up in the lobby, then pass the bomb by touching other players' cursors before the timer runs out.
- **Shared theme editor** — edit a small snippet and the change is pushed to everyone. A server-side contrast guard keeps the site readable. It lives on the B-Sides record, whose colours come from this shared theme.

Picking a record is always local: one visitor's selection never changes what anyone else sees.

---

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) and React 19
- TypeScript
- Tailwind CSS 4, plus plain CSS for the store (`components/recordStore/recordStore.css`)
- [SpacetimeDB](https://spacetimedb.com) 2 for real-time state
- No animation library: CSS 3D transforms, the Web Animations API, and `@property`-registered custom properties for theme cross-fades

---

## Getting started

```bash
npm install
```

Create `.env.local` with your SpacetimeDB connection:

```bash
NEXT_PUBLIC_SPACETIMEDB_HOST=https://maincloud.spacetimedb.com
NEXT_PUBLIC_SPACETIMEDB_DB_NAME=<your-database-name>
# Optional: canonical site URL used for metadata
NEXT_PUBLIC_SITE_URL=https://devmizu.tech
```

Run the dev server, then open http://localhost:3000:

```bash
npm run dev
```

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run generate` | Regenerate the TypeScript client bindings in `src/module_bindings/` from the SpacetimeDB module |
| `npm run publish` | Publish the SpacetimeDB module to maincloud |
| `npm run clear` | Republish the module and **clear its data** |

---

## Project structure

```
app/
  page.tsx              Record store entry (fonts + <RecordStore />)
  layout.tsx            Root layout: SpacetimeDB provider, cursors, HUD, name gate, theme sync
  projects/ experience/ contact/   Original pages, still served
components/
  recordStore/
    RecordStore.tsx     Store shell: state, URL sync, theme, layout of the two "floors"
    useRecordMachine.ts Explicit state machine for the record interaction
    RecordCrate.tsx     The browsable crate and dividers
    SleeveArt.tsx       Procedural SVG album covers
    VinylDisc.tsx       Vinyl with motor-style spin-up / coast-down
    Turntable.tsx       Plinth, platter, tonearm, start/stop key
    TransitionStage.tsx Choreography between crate, hands, platter and back
    ListeningRoom.tsx   Listening layout, track list, scroll-spy
    TrackBlocks.tsx     Renderers for track content blocks
    themes.ts           Central theme table (--rs-* tokens)
    recordStore.css     Store styles, textures, responsive rules
  ui/                   HUD, theme editor, lobby toast, etc.
util/
  records.ts            The record collection (data-driven)
  projects.json, experienceData.ts, siteConfig.ts   Source content
spacetimedb/src/index.ts  SpacetimeDB module: tables, reducers, scheduled jobs
src/module_bindings/      Generated client bindings (do not edit by hand)
docs/record-store-audit.md  Architecture audit and refactor plan
```

### How it fits together
- **Presentation** (`components/recordStore`) knows nothing about SpacetimeDB.
- **Application state** lives in one reducer (`useRecordMachine.ts`): `browsing → pulling-record → opening-sleeve → removing-vinyl → placing-vinyl → playing → listening → returning`. Animations only report "phase finished"; stale or duplicate reports are ignored, so a skip or an interruption can't leave the UI stuck.
- **Real-time** components are mounted once in the root layout and work on every route.

### Adding or editing a record
Add an entry to `RECORDS` in `util/records.ts`: an id, title, divider, theme id, sleeve art kind, palette, and a list of tracks made of content blocks (`text`, `list`, `chips`, `project`, `credit`, `links`, `widget`, …). New themes go in `components/recordStore/themes.ts`. No component changes are needed.

---

## Roadmap

**Real-time integration**
- Per-record presence rooms, so cursors are only shared with visitors listening to the same record (today cursors are shared per page path).
- Seeing which records other visitors are holding or playing, e.g. a small marker on the sleeve in the crate.
- Opt-in shared listening sessions: follow another visitor's record and track.
- More rotating multiplayer games alongside Hot Potato (the weekly game schedule in `shared/gameModes.ts` is already in place).

**Content**
- Richer case-study tracks for each project (concept, production, technical details, final mix) with images, video and code samples.
- New records as work lands; each one is a data entry.
- A working contact form backend (the current server action is a stub).

**Polish**
- Finer textures and animation tuning; testing on Safari, Firefox and real devices.
- Lazy-loading heavier track media.
- Removing the now-unused original home-page components and deciding whether the original `/projects`, `/experience` and `/contact` routes should redirect into their records.
- Fixing small known issues: the résumé link casing in the legacy navbar and missing `https://` on legacy contact links.

---

## Author

Brandon Maurice — [GitHub](https://github.com/bmaurice98) · [LinkedIn](https://www.linkedin.com/in/bmaurice98/)
