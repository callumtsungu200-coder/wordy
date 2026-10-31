import { ANSWERS } from '../data/answers';
import { evaluateGuess, isValidWord, keyboardStates, pickAnswer } from './game';

describe('evaluateGuess', () => {
  it('marks an exact match all correct', () => {
    expect(evaluateGuess('crane', 'crane')).toEqual(Array(5).fill('correct'));
  });

  it('marks letters in the wrong spot as present', () => {
    expect(evaluateGuess('nacre', 'crane')).toEqual(['present', 'present', 'present', 'present', 'correct']);
  });

  it('marks missing letters absent', () => {
    expect(evaluateGuess('fluid', 'crane')).toEqual(Array(5).fill('absent'));
  });

  it('does not over-count repeated guess letters', () => {
    // Answer has one E, already claimed by the exact match in the last slot.
    expect(evaluateGuess('geese', 'crane')).toEqual(['absent', 'absent', 'absent', 'absent', 'correct']);
    expect(evaluateGuess('eerie', 'crane')).toEqual(['absent', 'absent', 'present', 'absent', 'correct']);
    // Answer has two Es; only two of the guess's three Es are scored.
    expect(evaluateGuess('emcee', 'eerie')).toEqual(['correct', 'absent', 'absent', 'present', 'correct']);
  });

  it('prefers exact matches before present ones', () => {
    // Answer "apple" has two Ps; guess "puppy" has three.
    expect(evaluateGuess('puppy', 'apple')).toEqual(['present', 'absent', 'correct', 'absent', 'absent']);
  });

  it('is case insensitive', () => {
    expect(evaluateGuess('CRANE', 'crane')).toEqual(Array(5).fill('correct'));
  });
});

describe('isValidWord', () => {
  it('accepts dictionary words and answers', () => {
    expect(isValidWord('crane')).toBe(true);
    expect(isValidWord('ZEBRA')).toBe(true);
  });

  it('rejects gibberish', () => {
    expect(isValidWord('xqzvk')).toBe(false);
    expect(isValidWord('abcde')).toBe(false);
  });
});

describe('answers list', () => {
  it('contains only unique, valid five-letter words', () => {
    expect(ANSWERS.length).toBeGreaterThan(500);
    expect(new Set(ANSWERS).size).toBe(ANSWERS.length);
    for (const w of ANSWERS) {
      expect(w).toMatch(/^[a-z]{5}$/);
      expect(isValidWord(w)).toBe(true);
    }
  });
});

describe('keyboardStates', () => {
  it('keeps the best state seen for each letter', () => {
    const keys = keyboardStates(['nacre', 'crane'], 'crane');
    expect(keys.c).toBe('correct');
    expect(keys.n).toBe('correct');
  });

  it('never downgrades a correct letter', () => {
    const keys = keyboardStates(['crane', 'nacre'], 'crane');
    expect(keys.c).toBe('correct');
  });
});

describe('pickAnswer', () => {
  it('returns an answer from the list', () => {
    expect(ANSWERS).toContain(pickAnswer());
  });

  it('avoids recently played words', () => {
    const recent = ANSWERS.slice(0, ANSWERS.length - 1);
    expect(pickAnswer(recent)).toBe(ANSWERS[ANSWERS.length - 1]);
  });

  it('falls back to the full list when everything is recent', () => {
    expect(ANSWERS).toContain(pickAnswer(ANSWERS));
  });
});
