/**
 * The record collection. Everything the store renders comes from here:
 * add, remove, reorder or rename records without touching components.
 *
 * Content is assembled from the existing data sources (projects.json,
 * experienceData.ts) so there is a single source of truth per fact.
 */
import projectsJson from "@/util/projects.json" with { type: "json" };
import {
  PRACTICES,
  TECH_STACK,
  TIMELINE,
  type TimelineEntry,
} from "@/util/experienceData";
import type { ThemeId } from "@/components/recordStore/themes";
import { ROLLS, type Photo } from "@/util/gallery";
import { DEVLOG, type DevLogEntry } from "@/util/devlog";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Project = {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  github?: string;
  image?: string;
  /**
   * Optional case study, rendered after the project summary. Suggested
   * sections: The Concept · Production · Technical Details · Final Mix.
   */
  caseStudy?: { title: string; blocks: Block[] }[];
};

export type LinkItem = {
  label: string;
  value: string;
  href: string;
  icon: string;
};

export type Block =
  | { type: "lede"; text: string }
  | { type: "text"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "chips"; label?: string; items: string[] }
  | {
      type: "pillars";
      items: { icon: string; title: string; text: string }[];
    }
  | { type: "stat"; value: string; label: string }
  | { type: "project"; project: Project }
  | { type: "credit"; entry: TimelineEntry }
  | { type: "links"; items: LinkItem[] }
  | { type: "image"; src: string; alt: string; width: number; height: number; caption?: string }
  | { type: "video"; src: string; title: string; poster?: string; caption?: string }
  | { type: "code"; code: string; lang?: string; caption?: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "photos"; photos: Photo[]; empty?: string }
  | { type: "log"; entry: DevLogEntry }
  | { type: "widget"; widget: WidgetId; view?: ListeningView };

export type WidgetId = "theme-console" | "games" | "listening";
export type ListeningView = "now-playing" | "top-artists" | "top-albums" | "top-tracks" | "stats";

export type Track = {
  id: string;
  title: string;
  blocks: Block[];
};

/** Procedural sleeve artwork. No image assets required. */
export type SleeveArt =
  | { kind: "sunrise" }
  | { kind: "grid" }
  | { kind: "rings" }
  | { kind: "schematic" }
  | { kind: "riso" }
  | { kind: "type" }
  | { kind: "contact-sheet" }
  | { kind: "notebook" }
  | { kind: "bars" };

