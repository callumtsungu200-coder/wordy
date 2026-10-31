import {
  emptyStats,
  loadPrefs,
  loadRecent,
  loadStats,
  pushRecent,
  recordResult,
  savePrefs,
  saveStats,
  winPercentage,
} from './storage';

beforeEach(() => localStorage.clear());

describe('recordResult', () => {
  it('tracks wins, streaks, distribution and personal best', () => {
    let s = emptyStats();
    s = recordResult(s, true, 4);
    s = recordResult(s, true, 2);
    s = recordResult(s, true, 5);
    expect(s).toMatchObject({ played: 3, wins: 3, losses: 0, currentStreak: 3, maxStreak: 3, bestGuesses: 2 });
    expect(s.distribution).toEqual([0, 1, 0, 1, 1, 0]);
  });

  it('resets the current streak on a loss but keeps the max', () => {
    let s = emptyStats();
    s = recordResult(s, true, 3);
    s = recordResult(s, true, 3);
    s = recordResult(s, false, 6);
    s = recordResult(s, true, 6);
    expect(s).toMatchObject({ played: 4, wins: 3, losses: 1, currentStreak: 1, maxStreak: 2 });
    expect(winPercentage(s)).toBe(75);
  });

  it('does not mutate its input', () => {
    const s = emptyStats();
    recordResult(s, true, 1);
    expect(s).toEqual(emptyStats());
  });
});

describe('persistence', () => {
  it('round-trips stats through localStorage', () => {
    const s = recordResult(emptyStats(), true, 3);
    saveStats(s);
    expect(loadStats()).toEqual(s);
  });

  it('returns empty stats for missing or corrupt data', () => {
    expect(loadStats()).toEqual(emptyStats());
    localStorage.setItem('lexicle:stats', '{not json');
    expect(loadStats()).toEqual(emptyStats());
    localStorage.setItem('lexicle:stats', JSON.stringify({ played: -4, distribution: [1, 2] }));
    expect(loadStats()).toEqual(emptyStats());
  });

  it('round-trips preferences', () => {
    expect(loadPrefs()).toEqual({ theme: 'system', seenHelp: false });
    savePrefs({ theme: 'dark', seenHelp: true });
    expect(loadPrefs()).toEqual({ theme: 'dark', seenHelp: true });
  });

  it('keeps a de-duplicated recent-answers list', () => {
    pushRecent('crane');
    pushRecent('apple');
    pushRecent('crane');
    expect(loadRecent()).toEqual(['apple', 'crane']);
  });
});
