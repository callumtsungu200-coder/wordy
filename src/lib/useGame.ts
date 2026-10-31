import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MAX_GUESSES, WORD_LENGTH, isValidWord, keyboardStates, pickAnswer } from './game';
import type { GameStatus } from './game';
import {
  loadGame,
  loadRecent,
  loadStats,
  pushRecent,
  recordResult,
  saveGame,
  saveStats,
} from './storage';
import type { SavedGame, Stats } from './storage';
import { ANSWERS } from '../data/answers';

/** Per-tile flip duration and stagger; must match the CSS in styles.css. */
export const FLIP_MS = 500;
export const FLIP_STAGGER_MS = 300;
export const REVEAL_MS = FLIP_STAGGER_MS * (WORD_LENGTH - 1) + FLIP_MS;

export interface Toast {
  id: number;
  text: string;
}

const PRAISE = ['Genius', 'Magnificent', 'Impressive', 'Splendid', 'Great', 'Phew'];

function statusOf(guesses: string[], answer: string): GameStatus {
  if (guesses.includes(answer)) return 'won';
  if (guesses.length >= MAX_GUESSES) return 'lost';
  return 'playing';
}

// Pure so it is safe under StrictMode's double invocation; persistence happens in effects.
function freshRound(): SavedGame {
  return { answer: pickAnswer(loadRecent()), guesses: [] };
}

function initialRound(): SavedGame {
  const saved = loadGame();
  if (saved && ANSWERS.includes(saved.answer) && statusOf(saved.guesses, saved.answer) === 'playing') {
    return saved;
  }
  return freshRound();
}

export function useGame() {
  const [round, setRound] = useState(initialRound);
  const [roundId, setRoundId] = useState(0);
  const [current, setCurrent] = useState('');
  const [revealing, setRevealing] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [justFinished, setJustFinished] = useState(false);

  const { answer, guesses } = round;
  const status = statusOf(guesses, answer);
  const toastId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => saveGame(round), [round]);
  useEffect(() => pushRecent(answer), [answer]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const showToast = useCallback(
    (text: string, ms = 1400) => {
      const id = ++toastId.current;
      setToasts((t) => [...t, { id, text }]);
      later(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
    },
    [later],
  );

  // Keyboard colours only update once a row has finished flipping.
  const revealedCount = revealing ? guesses.length - 1 : guesses.length;
  const keyStates = useMemo(
    () => keyboardStates(guesses.slice(0, revealedCount), answer),
    [guesses, revealedCount, answer],
  );

  const locked = revealing || status !== 'playing';

  const addLetter = useCallback(
    (letter: string) => {
      if (locked) return;
      setCurrent((c) => (c.length < WORD_LENGTH ? c + letter.toLowerCase() : c));
    },
    [locked],
  );

  const removeLetter = useCallback(() => {
    if (locked) return;
    setCurrent((c) => c.slice(0, -1));
  }, [locked]);

  const submit = useCallback(() => {
    if (locked) return;
    if (current.length < WORD_LENGTH) {
      setShakeKey((k) => k + 1);
      showToast('Not enough letters');
      return;
    }
    if (!isValidWord(current)) {
      setShakeKey((k) => k + 1);
      showToast('Not in word list');
      return;
    }

    const nextGuesses = [...guesses, current];
    const nextStatus = statusOf(nextGuesses, answer);
    setRound({ answer, guesses: nextGuesses });
    setCurrent('');
    setRevealing(true);

    // Record the result immediately so a reload mid-animation can't lose it.
    if (nextStatus !== 'playing') {
      const nextStats = recordResult(stats, nextStatus === 'won', nextGuesses.length);
      setStats(nextStats);
      saveStats(nextStats);
    }

    later(() => {
      setRevealing(false);
      if (nextStatus === 'won') {
        showToast(PRAISE[nextGuesses.length - 1], 1800);
      } else if (nextStatus === 'lost') {
        showToast(answer.toUpperCase(), 2600);
      }
      if (nextStatus !== 'playing') later(() => setJustFinished(true), nextStatus === 'won' ? 1600 : 1400);
    }, REVEAL_MS);
  }, [locked, current, guesses, answer, stats, showToast, later]);

  const newGame = useCallback(() => {
    if (revealing) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRound(freshRound());
    setRoundId((n) => n + 1);
    setCurrent('');
    setToasts([]);
    setJustFinished(false);
  }, [revealing]);

  const clearJustFinished = useCallback(() => setJustFinished(false), []);

  const replaceStats = useCallback((s: Stats) => {
    setStats(s);
    saveStats(s);
  }, []);

  return {
    answer,
    guesses,
    current,
    status,
    revealing,
    shakeKey,
    toasts,
    stats,
    keyStates,
    roundId,
    justFinished,
    clearJustFinished,
    addLetter,
    removeLetter,
    submit,
    newGame,
    replaceStats,
  };
}
