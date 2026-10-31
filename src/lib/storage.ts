import { MAX_GUESSES } from './game';

export type Theme = 'system' | 'light' | 'dark';

export interface Stats {
  played: number;
  wins: number;
  losses: number;
  currentStreak: number;
  maxStreak: number;
  /** distribution[i] = number of wins in i + 1 guesses */
  distribution: number[];
  /** Fewest guesses ever needed to win, or null if never won. */
  bestGuesses: number | null;
}

export interface Prefs {
  theme: Theme;
  seenHelp: boolean;
}

export interface SavedGame {
  answer: string;
  guesses: string[];
}

const KEYS = {
  stats: 'lexicle:stats',
  prefs: 'lexicle:prefs',
  game: 'lexicle:game',
  recent: 'lexicle:recent',
} as const;

const RECENT_LIMIT = 200;

export const emptyStats = (): Stats => ({
  played: 0,
  wins: 0,
  losses: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: Array(MAX_GUESSES).fill(0),
  bestGuesses: null,
});

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be full or disabled (private mode); the game still works.
  }
}

const isCount = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0;

export function loadStats(): Stats {
  const s = read<Partial<Stats>>(KEYS.stats);
  const base = emptyStats();
  if (!s || typeof s !== 'object') return base;
  const distribution =
    Array.isArray(s.distribution) && s.distribution.length === MAX_GUESSES && s.distribution.every(isCount)
      ? s.distribution
      : base.distribution;
  return {
    played: isCount(s.played) ? s.played : 0,
    wins: isCount(s.wins) ? s.wins : 0,
    losses: isCount(s.losses) ? s.losses : 0,
    currentStreak: isCount(s.currentStreak) ? s.currentStreak : 0,
    maxStreak: isCount(s.maxStreak) ? s.maxStreak : 0,
    distribution,
    bestGuesses:
      isCount(s.bestGuesses) && s.bestGuesses >= 1 && s.bestGuesses <= MAX_GUESSES ? s.bestGuesses : null,
  };
}

export const saveStats = (stats: Stats) => write(KEYS.stats, stats);

/** Returns new stats after a finished game. `guessCount` is only used for wins. */
export function recordResult(stats: Stats, won: boolean, guessCount: number): Stats {
  const next: Stats = { ...stats, distribution: [...stats.distribution], played: stats.played + 1 };
  if (won) {
    next.wins += 1;
    next.currentStreak += 1;
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
    next.distribution[guessCount - 1] += 1;
    next.bestGuesses = next.bestGuesses === null ? guessCount : Math.min(next.bestGuesses, guessCount);
  } else {
    next.losses += 1;
    next.currentStreak = 0;
  }
  return next;
}

export const winPercentage = (stats: Stats) =>
  stats.played === 0 ? 0 : Math.round((stats.wins / stats.played) * 100);

export function loadPrefs(): Prefs {
  const p = read<Partial<Prefs>>(KEYS.prefs);
  const theme = p?.theme === 'light' || p?.theme === 'dark' ? p.theme : 'system';
  return { theme, seenHelp: p?.seenHelp === true };
}

export const savePrefs = (prefs: Prefs) => write(KEYS.prefs, prefs);

export function loadGame(): SavedGame | null {
  const g = read<SavedGame>(KEYS.game);
  if (!g || typeof g.answer !== 'string' || !Array.isArray(g.guesses)) return null;
  if (!g.guesses.every((x) => typeof x === 'string')) return null;
  return { answer: g.answer, guesses: g.guesses };
}

export const saveGame = (game: SavedGame) => write(KEYS.game, game);

export function loadRecent(): string[] {
  const r = read<string[]>(KEYS.recent);
  return Array.isArray(r) ? r.filter((x) => typeof x === 'string') : [];
}

export function pushRecent(word: string): void {
  const recent = loadRecent().filter((w) => w !== word);
  recent.push(word);
  write(KEYS.recent, recent.slice(-RECENT_LIMIT));
}
