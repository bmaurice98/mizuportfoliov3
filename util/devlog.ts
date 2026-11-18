/**
 * Dev log entries for the Dev Log record. Newest first; grouped into tracks
 * by month automatically (see util/records.ts).
 *
 * Entries below are written from this repository's commit history.
 */

export type DevLogEntry = {
  /** ISO date, e.g. "2026-11-17". */
  date: string;
  title: string;
  body: string[];
  tags?: string[];
  /** Optional commit hashes or links for reference. */
  refs?: { label: string; href?: string }[];
};

const REPO = "https://github.com/bmaurice98/mizuportfoliov3";
const commit = (hash: string) => ({ label: hash, href: `${REPO}/commit/${hash}` });

export const DEVLOG: DevLogEntry[] = [
  {
    date: "2026-11-17",
    title: "Listening booths, follow mode and three new records",
    body: [
      "Visitors can now see which records other people have on their turntables — a small spinning marker sits on the sleeve in the crate — and opt in to follow someone, so their record and track changes carry over to your turntable.",
      "Cursors are now shared per room: the crate floor, or the record you're playing. Added the Dev Log you're reading, a Photo Gallery, and a Heavy Rotation record wired for Last.fm listening stats. The legacy /projects, /experience and /contact pages now redirect into their records.",
    ],
    tags: ["SpacetimeDB", "Presence", "Content"],
  },
  {
    date: "2026-11-17",
    title: "The shop opens",
    body: [
      "Rebuilt the home page as a record store. Records sit behind cardboard dividers in a wooden crate; selecting one pulls it out, opens the jacket, slides the vinyl onto a turntable and turns the page into that record's themed listening room.",
      "No animation library: CSS 3D transforms, the Web Animations API and @property-registered colour tokens, driven by an explicit state machine so a skip or an interrupted transition can't strand anyone.",
    ],
    tags: ["Next.js", "Animation", "Design"],
    refs: [commit("a272990")],
  },
  {
    date: "2026-11-16",
    title: "A shared theme editor and ghost cursors",
    body: [
      "Any visitor can now restyle the site for everyone by editing a small theme snippet. Changes go through a SpacetimeDB reducer that rejects low-contrast combinations and rate-limits each visitor.",
      "When the site is quiet, simulated visitors drift around on minimum-jerk Bézier paths so it never feels empty.",
    ],
    tags: ["SpacetimeDB", "Realtime"],
    refs: [commit("56e4780")],
  },
  {
    date: "2026-08-13",
    title: "Cursor polish",
    body: [
      "Bystander cursors fade during a game round so players stand out, and remembered cursor names are re-applied on reconnect.",
    ],
    tags: ["UX"],
    refs: [commit("5050443")],
  },
  {
    date: "2026-08-12",
    title: "Renames and a ready-up queue",
    body: [
      "Visitors can rename their cursor at any time, and Hot Potato rounds now open a short lobby so only players who ready up can be handed the bomb.",
    ],
    tags: ["Games"],
    refs: [commit("7080dc4")],
  },
  {
    date: "2026-08-11",
    title: "Hot Potato",
    body: [
      "The first multiplayer game: pass the bomb by touching another player's cursor before the timer runs out. Bomb transfers are resolved server-side with a short hold immunity so it can't ping-pong every frame. Added sound for the explosion and the win.",
    ],
    tags: ["Games", "SpacetimeDB"],
    refs: [commit("2768b2e"), commit("df5fa90")],
  },
  {
    date: "2026-08-08",
    title: "Names and idle timeouts",
    body: [
      "Custom cursor names with a profanity filter, document-relative cursor tracking, and a scheduled sweep that clears idle cursors.",
    ],
    tags: ["Realtime"],
    refs: [commit("ca357de"), commit("2b73e4b")],
  },
  {
    date: "2026-08-07",
    title: "Live cursors",
    body: [
      "Wired the site to a SpacetimeDB module so every visitor's cursor is visible to everyone else in real time.",
    ],
    tags: ["SpacetimeDB"],
    refs: [commit("c46c752")],
  },
  {
    date: "2026-05-25",
    title: "Portfolio V3 begins",
    body: ["Started the third version of this portfolio on Next.js."],
    tags: ["Next.js"],
    refs: [commit("3edcac8")],
  },
];
