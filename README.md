# DevMizu Records

The portfolio of Brandon Maurice, built as an interactive vinyl record store.

Visitors browse a crate of records, pull one from its divider, open the sleeve, and place the vinyl on a turntable. Once it's spinning, the site takes on that record's look and its contents become the page: projects, experience, tech stack, a dev log, photos, listening stats and contact details, each organised as tracks.

Other visitors browse alongside you: their cursors are synced live through SpacetimeDB, you can see which records they're playing and follow along, and a few multiplayer extras (a shared theme editor and a cursor game) run on top.

---

## Features

### The record store (`/`)

- **Crate browsing** — sleeves filed behind cardboard dividers in a wooden crate. Hover or focus lifts a sleeve and nudges its neighbours aside. Browse with the scroll wheel, trackpad, click-and-drag, touch swipe, or the arrow / Home / End keys.
- **Selection sequence** — pull the record → the jacket hinges open → the vinyl slides out of its inner sleeve → it's carried onto the platter → the tonearm lowers and the platter spins up → the room changes to the record's theme.
- **Listening room** — not a modal; it _is_ the page while a record plays. Artwork and turntable stay anchored while the tracks scroll (side-by-side on desktop, stacked on mobile). The track list follows your scroll position, and the turntable's Start/Stop key pauses the spin.
- **Collapsible track menu** — "Hide tracks" folds the track list up into a one-line bar showing the current track, so long or double-sided records leave more room for reading. The choice is remembered per visitor.
- **Side A / Side B** — records can be double-sided: tracks are numbered A1/B1, the list is grouped by side, a "flip the record" break separates the sides, and the vinyl flips over when you cross to the other side.
- **Returning** — the same sequence in reverse, back into the same slot in the crate. Leave via the Crates button, `Esc`, or the browser's Back button.
- **Deep links** — every record has a URL (`/?record=discography`).
- **Accessible** — semantic buttons and landmarks, roving keyboard focus, visible focus states, live-region announcements, a Skip button during transitions, and an instant path for `prefers-reduced-motion`. No sound is ever required.

### The collection

| Record          | Divider       | Content                                                                                 | Theme                                           |
| --------------- | ------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------- |
| About Me        | Intro         | Introduction and principles                                                             | Warm analog — cream, amber, editorial serif     |
| Discography     | Releases      | Projects, one per track, with optional case studies                                     | Digital — deep blue, silver, grotesk            |
| Session Work    | Releases      | Side A: client and studio work · Side B: IT support and technician work, plus résumé    | Late-night — oxblood and brass                  |
| Technical Notes | Studio        | Stack, infrastructure, practices                                                        | Schematic — paper and signal orange, mono       |
| B-Sides         | Studio        | Live theme editor, Hot Potato, ghost cursors                                            | Uses the shared, visitor-edited theme           |
| Dev Log         | Studio        | Changelog entries, one track per month (`util/devlog.ts`)                               | Notebook — lined paper, fountain-pen blue       |
| Heavy Rotation  | Off The Clock | Side A: now playing, top artists / albums / songs, stats · Side B: MizuMaiNichi tracking | Late-night radio — indigo and dial-light yellow |
| Photo Gallery   | Off The Clock | Photo rolls as contact sheets (`util/gallery.ts`)                                       | Darkroom — red safelight                        |
| Contact         | Booking       | Email and social links                                                                  | Minimal — black, white, one accent              |

The old `/projects`, `/experience` and `/contact` URLs redirect (307) to their records.

### Heavy Rotation: listening stats and song tracking

Side A shows what's on my headphones, from Last.fm: the current or last-played song, top artists, albums and songs for the period, and lifetime numbers. Last.fm no longer serves artist photos, so Top Artists looks each artist up on Spotify (exact name matches only, retrying with Japanese/Korean names where needed) and falls back to the artist's top album cover (`util/listening/artistImages.ts`).

Side B is the song tracking from my MizuMaiNichi music logger, ported from Python to TypeScript (`util/listening/lastfmTracking.ts`):

- **Daily Log** — five unique songs a day for the last week, with loved tracks marked and repeat plays counted. The newest day is enriched with genre tags (track tags merged with artist tags), my all-time play count, and the artist's listener count.
- **Genre Mix** — the week's listening by genre, weighted by how often each artist played. Listener-centric tags ("seen live", "favorites") are filtered out and spellings are unified (`rnb` → R&B).
- **Crate Digging** — the recommender's "by artists" mode: my most recent artists → similar artists → their top tracks, scored with the same rules (log-scaled popularity, a bonus for new artists and new tracks, a minimum-listener floor), one pick per artist.

