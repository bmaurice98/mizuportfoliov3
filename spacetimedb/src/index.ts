import { schema, table, t } from "spacetimedb/server";
import type { ReducerCtx } from "spacetimedb/server";

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

const spacetimedb = schema({ cursor });
export default spacetimedb;

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