export type RecordDef = {
  id: string;
  title: string;
  artist: string;
  catalog: string;
  year: string;
  /** Divider this record is filed under. Dividers render in first-seen order. */
  divider: string;
  format: "LP" | "EP" | "12″";
  description: string;
  theme: ThemeId;
  art: SleeveArt;
  /** Colours used on the sleeve + centre label (independent of the page theme). */
  palette: { paper: string; ink: string; accent: string; accent2: string };
  tracks: Track[];
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type RawProject = {
  caseStudy?: Project["caseStudy"];
  projectTitle: string;
  projectDescription: string;
  projectTags: string[];
  projectLink?: string;
  projectImageUrl?: string;
  githubLink?: string;
};

const PROJECTS: Project[] = Object.values(
  projectsJson as Record<string, RawProject>,
).map((p) => ({
  title: p.projectTitle,
  description: p.projectDescription,
  tags: p.projectTags,
  link: p.projectLink,
  github: p.githubLink,
  image: p.projectImageUrl,
  caseStudy: p.caseStudy,
}));

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function blockWords(b: Block): string {
  switch (b.type) {
    case "lede":
    case "text":
    case "heading":
      return b.text;
    case "list":
    case "chips":
      return b.items.join(" ");
    case "pillars":
      return b.items.map((i) => `${i.title} ${i.text}`).join(" ");
    case "project":
      return `${b.project.title} ${b.project.description}`;
    case "credit":
      return `${b.entry.summary} ${b.entry.detail.overview}`;
    case "links":
      return b.items.map((i) => i.label).join(" ");
    case "stat":
      return b.label;
    case "quote":
      return b.text;
    case "code":
      return b.code;
    case "image":
    case "video":
      return b.caption ?? "x ".repeat(30);
    case "photos":
      return "x ".repeat(20 * Math.max(1, b.photos.length));
    case "log":
      return `${b.entry.title} ${b.entry.body.join(" ")}`;
    case "widget":
      return "x ".repeat(90); // interactive pieces "play" for a while
  }
}

/** Track length = estimated reading time, printed like a runtime (m:ss). */
export function trackLength(track: Track): string {
  const words = track.blocks
    .map(blockWords)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  // ~120 wpm: an unhurried "listening" pace.
  const secs = Math.max(30, Math.round((words / 120) * 60));
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Contact details (single source for the Contact record)              */
/* ------------------------------------------------------------------ */

export const RESUME_HREF = "/resume/BMResumeDev2026_Portfolio.pdf";

const CONTACT_LINKS: LinkItem[] = [
  {
    label: "Email",
    value: "brandon.maurice@devmizu.tech",
    href: "mailto:brandon.maurice@devmizu.tech",
    icon: "mail",
  },
  {
    label: "GitHub",
    value: "github.com/bmaurice98",
    href: "https://github.com/bmaurice98",
    icon: "code",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/bmaurice98",
    href: "https://www.linkedin.com/in/bmaurice98/",
    icon: "hub",
  },
  {
    label: "LeetCode",
    value: "leetcode.com/u/MizuPiku",
    href: "https://leetcode.com/u/MizuPiku/",
    icon: "terminal",
  },
  {
    label: "Spotify",
    value: "open.spotify.com/user/bmaurice100",
    href: "https://open.spotify.com/user/bmaurice100",
    icon: "headphones",
  },
];

/** Group dev log entries (newest first) into one track per month. */
function devlogTracks(entries: DevLogEntry[]): Track[] {
  const months = new Map<string, DevLogEntry[]>();
  for (const e of [...entries].sort((a, b) => b.date.localeCompare(a.date))) {
    const key = e.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), e]);
  }
  return [...months].map(([key, list]) => ({
    id: `log-${key}`,
    title: new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
    blocks: list.map<Block>((entry) => ({ type: "log", entry })),
  }));
}

/* ------------------------------------------------------------------ */
/* The collection                                                      */
/* ------------------------------------------------------------------ */

const ARTIST = "Dev Mizu";

