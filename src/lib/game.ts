import { ANSWERS } from '../data/answers';
import { DICTIONARY_RAW } from '../data/dictionary';

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export type LetterState = 'correct' | 'present' | 'absent';
export type GameStatus = 'playing' | 'won' | 'lost';

const DICTIONARY: ReadonlySet<string> = new Set([...DICTIONARY_RAW.split(' '), ...ANSWERS]);

export function isValidWord(word: string): boolean {
  return DICTIONARY.has(word.toLowerCase());
}

/**
 * Scores a guess against the answer. Exact matches are claimed first so that
 * repeated letters are only marked "present" as many times as they remain
 * unmatched in the answer.
 */
export function evaluateGuess(guess: string, answer: string): LetterState[] {
  const g = guess.toLowerCase();
  const a = answer.toLowerCase();
  const result: LetterState[] = Array(a.length).fill('absent');
  const remaining = new Map<string, number>();

  for (let i = 0; i < a.length; i++) {
    if (g[i] === a[i]) {
      result[i] = 'correct';
    } else {
      remaining.set(a[i], (remaining.get(a[i]) ?? 0) + 1);
    }
  }

  for (let i = 0; i < a.length; i++) {
    if (result[i] === 'correct') continue;
    const left = remaining.get(g[i]) ?? 0;
    if (left > 0) {
      result[i] = 'present';
      remaining.set(g[i], left - 1);
    }
  }

  return result;
}

const STATE_RANK: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };

/** Best known state for every letter that has been guessed so far. */
export function keyboardStates(guesses: string[], answer: string): Record<string, LetterState> {
  const keys: Record<string, LetterState> = {};
  for (const guess of guesses) {
    evaluateGuess(guess, answer).forEach((state, i) => {
      const letter = guess[i].toLowerCase();
      const prev = keys[letter];
      if (!prev || STATE_RANK[state] > STATE_RANK[prev]) keys[letter] = state;
    });
  }
  return keys;
}

/** Picks a random answer, avoiding recently played words where possible. */
export function pickAnswer(recent: readonly string[] = [], random: () => number = Math.random): string {
  const avoid = new Set(recent);
  const pool = ANSWERS.filter((w) => !avoid.has(w));
  const source = pool.length > 0 ? pool : ANSWERS;
  return source[Math.floor(random() * source.length)];
}
