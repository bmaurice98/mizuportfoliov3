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

const sweep = table(
  { name: "sweep", scheduled: (): any => sweep_idle_cursors },
  {
    schedule_id: t.u64().primaryKey().autoInc(),
    scheduled_at: t.scheduleAt(),
  },
);

const hotPotatoGame = table(
  { name: "hot_potato_game", public: true },
  {
    id: t.u64().primaryKey(), // singleton row, always id 0
    status: t.string(), // 'idle' | 'active' | 'ended'
    round_id: t.u64(),
    bombHolder: t.option(t.identity()),
    bombHolderSince: t.u64(), // micros — for the anti-jitter cooldown below
    startedAtMicros: t.u64(),
    endsAtMicros: t.u64(),
    durationSeconds: t.u32(),
    loserIdentity: t.option(t.identity()),
    loserName: t.option(t.string()),
    lobbyEndsAtMicros: t.u64(),
  },
);

const explosionJob = table(
  { name: "explosion_job", scheduled: (): any => trigger_explosion },
  {
    scheduled_id: t.u64().primaryKey().autoInc(),
    scheduled_at: t.scheduleAt(),
    round_id: t.u64(), // lets the handler ignore a stale job from a cancelled/superseded round
  },
);

const readyPlayer = table(
  { name: "ready_player", public: true },
  {
    identity: t.identity().primaryKey(),
    round_id: t.u64(),
  },
);

const lobbyJob = table(
  { name: "lobby_job", scheduled: (): any => resolve_lobby },
  {
    scheduled_id: t.u64().primaryKey().autoInc(),
    scheduled_at: t.scheduleAt(),
    round_id: t.u64(),
  },
);

const themeToken = table(
  { name: "theme_token", public: true },
  {
    token: t.string().primaryKey(),
    value: t.string(),
    setBy: t.string(),
    updatedAt: t.timestamp(),
  },
);

// private: per-identity cooldown
const themeRate = table(
  { name: "theme_rate" },
  {
    identity: t.identity().primaryKey(),
    lastAtMicros: t.u64(),
  },
);

const spacetimedb = schema({
  cursor,
  sweep,
  hotPotatoGame,
  explosionJob,
  readyPlayer,
  lobbyJob,
  themeToken,
  themeRate,
});
export default spacetimedb;

const IDLE_TIMEOUT_MICROS = 15_000_000n; // 15s idle → removed
const SWEEP_INTERVAL_MICROS = 600_000_000n; // check every 8m 20s

export const init = spacetimedb.init((ctx) => {
  console.log("SpacetimeDB Sweeper Initialized --- IGNORE ---");
  ctx.db.sweep.insert({
    schedule_id: 0n,
    scheduled_at: ScheduleAt.interval(SWEEP_INTERVAL_MICROS),
  });
});

export const sweep_idle_cursors = spacetimedb.reducer(
  { arg: sweep.rowType },
  (ctx, { arg }) => {
    const cutoff = ctx.timestamp.microsSinceUnixEpoch - IDLE_TIMEOUT_MICROS;
    const stale: any[] = [];
    console.log("Checking Idle Cursors");
    for (const row of ctx.db.cursor.iter()) {
      if (row.updatedAt.microsSinceUnixEpoch < cutoff) stale.push(row.identity);
    }
    console.log(`Total Idle CursorsL ${stale.length}`);
    for (const identity of stale) {
      ctx.db.cursor.identity.delete(identity);
    }
  },
);

const COLLISION_THRESHOLD_SQ = 0.03 * 0.03; // ~3% of page dimensions apart counts as a "touch"
const MIN_HOLD_MICROS = 500_000n; // 0.5s immunity after receiving the bomb, so it can't ping-pong every frame

function sqDist(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function isParticipant(ctx: any, identity: any, roundId: bigint): boolean {
  const row = ctx.db.readyPlayer.identity.find(identity);
  return !!row && row.round_id === roundId;
}

function tryTransferBomb(
  ctx: any,
  moverIdentity: any,
  moverX: number,
  moverY: number,
  moverPage: string,
) {
  const game = ctx.db.hotPotatoGame.id.find(0n);
  if (!game || game.status !== "active" || !game.bombHolder) return;

  const now = ctx.timestamp.microsSinceUnixEpoch;
  if (now - game.bombHolderSince < MIN_HOLD_MICROS) return;

  const holderHex = game.bombHolder.toHexString();
  const moverHex = moverIdentity.toHexString();

  if (holderHex === moverHex) {
    // The holder moved — did they walk into someone else?
    for (const other of ctx.db.cursor.iter()) {
      if (other.identity.toHexString() === holderHex) continue;
      if (other.page !== moverPage) continue;
      if (!isParticipant(ctx, other.identity, game.round_id)) continue; // bystander — skip
      if (sqDist(moverX, moverY, other.x, other.y) <= COLLISION_THRESHOLD_SQ) {
        ctx.db.hotPotatoGame.id.update({
          ...game,
          bombHolder: other.identity,
          bombHolderSince: now,
        });
        return;
      }
    }
  } else {
    if (!isParticipant(ctx, moverIdentity, game.round_id)) return; // bystander — can't receive it
    const holderRow = ctx.db.cursor.identity.find(game.bombHolder);
    if (!holderRow || holderRow.page !== moverPage) return;
    if (
      sqDist(moverX, moverY, holderRow.x, holderRow.y) <= COLLISION_THRESHOLD_SQ
    ) {
      ctx.db.hotPotatoGame.id.update({
        ...game,
        bombHolder: moverIdentity,
        bombHolderSince: now,
      });
    }
  }
}

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
  if (ctx.db.cursor.identity.find(ctx.sender))
    ctx.db.cursor.identity.delete(ctx.sender);
  if (ctx.db.readyPlayer.identity.find(ctx.sender))
    ctx.db.readyPlayer.identity.delete(ctx.sender);
  if (ctx.db.themeRate.identity.find(ctx.sender))
    ctx.db.themeRate.identity.delete(ctx.sender);
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
    tryTransferBomb(ctx, ctx.sender, x, y, page);
  },
);

