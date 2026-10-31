import type { GameStatus } from '../lib/game';
import { winPercentage } from '../lib/storage';
import type { Stats } from '../lib/storage';
import { RefreshIcon } from './Icons';

interface StatsPanelProps {
  stats: Stats;
  status: GameStatus;
  answer: string;
  guessCount: number;
  onPlayAgain: () => void;
}

export function StatsPanel({ stats, status, answer, guessCount, onPlayAgain }: StatsPanelProps) {
  const maxBar = Math.max(1, ...stats.distribution);
  const finished = status !== 'playing';

  return (
    <div className="stats">
      {finished && (
        <div className={`result result-${status}`}>
          {status === 'won' ? (
            <>
              <p className="result-title">You got it!</p>
              <p className="result-sub">
                Solved in {guessCount} {guessCount === 1 ? 'guess' : 'guesses'}
              </p>
            </>
          ) : (
            <>
              <p className="result-title">So close</p>
              <p className="result-sub">The word was</p>
            </>
          )}
          <div className="result-word" aria-label={`Answer: ${answer}`}>
            {[...answer].map((l, i) => (
              <span key={i} className="mini-tile" data-state={status === 'won' ? 'correct' : 'absent'}>
                {l.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="stat-grid">
        <Stat value={stats.played} label="Played" />
        <Stat value={winPercentage(stats)} label="Win %" />
        <Stat value={stats.currentStreak} label="Current streak" />
        <Stat value={stats.maxStreak} label="Best streak" />
      </div>

      <div className="stat-row">
        <div>
          <span className="stat-inline-value">{stats.wins}</span> {stats.wins === 1 ? 'win' : 'wins'}
        </div>
        <div>
          <span className="stat-inline-value">{stats.losses}</span> {stats.losses === 1 ? 'loss' : 'losses'}
        </div>
        <div>
          Personal best{' '}
          <span className="stat-inline-value">
            {stats.bestGuesses === null ? '—' : `${stats.bestGuesses}/6`}
          </span>
        </div>
      </div>

      <h3 className="section-title">Guess distribution</h3>
      <div className="distribution">
        {stats.distribution.map((count, i) => {
          const highlight = status === 'won' && guessCount === i + 1;
          return (
            <div className="dist-row" key={i}>
              <span className="dist-label">{i + 1}</span>
              <div className="dist-track">
                <div
                  className={`dist-bar${highlight ? ' highlight' : ''}`}
                  style={{ width: `${Math.max(7, (count / maxBar) * 100)}%` }}
                  data-testid={`dist-${i + 1}`}
                >
                  {count}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {finished && (
        <button type="button" className="btn btn-primary btn-block" onClick={onPlayAgain} autoFocus>
          <RefreshIcon />
          Play again
        </button>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