export const RECORDS: RecordDef[] = [
  {
    id: "about",
    title: "About Me",
    artist: ARTIST,
    catalog: "DMZ-001",
    year: "2026",
    divider: "Intro",
    format: "LP",
    description:
      "Liner notes from a full-stack engineer: who I am and how I build.",
    theme: "about",
    art: { kind: "sunrise" },
    palette: {
      paper: "#f0e2c4",
      ink: "#2b1d10",
      accent: "#c4621d",
      accent2: "#e3a33b",
    },
    tracks: [
      {
        id: "intro",
        title: "Building With Precision",
        blocks: [
          { type: "lede", text: "Building with precision. Designed with clarity." },
          {
            type: "text",
            text: "I'm Brandon Maurice, a full-stack engineer. I engineer scalable, high-performance systems and applications, bridging the gap between a powerful backend and elegant front-end design.",
          },
        ],
      },
      {
        id: "philosophy",
        title: "Three Principles",
        blocks: [
          {
            type: "pillars",
            items: [
              {
                icon: "memory",
                title: "Core Engineering",
                text: "Building resilient microservices and distributed systems capable of handling sizeable data throughput with sub-millisecond latency.",
              },
              {
                icon: "visibility",
                title: "UI/UX Precision",
                text: "Translating complex data streams into intuitive interfaces that provide clarity without sacrificing technical depth.",
              },
              {
                icon: "security",
                title: "Zero-Trust Security",
                text: "Implementing robust encryption, secure authentication pipelines, and proactive threat modeling from the foundational layer up.",
              },
            ],
          },
        ],
      },
      {
        id: "this-store",
        title: "Why A Record Store",
        blocks: [
          {
            type: "text",
            text: "Music runs through a lot of what I build: a listening-history recommender, a shared Spotify queue, and now this shop. Every record here is a section of my portfolio. Pull one, put it on the platter, and the room changes to match.",
          },
          {
            type: "text",
            text: "You're not browsing alone, either. The other cursors you see are real visitors, synced live.",
          },
        ],
      },
    ],
  },
  {
    id: "discography",
    title: "Discography",
    artist: ARTIST,
    catalog: "DMZ-002",
    year: "2024–26",
    divider: "Releases",
    format: "LP",
    description: "Selected projects, one per track.",
    theme: "discography",
    art: { kind: "grid" },
    palette: {
      paper: "#111a29",
      ink: "#e7edf5",
      accent: "#5b91d5",
      accent2: "#c3ccd8",
    },
    tracks: PROJECTS.map((project) => ({
      id: slug(project.title),
      title: project.title,
      blocks: [
        { type: "project", project },
        ...(project.caseStudy ?? []).flatMap<Block>((section) => [
          { type: "heading", text: section.title },
          ...section.blocks,
        ]),
      ],
    })),
  },
  {
    id: "session-work",
    title: "Session Work",
    artist: ARTIST,
    catalog: "DMZ-003",
    year: "2022–27",
    divider: "Releases",
    format: "LP",
    description: "Credits from client and studio engagements.",
    theme: "session",
    art: { kind: "rings" },
    palette: {
      paper: "#2c1418",
      ink: "#f3e3d3",
      accent: "#d4a24c",
      accent2: "#8c2f39",
    },
    tracks: TIMELINE.map((entry) => ({
      id: entry.id,
      title: entry.company,
      blocks: [{ type: "credit", entry }],
    })),
  },
  {
    id: "technical-notes",
    title: "Technical Notes",
    artist: ARTIST,
    catalog: "DMZ-004",
    year: "2026",
    divider: "Studio",
    format: "EP",
    description: "The gear: stack, infrastructure and engineering practice.",
    theme: "technical",
    art: { kind: "schematic" },
    palette: {
      paper: "#e9ece6",
      ink: "#13201b",
      accent: "#ff5a1f",
      accent2: "#3c6e5a",
    },
    tracks: [
      ...TECH_STACK.map<Track>((item) => ({
        id: item.id,
        title: item.title,
        blocks: [
          { type: "heading", text: item.subtitle },
          { type: "text", text: item.detail.overview },
          ...item.detail.sections.map<Block>((s) =>
            s.list
              ? { type: "list", items: s.list }
              : { type: "chips", label: s.heading, items: s.chips ?? [] },
          ),
          { type: "chips", label: "Tools", items: item.detail.technologies },
        ],
      })),
      {
        id: "practices",
        title: "Tools & Practices",
        blocks: [
          ...PRACTICES.flatMap<Block>((p) => [
            { type: "heading", text: p.title },
            { type: "text", text: p.detail.overview },
            { type: "chips", items: p.detail.technologies },
          ]),
          { type: "heading", text: "Cloud Native" },
          {
            type: "text",
            text: "Deployment across GCP and Azure using Kubernetes.",
          },
          { type: "stat", value: "99.9%", label: "Uptime" },
        ],
      },
    ],
  },
  {
    id: "b-sides",
    title: "B-Sides",
    artist: ARTIST,
    catalog: "DMZ-005",
    year: "Live",
    divider: "Studio",
    format: "12″",
    description:
      "Experiments that run on this very site — pressed live by visitors.",
    theme: "bsides",
    art: { kind: "riso" },
    palette: {
      paper: "#c6ff3d",
      ink: "#14110f",
      accent: "#ff5fa2",
      accent2: "#3d2bff",
    },
    tracks: [
      {
        id: "live-pressing",
        title: "Live Pressing",
        blocks: [
          {
            type: "text",
            text: "This record has no fixed colours. Edit the snippet below and the change is pushed through SpacetimeDB to every visitor in real time — including the room you're standing in. A contrast guard on the server keeps it readable.",
          },
          { type: "widget", widget: "theme-console" },
        ],
      },
      {
        id: "hot-potato",
        title: "Hot Potato",
        blocks: [
          {
            type: "text",
            text: "A multiplayer cursor game. Open the 🎮 tab on the left edge, start a round, and pass the bomb by touching other players' cursors before the timer runs out.",
          },
          { type: "widget", widget: "games" },
        ],
      },
      {
        id: "ghost-cursors",
        title: "Ghost Cursors",
        blocks: [
          {
            type: "text",
            text: "Every cursor drifting around the shop belongs to a real visitor, synced through a SpacetimeDB module. When it's quiet, simulated visitors fill in — they move on minimum-jerk Bézier paths with a little hand tremor, and occasionally wander off to other pages.",
          },
          {
            type: "chips",
            label: "Built with",
            items: ["SpacetimeDB", "TypeScript", "React 19", "Next.js 16"],
          },
        ],
      },
    ],
  },
  {
    id: "dev-log",
    title: "Dev Log",
    artist: ARTIST,
    catalog: "DMZ-007",
    year: "Ongoing",
    divider: "Studio",
    format: "LP",
    description: "Liner notes from the workbench: what changed on this site and why.",
    theme: "devlog",
    art: { kind: "notebook" },
    palette: {
      paper: "#f3efe3",
      ink: "#1d3c78",
      accent: "#d1495b",
      accent2: "#9fb7d9",
    },
    tracks: devlogTracks(DEVLOG),
  },
  {
    id: "heavy-rotation",
    title: "Heavy Rotation",
    artist: ARTIST,
    catalog: "DMZ-008",
    year: "Live",
    divider: "Off The Clock",
    format: "LP",
    description: "What's actually on my headphones: favourite artists, albums and songs.",
    theme: "rotation",
    art: { kind: "bars" },
    palette: {
      paper: "#15102a",
      ink: "#efe9ff",
      accent: "#f7c548",
      accent2: "#7b5cff",
    },
    tracks: [
      {
        id: "now-playing",
        title: "Now Playing",
        blocks: [{ type: "widget", widget: "listening", view: "now-playing" }],
      },
      {
        id: "top-artists",
        title: "Top Artists",
        blocks: [{ type: "widget", widget: "listening", view: "top-artists" }],
      },
      {
        id: "top-albums",
        title: "Top Albums",
        blocks: [{ type: "widget", widget: "listening", view: "top-albums" }],
      },
      {
        id: "top-tracks",
        title: "Top Songs",
        blocks: [{ type: "widget", widget: "listening", view: "top-tracks" }],
      },
      {
        id: "stats",
        title: "By The Numbers",
        blocks: [{ type: "widget", widget: "listening", view: "stats" }],
      },
    ],
  },
  {
    id: "photo-gallery",
    title: "Photo Gallery",
    artist: ARTIST,
    catalog: "DMZ-009",
    year: "Prints",
    divider: "Off The Clock",
    format: "12″",
    description: "Contact sheets from behind the camera.",
    theme: "darkroom",
    art: { kind: "contact-sheet" },
    palette: {
      paper: "#141110",
      ink: "#f5ebe4",
      accent: "#e5383b",
      accent2: "#efe3d3",
    },
    tracks: ROLLS.map((roll) => ({
      id: roll.id,
      title: roll.date ? `${roll.title} · ${roll.date}` : roll.title,
      blocks: [
        ...(roll.note ? [{ type: "text", text: roll.note } as Block] : []),
        {
          type: "photos",
          photos: roll.photos,
          empty: "No prints on this roll yet.",
        },
      ],
    })),
  },
  {
    id: "contact",
    title: "Contact",
    artist: ARTIST,
    catalog: "DMZ-006",
    year: "Open",
    divider: "Booking",
    format: "12″",
    description: "Bookings, collaborations and technical consultations.",
    theme: "contact",
    art: { kind: "type" },
    palette: {
      paper: "#0b0b0b",
      ink: "#fafafa",
      accent: "#ff4d2e",
      accent2: "#fafafa",
    },
    tracks: [
      {
        id: "coordinates",
        title: "Coordinates",
        blocks: [
          {
            type: "text",
            text: "Open a channel for inquiries, collaborations, or technical consultations. Email is the fastest way to reach me. Operating from PST-5; responses typically within 24 hours.",
          },
          { type: "links", items: CONTACT_LINKS },
        ],
      },
    ],
  },
];

export const RECORDS_BY_ID: Record<string, RecordDef> = Object.fromEntries(
  RECORDS.map((r) => [r.id, r]),
);

/** Records grouped under their dividers, in collection order. */
export function groupByDivider(records: RecordDef[] = RECORDS) {
  const groups: { divider: string; records: RecordDef[] }[] = [];
  for (const r of records) {
    const g = groups.find((x) => x.divider === r.divider);
    if (g) g.records.push(r);
    else groups.push({ divider: r.divider, records: [r] });
  }
  return groups;
}