const LOBBY_SECONDS = 15;
const MIN_READY_PLAYERS = 2;

export const startHotPotato = spacetimedb.reducer(
  { durationSeconds: t.u32() },
  (ctx, { durationSeconds }) => {
    const existing = ctx.db.hotPotatoGame.id.find(0n);
    if (existing?.status === "active" || existing?.status === "lobby") {
      throw new SenderError("A round is already starting or in progress.");
    }

    // const activePlayers = [...ctx.db.cursor.iter()];
    // if (activePlayers.length < 2) {
    //   throw new SenderError(
    //     "Need at least 2 active visitors to start a round.",
    //   );
    // }

    // const bombHolderRow =
    //   activePlayers[ctx.random.integerInRange(0, activePlayers.length - 1)];
    const now = ctx.timestamp.microsSinceUnixEpoch;
    const roundId = (existing?.round_id ?? 0n) + 1n;
    const lobbyEndsAtMicros = now + BigInt(LOBBY_SECONDS) * 1_000_000n;

    // Defensive check just to be absolutely safe
    // if (!bombHolderRow) {
    //   throw new SenderError("No active player selected");
    // }

    // clear any stray ready rows left over from a previous round
    for (const row of ctx.db.readyPlayer.iter()) {
      ctx.db.readyPlayer.identity.delete(row.identity);
    }

    const row = {
      id: 0n,
      status: "lobby",
      round_id: roundId,
      bombHolder: undefined,
      bombHolderSince: now,
      startedAtMicros: now,
      endsAtMicros: now,
      durationSeconds: durationSeconds,
      loserIdentity: undefined,
      loserName: undefined,
      lobbyEndsAtMicros,
    };

    // console.log(row);

    if (existing) {
      ctx.db.hotPotatoGame.id.update(row);
    } else {
      ctx.db.hotPotatoGame.insert(row);
    }

    ctx.db.lobbyJob.insert({
      scheduled_id: 0n,
      scheduled_at: ScheduleAt.time(lobbyEndsAtMicros),
      round_id: roundId,
    });

    // ctx.db.explosionJob.insert({
    //   scheduled_id: 0n,
    //   scheduled_at: ScheduleAt.time(endsAtMicros),
    //   round_id: roundId,
    // });
  },
);

export const readyUp = spacetimedb.reducer((ctx) => {
  const game = ctx.db.hotPotatoGame.id.find(0n);
  if (!game || game.status !== "lobby") {
    throw new SenderError("There is no open lobby to ready up for right now.");
  }
  const existing = ctx.db.readyPlayer.identity.find(ctx.sender);
  const row = { identity: ctx.sender, round_id: game.round_id };
  if (existing) {
    ctx.db.readyPlayer.identity.update(row);
  } else {
    ctx.db.readyPlayer.insert(row);
  }
});

export const resolve_lobby = spacetimedb.reducer(
  { arg: lobbyJob.rowType },
  (ctx, { arg }) => {
    const game = ctx.db.hotPotatoGame.id.find(0n);
    if (!game || game.status !== "lobby" || game.round_id !== arg.round_id)
      return; // stale job

    const readyRows = [...ctx.db.readyPlayer.iter()].filter(
      (r) => r.round_id === game.round_id,
    );

    if (readyRows.length < MIN_READY_PLAYERS) {
      for (const row of readyRows)
        ctx.db.readyPlayer.identity.delete(row.identity);
      ctx.db.hotPotatoGame.id.update({ ...game, status: "idle" });
      return;
    }

    // const bombHolderRow =
    //   activePlayers[ctx.random.integerInRange(0, activePlayers.length - 1)];

    const bombHolderRow =
      readyRows[Math.floor(ctx.random.integerInRange(0, readyRows.length - 1))];
    const now = ctx.timestamp.microsSinceUnixEpoch;
    const endsAtMicros = now + BigInt(game.durationSeconds) * 1_000_000n;

    ctx.db.hotPotatoGame.id.update({
      ...game,
      status: "active",
      bombHolder: bombHolderRow.identity,
      bombHolderSince: now,
      startedAtMicros: now,
      endsAtMicros,
    });

    ctx.db.explosionJob.insert({
      scheduled_id: 0n,
      scheduled_at: ScheduleAt.time(endsAtMicros),
      round_id: game.round_id,
    });
  },
);

