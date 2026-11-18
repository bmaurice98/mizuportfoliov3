export interface GameModeConfig {
  id: string;
  label: string;
  icon: string;
  dayOfWeek: number; // 0 = Sunday ... 6 = Saturday, evaluated in UTC (see note below)
  description: string;
}

export const GAME_MODES: GameModeConfig[] = [
  {
    id: "hot_potato",
    label: "Hot Potato",
    icon: "💣",
    dayOfWeek: 1, // Monday
    description: "Pass the bomb before the timer runs out.",
  },
  // Future games register here, e.g.:
  // { id: 'cursor_tag', label: 'Cursor Tag', icon: '🏃', dayOfWeek: 3, description: '...' },
];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function dayName(day: number) {
  return DAY_NAMES[day] ?? "?";
}

export function modeForDay(day: number): GameModeConfig | null {
  return GAME_MODES.find((m) => m.dayOfWeek === day) ?? null;
}

export function todaysModeUTC(
  nowMs: number = Date.now(),
): GameModeConfig | null {
  return modeForDay(new Date(nowMs).getUTCDay());
}

export function nextUpcomingMode(
  nowMs: number = Date.now(),
): GameModeConfig | null {
  if (GAME_MODES.length === 0) return null;
  const today = new Date(nowMs).getUTCDay();
  let best: GameModeConfig | null = null;
  let bestDist = 8;
  for (const mode of GAME_MODES) {
    const dist = (mode.dayOfWeek - today + 7) % 7 || 7; // today's mode, if any, counts as "next week"
    if (dist < bestDist) {
      bestDist = dist;
      best = mode;
    }
  }
  return best;
}
