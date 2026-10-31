import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import { ANSWERS } from './data/answers';
import { REVEAL_MS } from './lib/useGame';

const ANSWER = 'crane';

function seedGame(answer = ANSWER) {
  localStorage.setItem('lexicle:game', JSON.stringify({ answer, guesses: [] }));
  localStorage.setItem('lexicle:prefs', JSON.stringify({ theme: 'system', seenHelp: true }));
}

function press(key: string) {
  fireEvent.keyDown(window, { key });
}

function type(word: string) {
  for (const ch of word) press(ch);
  press('Enter');
}

function finishReveal() {
  act(() => {
    vi.advanceTimersByTime(REVEAL_MS + 3000);
  });
}

function rowLabels() {
  return screen.getAllByRole('row').map((r) => r.getAttribute('aria-label'));
}

function storedStats() {
  return JSON.parse(localStorage.getItem('lexicle:stats') ?? 'null');
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  delete document.documentElement.dataset.theme;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('App gameplay', () => {
  it('shows the help dialog on first visit only', () => {
    const { unmount } = render(<App />);
    expect(screen.getByRole('dialog', { name: 'How to play' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    unmount();
    render(<App />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('types, deletes and scores a guess with the physical keyboard', () => {
    seedGame();
    render(<App />);
    for (const ch of 'nacrx') press(ch);
    press('Backspace');
    press('e');
    expect(rowLabels()[0]).toBe('Current guess: NACRE');
    press('Enter');
    finishReveal();
    expect(rowLabels()[0]).toBe('NACRE: N present, A present, C present, R present, E correct');
    expect(screen.getByRole('button', { name: 'e, correct' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'n, present' })).toBeInTheDocument();
  });

  it('works with the on-screen keyboard', () => {
    seedGame();
    render(<App />);
    for (const ch of 'fluid') fireEvent.click(screen.getByRole('button', { name: ch }));
    fireEvent.click(screen.getByRole('button', { name: 'Backspace' }));
    fireEvent.click(screen.getByRole('button', { name: 'd' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enter' }));
    finishReveal();
    expect(rowLabels()[0]).toMatch(/^FLUID:/);
    expect(screen.getByRole('button', { name: 'f, absent' })).toBeInTheDocument();
  });

  it('ignores letters beyond five and keyboard shortcuts with modifiers', () => {
    seedGame();
    render(<App />);
    for (const ch of 'crazyx') press(ch);
    fireEvent.keyDown(window, { key: 'r', ctrlKey: true });
    expect(rowLabels()[0]).toBe('Current guess: CRAZY');
  });

  it('rejects short guesses and words not in the dictionary', () => {
    seedGame();
    render(<App />);
    type('cra');
    expect(screen.getByText('Not enough letters')).toBeInTheDocument();
    press('Backspace');
    press('Backspace');
    press('Backspace');
    type('xqzvk');
    expect(screen.getByText('Not in word list')).toBeInTheDocument();
    // The invalid guess stays editable in the first row.
    expect(rowLabels()[0]).toBe('Current guess: XQZVK');
  });

  it('handles a win: message, stats persistence and play again', () => {
    seedGame();
    render(<App />);
    type('nacre');
    finishReveal();
    type('crane');
    // Input is locked while the row flips.
    press('a');
    act(() => {
      vi.advanceTimersByTime(REVEAL_MS);
    });
    expect(screen.getByText('Magnificent')).toBeInTheDocument();
    finishReveal();

    const dialog = screen.getByRole('dialog', { name: 'Round complete' });
    expect(within(dialog).getByText('You got it!')).toBeInTheDocument();
    expect(within(dialog).getByText('Solved in 2 guesses')).toBeInTheDocument();
    expect(within(dialog).getByTestId('dist-2')).toHaveTextContent('1');

    expect(storedStats()).toMatchObject({
      played: 1,
      wins: 1,
      losses: 0,
      currentStreak: 1,
      maxStreak: 1,
      bestGuesses: 2,
      distribution: [0, 1, 0, 0, 0, 0],
    });

    fireEvent.click(within(dialog).getByRole('button', { name: /play again/i }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(rowLabels().every((l) => l === 'Empty row' || l === 'Current guess')).toBe(true);
    const saved = JSON.parse(localStorage.getItem('lexicle:game')!);
    expect(saved.guesses).toEqual([]);
    expect(ANSWERS).toContain(saved.answer);
    expect(saved.answer).not.toBe(ANSWER);
  });

  it('handles a loss: reveals the answer and resets the streak', () => {
    localStorage.setItem(
      'lexicle:stats',
      JSON.stringify({
        played: 3,
        wins: 3,
        losses: 0,
        currentStreak: 3,
        maxStreak: 3,
        distribution: [0, 0, 3, 0, 0, 0],
        bestGuesses: 3,
      }),
    );
    seedGame();
    render(<App />);
    for (const w of ['fluid', 'stomp', 'bulky', 'ghost', 'witch', 'jumpy']) {
      type(w);
      finishReveal();
    }
    const dialog = screen.getByRole('dialog', { name: 'Round complete' });
    expect(within(dialog).getByText('The word was')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Answer: crane')).toBeInTheDocument();
    expect(storedStats()).toMatchObject({ played: 4, wins: 3, losses: 1, currentStreak: 0, maxStreak: 3 });
    expect(within(dialog).getByText('75')).toBeInTheDocument();
  });

  it('starts a new round with Enter once the round is over', () => {
    seedGame();
    render(<App />);
    type('crane');
    finishReveal();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    press('Enter');
    expect(JSON.parse(localStorage.getItem('lexicle:game')!).answer).not.toBe(ANSWER);
    expect(rowLabels()[0]).toBe('Current guess');
  });

  it('resumes an in-progress round after reload', () => {
    localStorage.setItem('lexicle:game', JSON.stringify({ answer: ANSWER, guesses: ['nacre'] }));
    localStorage.setItem('lexicle:prefs', JSON.stringify({ theme: 'system', seenHelp: true }));
    render(<App />);
    expect(rowLabels()[0]).toMatch(/^NACRE:/);
    type('crane');
    finishReveal();
    expect(storedStats()).toMatchObject({ played: 1, wins: 1, bestGuesses: 2 });
  });

  it('keeps stats across many consecutive games', () => {
    seedGame();
    const { unmount } = render(<App />);
    type('crane');
    finishReveal();
    unmount();

    for (let i = 0; i < 3; i++) {
      seedGame('ghost');
      const r = render(<App />);
      type('ghost');
      finishReveal();
      r.unmount();
    }
    expect(storedStats()).toMatchObject({ played: 4, wins: 4, currentStreak: 4, maxStreak: 4, bestGuesses: 1 });
  });
});

describe('Settings', () => {
  it('switches theme and persists it', () => {
    seedGame();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(JSON.parse(localStorage.getItem('lexicle:prefs')!).theme).toBe('dark');
    fireEvent.click(screen.getByRole('radio', { name: 'System' }));
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it('resets statistics only after confirmation', () => {
    localStorage.setItem(
      'lexicle:stats',
      JSON.stringify({
        played: 5,
        wins: 4,
        losses: 1,
        currentStreak: 2,
        maxStreak: 3,
        distribution: [0, 1, 2, 1, 0, 0],
        bestGuesses: 2,
      }),
    );
    seedGame();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(storedStats().played).toBe(5);

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, reset' }));
    expect(storedStats()).toMatchObject({ played: 0, wins: 0, losses: 0, currentStreak: 0, bestGuesses: null });
    expect(screen.getByText('Statistics cleared.')).toBeInTheDocument();
  });

  it('ignores game keys while a dialog is open', () => {
    seedGame();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Statistics' }));
    press('a');
    expect(rowLabels()[0]).toBe('Current guess');
  });
});