export const trigger_explosion = spacetimedb.reducer(
  { arg: explosionJob.rowType },
  (ctx, { arg }) => {
    const game = ctx.db.hotPotatoGame.id.find(0n);
    if (!game || game.status !== "active" || game.round_id !== arg.round_id)
      return; // stale/cancelled round

    const loserIdentity = game.bombHolder;
    const loserRow = loserIdentity
      ? ctx.db.cursor.identity.find(loserIdentity)
      : undefined;

    ctx.db.hotPotatoGame.id.update({
      ...game,
      status: "ended",
      loserIdentity,
      loserName: loserRow?.name,
    });
    console.log("Game Ended");
    for (const row of ctx.db.readyPlayer.iter()) {
      if (row.round_id === game.round_id)
        ctx.db.readyPlayer.identity.delete(row.identity);
    }
  },
);

// THEME HELPERS AND REDUCERS

// ---------- Site theme ----------
const THEME_DEFAULTS: Record<string, string> = {
  background: "#09151a",
  text: "#ffffff",
  muted: "#c2c7c8",
  accent: "#98d0d7",
  accentDeep: "#115157",
  card: "#202c32",
};
const THEME_STATEMENT_RE =
  /^theme\.([A-Za-z]+)\s*=\s*["']?(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}))["']?$/;
const THEME_COOLDOWN_MICROS = 3_000_000n;

function normalizeHex(hex: string): string {
  const h = hex.toLowerCase();
  return h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function parseThemeSnippet(snippet: string): Record<string, string> {
  if (snippet.length > 600) throw new SenderError("Snippet too long.");
  const statements = snippet
    .split(/[\n;]/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("//"));
  if (statements.length === 0) throw new SenderError("Nothing to apply.");
  if (statements.length > 12) throw new SenderError("Max 12 statements.");

  const updates: Record<string, string> = {};
  for (const stmt of statements) {
    const m = THEME_STATEMENT_RE.exec(stmt);
    if (!m) throw new SenderError(`Couldn't read: ${stmt.slice(0, 40)}`);
    const [, key, hex] = m;
    if (!Object.hasOwn(THEME_DEFAULTS, key)) {
      throw new SenderError(
        `Unknown target "${key}". Try: ${Object.keys(THEME_DEFAULTS).join(", ")}`,
      );
    }
    updates[key] = normalizeHex(hex);
  }
  return updates;
}

function enforceThemeCooldown(ctx: any) {
  const now = ctx.timestamp.microsSinceUnixEpoch;
  const row = ctx.db.themeRate.identity.find(ctx.sender);
  if (row && now - row.lastAtMicros < THEME_COOLDOWN_MICROS) {
    throw new SenderError("Slow down — try again in a few seconds.");
  }
  const next = { identity: ctx.sender, lastAtMicros: now };
  if (row) ctx.db.themeRate.identity.update(next);
  else ctx.db.themeRate.insert(next);
}

export const applyTheme = spacetimedb.reducer(
  { snippet: t.string() },
  (ctx, { snippet }) => {
    enforceThemeCooldown(ctx);
    const updates = parseThemeSnippet(snippet);

    // Guard: the site must stay readable for everyone.
    const effective: Record<string, string> = { ...THEME_DEFAULTS };
    for (const row of ctx.db.themeToken.iter())
      effective[row.token] = row.value;
    Object.assign(effective, updates);
    if (contrast(effective.text, effective.background) < 4.5) {
      throw new SenderError(
        "Text vs background contrast is too low (needs 4.5:1).",
      );
    }
    if (contrast(effective.muted, effective.background) < 3) {
      throw new SenderError(
        "Muted text vs background contrast is too low (needs 3:1).",
      );
    }
    if (contrast(effective.accent, effective.background) < 3) {
      throw new SenderError(
        "Accent vs background contrast is too low (needs 3:1).",
      );
    }

    const setBy = ctx.db.cursor.identity.find(ctx.sender)?.name ?? "Anonymous";
    for (const [token, value] of Object.entries(updates)) {
      const row = { token, value, setBy, updatedAt: ctx.timestamp };
      if (ctx.db.themeToken.token.find(token))
        ctx.db.themeToken.token.update(row);
      else ctx.db.themeToken.insert(row);
    }
  },
);

export const resetTheme = spacetimedb.reducer((ctx) => {
  enforceThemeCooldown(ctx);
  for (const row of [...ctx.db.themeToken.iter()]) {
    ctx.db.themeToken.token.delete(row.token);
  }
});
