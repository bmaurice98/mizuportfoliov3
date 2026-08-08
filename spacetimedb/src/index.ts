import { schema, table, t } from "spacetimedb/server";
import { ScheduleAt } from "spacetimedb";
import { SenderError } from "spacetimedb/server";
import { Filter } from "bad-words";

const cursor = table(
  { name: "cursor", public: true },
  {
    identity: t.identity().primaryKey(),
    x: t.f32(),
    y: t.f32(),
    page: t.string(),
    color: t.string(),
    name: t.string(),
    updatedAt: t.timestamp(),
  },
);

const sweepCursorJob = table(
  { name: "sweep_cursor_job", public: false, schedule: "sweep_idle_cursors" },
  {
    scheduleId: t.u64().primaryKey().autoInc(),
    scheduledAt: t.scheduleAt(),
  },
);

const spacetimedb = schema({ cursor, sweepCursorJob });
export default spacetimedb;

const IDLE_TIMEOUT_MICROS = 15_000_000n; // 15s idle → removed
const SWEEP_INTERVAL_MICROS = 5_000_000n; // check every 5s

export const init = spacetimedb.init((ctx) => {
  ctx.db.sweepCursorJob.insert({
    scheduleId: 0n,
    scheduledAt: ScheduleAt.interval(SWEEP_INTERVAL_MICROS),
  });
});

export const sweep_idle_cursors = spacetimedb.reducer(
  { arg: sweepCursorJob.rowType },
  (ctx, { arg }) => {
    const cutoff = ctx.timestamp.microsSinceUnixEpoch - IDLE_TIMEOUT_MICROS;
    const stale: any[] = [];
    for (const row of ctx.db.cursor.iter()) {
      if (row.updatedAt.microsSinceUnixEpoch < cutoff) stale.push(row.identity);
    }
    for (const identity of stale) {
      ctx.db.cursor.identity.delete(identity);
    }
  },
);

const profanity = new Filter();
const NAME_PATTERN = /^[a-zA-Z0-9 _'-]{2,20}$/;

export const setCursorName = spacetimedb.reducer(
  { name: t.string() },
  (ctx, { name }) => {
    const cleaned = name.trim();

    if (!NAME_PATTERN.test(cleaned)) {
      throw new SenderError(
        "Name must be 2-20 characters (letters, numbers, spaces, - or _ only).",
      );
    }
    if (profanity.isProfane(cleaned)) {
      throw new SenderError("That name isn't allowed — please choose another.");
    }

    const existing = ctx.db.cursor.identity.find(ctx.sender);
    const row = {
      identity: ctx.sender,
      x: existing?.x ?? 0,
      y: existing?.y ?? 0,
      page: existing?.page ?? "",
      color: existing?.color ?? colorFor(ctx.sender),
      name: cleaned === "random" ? nameFor(ctx.sender) : cleaned,
      updatedAt: ctx.timestamp,
    };
    if (existing) {
      ctx.db.cursor.identity.update(row);
    } else {
      ctx.db.cursor.insert(row);
    }
  },
);

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];
const ADJECTIVES = [
  "Curious",
  "Sneaky",
  "Cosmic",
  "Quiet",
  "Swift",
  "Lucky",
  "Bold",
  "Gentle",
];
const ANIMALS = [
  "Otter",
  "Panda",
  "Falcon",
  "Fox",
  "Koala",
  "Lynx",
  "Heron",
  "Wren",
];

function hashOf(identity: { toHexString(): string }) {
  const hex = identity.toHexString();
  let hash = 0;
  for (let i = 0; i < hex.length; i++)
    hash = (hash * 31 + hex.charCodeAt(i)) >>> 0;
  return hash;
}

function colorFor(identity: { toHexString(): string }) {
  return COLORS[hashOf(identity) % COLORS.length];
}

function nameFor(identity: { toHexString(): string }) {
  const h = hashOf(identity);
  return `${ADJECTIVES[h % ADJECTIVES.length]} ${ANIMALS[(h >> 4) % ANIMALS.length]}`;
}

spacetimedb.clientDisconnected((ctx) => {
  if (ctx.db.cursor.identity.find(ctx.sender)) {
    ctx.db.cursor.identity.delete(ctx.sender);
  }
});

export const updateCursor = spacetimedb.reducer(
  { x: t.f32(), y: t.f32(), page: t.string() },
  (ctx, { x, y, page }: { x: number; y: number; page: string }) => {
    const existing = ctx.db.cursor.identity.find(ctx.sender);
    const row = {
      identity: ctx.sender,
      x,
      y,
      page,
      color: existing?.color ?? colorFor(ctx.sender),
      name: existing?.name ?? nameFor(ctx.sender),
      updatedAt: ctx.timestamp,
    };
    if (existing) {
      ctx.db.cursor.identity.update(row);
    } else {
      ctx.db.cursor.insert(row);
    }
  },
);
