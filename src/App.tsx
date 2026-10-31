import { useCallback, useEffect, useState } from 'react';
import { Board } from './components/Board';
import { Keyboard } from './components/Keyboard';
import { Modal } from './components/Modal';
import { StatsPanel } from './components/StatsPanel';
import { HelpPanel } from './components/HelpPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { HelpIcon, MoonIcon, RefreshIcon, SettingsIcon, StatsIcon, SunIcon } from './components/Icons';
import { useGame } from './lib/useGame';
import { emptyStats, loadPrefs, savePrefs } from './lib/storage';
import type { Prefs, Theme } from './lib/storage';

type Panel = 'help' | 'stats' | 'settings' | null;

function resolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const game = useGame();
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [panel, setPanel] = useState<Panel>(() => (loadPrefs().seenHelp ? null : 'help'));

  const updatePrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefs((p) => {
      const next = { ...p, ...patch };
      savePrefs(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = prefs.theme;
  }, [prefs.theme]);

  // Open the results once the final row has finished animating.
  useEffect(() => {
    if (game.justFinished) {
      setPanel('stats');
      game.clearJustFinished();
    }
  }, [game.justFinished, game.clearJustFinished]);

  const closePanel = useCallback(() => {
    if (panel === 'help' && !prefs.seenHelp) updatePrefs({ seenHelp: true });
    setPanel(null);
  }, [panel, prefs.seenHelp, updatePrefs]);

  const playAgain = useCallback(() => {
    setPanel(null);
    game.newGame();
  }, [game.newGame]);

  const finished = game.status !== 'playing';

  // Physical keyboard support.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panel || e.ctrlKey || e.metaKey || e.altKey || (e.repeat && e.key === 'Enter')) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (finished && !game.revealing) playAgain();
        else game.submit();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        game.removeLetter();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        game.addLetter(e.key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel, finished, game.revealing, game.submit, game.removeLetter, game.addLetter, playAgain]);

  const isDark = resolvedTheme(prefs.theme) === 'dark';

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-side">
          <button type="button" className="icon-btn" onClick={() => setPanel('help')} aria-label="How to play">
            <HelpIcon />
          </button>
        </div>
        <h1 className="logo">
          Lexicle<span className="logo-dot" aria-hidden="true" />
        </h1>
        <div className="topbar-side right">
          <button
            type="button"
            className="icon-btn"
            onClick={() => updatePrefs({ theme: isDark ? 'light' : 'dark' })}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button type="button" className="icon-btn" onClick={() => setPanel('stats')} aria-label="Statistics">
            <StatsIcon />
          </button>
          <button type="button" className="icon-btn" onClick={() => setPanel('settings')} aria-label="Settings">
            <SettingsIcon />
          </button>
        </div>
      </header>

      <main className="play">
        <div className="toasts" aria-live="polite">
          {game.toasts.map((t) => (
            <div key={t.id} className="toast">
              {t.text}
            </div>
          ))}
        </div>

        <div className="board-wrap">
          <Board
            key={game.roundId}
            answer={game.answer}
            guesses={game.guesses}
            current={game.current}
            revealing={game.revealing}
            won={game.status === 'won'}
            shakeKey={game.shakeKey}
          />
        </div>

        <div className={`next-bar${finished && !game.revealing ? ' visible' : ''}`}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={playAgain}
            tabIndex={finished && !game.revealing ? 0 : -1}
            onMouseDown={(e) => e.preventDefault()}
          >
            <RefreshIcon />
            Play again
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setPanel('stats')}
            tabIndex={finished && !game.revealing ? 0 : -1}
            onMouseDown={(e) => e.preventDefault()}
          >
            View stats
          </button>
        </div>

        <Keyboard
          keyStates={game.keyStates}
          onLetter={game.addLetter}
          onEnter={game.submit}
          onBackspace={game.removeLetter}
        />
      </main>

      <Modal title="How to play" open={panel === 'help'} onClose={closePanel}>
        <HelpPanel />
      </Modal>
      <Modal title={finished ? 'Round complete' : 'Statistics'} open={panel === 'stats'} onClose={closePanel}>
        <StatsPanel
          stats={game.stats}
          status={game.status}
          answer={game.answer}
          guessCount={game.guesses.length}
          onPlayAgain={playAgain}
        />
      </Modal>
      <Modal title="Settings" open={panel === 'settings'} onClose={closePanel}>
        <SettingsPanel
          theme={prefs.theme}
          onThemeChange={(theme) => updatePrefs({ theme })}
          onResetStats={() => game.replaceStats(emptyStats())}
        />
      </Modal>
    </div>
  );
}