Instead of the logger's SQLite/CSV storage, upstream responses are held in Next's fetch cache (5 minutes for scrobbles, up to a day for artist info).

### Real-time (SpacetimeDB)

- **Live cursors** with names and colours for every visitor, plus simulated "ghost" visitors when the site is quiet (toggleable).
- **Name gate** — pick or randomise a cursor name; it's remembered for 30 days.
- **Rooms** — cursors are shared per room: the crate floor, or the record you're playing.
- **Listening booths** — a spinning marker on a sleeve shows how many other visitors are playing it, and the shop floor lists who's spinning what.
- **Follow mode** — opt in to follow another visitor: when they change record or track, your turntable follows. Returning to the crates ends it. Visitors can stop sharing what they play from the 🎮 menu ("Share what I'm playing").
- **Hot Potato** — an opt-in multiplayer cursor game. Ready up in the lobby, then pass the bomb by touching other players' cursors (in the same room) before the timer runs out.
- **Shared theme editor** — edit a small snippet and the change is pushed to everyone. A server-side contrast guard keeps the site readable. It lives on the B-Sides record, whose colours come from this shared theme.

Picking a record is always local: one visitor's selection never changes what anyone else sees unless that person chose to follow them.

---

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) and React 19
- TypeScript
- Tailwind CSS 4, plus plain CSS for the store (`components/recordStore/recordStore.css`)
- [SpacetimeDB](https://spacetimedb.com) 2 for real-time state
- [Last.fm API](https://www.last.fm/api) for listening stats (server-side only)
- No animation library: CSS 3D transforms, the Web Animations API, and `@property`-registered custom properties for theme cross-fades

---

## Getting started

```bash
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SPACETIMEDB_HOST=https://maincloud.spacetimedb.com
NEXT_PUBLIC_SPACETIMEDB_DB_NAME=<your-database-name>
# Optional: canonical site URL used for metadata
NEXT_PUBLIC_SITE_URL=https://devmizu.tech

# Optional: Heavy Rotation (server-side only, never sent to the browser)
LASTFM_API_KEY=<your-lastfm-api-key>
LASTFM_USERNAME=<your-lastfm-username>
LASTFM_PERIOD=1month                      # 7day | 1month | 3month | 6month | 12month | overall
LISTENING_TIMEZONE=America/Los_Angeles    # where a Daily Log day starts and ends
# Optional: artist photos on Top Artists (Spotify app credentials, no user sign-in)
SPOTIFY_CLIENT_ID=<your-spotify-client-id>
SPOTIFY_CLIENT_SECRET=<your-spotify-client-secret>
# Reserved for the future Spotify stats provider (util/listening/spotify.ts is a stub):
# SPOTIFY_REFRESH_TOKEN=…
# LISTENING_PROVIDER=lastfm               # force a provider when several are configured
```

Without a listening provider, Heavy Rotation shows placeholder skeletons and a "not connected yet" note. Add the same variables to your hosting provider's environment for production.

After changing the SpacetimeDB module (`spacetimedb/src/index.ts`), run `npm run generate` and then `npm run publish` so the live database has the new tables and reducers.

Run the dev server, then open http://localhost:3000:

```bash
npm run dev
```

### Scripts

| Script                        | What it does                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `npm run dev`                 | Start the Next.js dev server                                                                    |
| `npm run build` / `npm start` | Production build and server                                                                     |
| `npm run lint`                | ESLint                                                                                          |
| `npm run generate`            | Regenerate the TypeScript client bindings in `src/module_bindings/` from the SpacetimeDB module |
| `npm run publish`             | Publish the SpacetimeDB module to maincloud                                                     |
| `npm run clear`               | Republish the module and **clear its data**                                                     |

### API routes

| Route                           | Returns                                                                 | Cache        |
| ------------------------------- | ----------------------------------------------------------------------- | ------------ |
| `GET /api/listening`            | Now playing, top artists / albums / songs, stats                        | 5 min        |
| `GET /api/listening/log`        | Daily Log (five unique songs a day) and the week's Genre Mix            | 5 min        |
| `GET /api/listening/recommend`  | Crate Digging recommendations seeded from recent listening              | 1 h (6 h SWR) |

---

## Project structure

```
app/
  page.tsx              Record store entry (fonts + <RecordStore />)
  layout.tsx            Root layout: SpacetimeDB provider, cursors, HUD, name gate, theme + listening sync
  api/listening/        Listening stats, daily log and recommendations
components/
  recordStore/
    RecordStore.tsx     Store shell: state, URL sync, theme, layout of the two "floors"
    useRecordMachine.ts Explicit state machine for the record interaction
    RecordCrate.tsx     The browsable crate and dividers
    SleeveArt.tsx       Procedural SVG album covers
    VinylDisc.tsx       Vinyl with motor-style spin-up / coast-down
    Turntable.tsx       Plinth, platter, tonearm, start/stop key
    TransitionStage.tsx Choreography between crate, hands, platter and back
    ListeningRoom.tsx   Listening layout, collapsible track list, sides, scroll-spy
    TrackBlocks.tsx     Renderers for track content blocks
    ContactSheet.tsx    Photo gallery (prints enlarge in place, no modal)
    ListeningWidget.tsx Heavy Rotation views (stats, daily log, genre mix, recommendations)
    Booths.tsx          Who's spinning what + follow controls
    StoreJsonLd.tsx     Structured data (Person / ProfilePage)
    themes.ts           Central theme table (--rs-* tokens)
    recordStore.css     Store styles, textures, responsive rules
  realtime/listening.tsx  Publishes this visitor's record; joins listeners with cursors
  ui/                   HUD, theme editor, lobby toast, etc.
shared/presence.ts      Framework-free bridge between the store and the real-time layer
util/
  records.ts            The record collection (data-driven)
  devlog.ts, gallery.ts Dev log entries and photo rolls
  listening/            Types, providers (lastfm.ts, spotify.ts) and song tracking (lastfmTracking.ts)
  projects.json, experienceData.ts, siteConfig.ts   Source content
spacetimedb/src/index.ts  SpacetimeDB module: tables, reducers, scheduled jobs
src/module_bindings/      Generated client bindings (do not edit by hand)
docs/record-store-audit.md  Architecture audit and refactor plan
```

### How it fits together

- **Presentation** (`components/recordStore`) knows nothing about SpacetimeDB.
- **Application state** lives in one reducer (`useRecordMachine.ts`): `browsing → pulling-record → opening-sleeve → removing-vinyl → placing-vinyl → playing → listening → returning`. Animations only report "phase finished"; stale or duplicate reports are ignored, so a skip or an interruption can't leave the UI stuck.
- **Real-time** components are mounted once in the root layout. The store publishes what's on the turntable through a tiny framework-free store (`shared/presence.ts`); the real-time layer reads it, so neither imports the other.
- **Listening data** is fetched server-side by a provider (`util/listening/providers.ts` picks the first configured one); the browser only ever sees the route handlers' JSON.

### Adding or editing a record

Add an entry to `RECORDS` in `util/records.ts`: an id, title, divider, theme id, sleeve art kind, palette, and a list of tracks made of content blocks (`text`, `list`, `chips`, `quote`, `image`, `video`, `code`, `photos`, `log`, `project`, `credit`, `links`, `widget`, …). New themes go in `components/recordStore/themes.ts`. No component changes are needed.

**Side B:** give a track `side: "B"` and the record becomes double-sided: tracks are numbered A1/B1, the track list is grouped by side, a "flip the record" break separates the sides, and the vinyl flips over when playback crosses to the other side.

**Project case studies:** add a `caseStudy` array to a project in `util/projects.json` — e.g. sections titled _The Concept_, _Production_, _Technical Details_, _Final Mix_, each with its own blocks — and it renders after the project summary on the Discography record.

**Photos:** put files in `public/gallery/<roll>/` and list them in `util/gallery.ts`. **Dev log:** add entries to `util/devlog.ts`.

---

## Roadmap

**Recently shipped**

- Artist photos on Top Artists via Spotify (Last.fm stopped serving them), falling back to the artist's top album cover.
- Heavy Rotation Side B: Daily Log, Genre Mix and Crate Digging, ported from the MizuMaiNichi logger.
- Side A / Side B records (Session Work's technician résumé, Heavy Rotation's song tracking) and a collapsible track menu.
- Per-record cursor rooms, listening markers on sleeves, and opt-in follow mode.
- Dev Log, Photo Gallery and Heavy Rotation records; image, video, code, quote and case-study blocks.
- Legacy pages folded into records (redirects), unused components and the contact form removed.

**Next up**

- Heavy Rotation: implement the Spotify stats provider and a genre-mode recommender (pick tags, like MizuMaiNichi's genre mode).
- Photo Gallery: add the first rolls of photos.
- Case studies for each project.
- More rotating multiplayer games alongside Hot Potato (the weekly schedule in `shared/gameModes.ts` is ready but not wired up).
- Hot Potato across rooms: today players can only tag cursors in the same room.
- Server-side cleanup of listener rows left behind by dropped connections (the client already hides them).
- Finer textures and animation tuning; testing on Safari, Firefox and real devices.

---

## Author

Brandon Maurice — [GitHub](https://github.com/bmaurice98) · [LinkedIn](https://www.linkedin.com/in/bmaurice98/)
