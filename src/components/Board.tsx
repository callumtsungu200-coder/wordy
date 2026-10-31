import { useEffect, useRef } from 'react';
import { MAX_GUESSES, WORD_LENGTH, evaluateGuess } from '../lib/game';
import type { LetterState } from '../lib/game';
import { FLIP_STAGGER_MS } from '../lib/useGame';

interface BoardProps {
  answer: string;
  guesses: string[];
  current: string;
  revealing: boolean;
  won: boolean;
  shakeKey: number;
}

export function Board({ answer, guesses, current, revealing, won, shakeKey }: BoardProps) {
  const rows = [];
  for (let r = 0; r < MAX_GUESSES; r++) {
    if (r < guesses.length) {
      const isLast = r === guesses.length - 1;
      rows.push(
        <Row
          key={r}
          letters={guesses[r]}
          states={evaluateGuess(guesses[r], answer)}
          flipping={revealing && isLast}
          bounce={won && !revealing && isLast}
        />,
      );
    } else if (r === guesses.length) {
      rows.push(<Row key={r} letters={current} shakeKey={shakeKey} active />);
    } else {
      rows.push(<Row key={r} letters="" />);
    }
  }
  return (
    <div className="board" role="grid" aria-label="Game board">
      {rows}
    </div>
  );
}

interface RowProps {
  letters: string;
  states?: LetterState[];
  flipping?: boolean;
  bounce?: boolean;
  active?: boolean;
  shakeKey?: number;
}

function Row({ letters, states, flipping, bounce, active, shakeKey = 0 }: RowProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shakeKey || !ref.current?.animate) return;
    ref.current.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(-2px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 420, easing: 'ease-in-out' },
    );
  }, [shakeKey]);

  const label = states
    ? `${letters.toUpperCase()}: ${states.map((s, i) => `${letters[i].toUpperCase()} ${s}`).join(', ')}`
    : active
      ? `Current guess${letters ? `: ${letters.toUpperCase()}` : ''}`
      : 'Empty row';

  return (
    <div ref={ref} className={`row${bounce ? ' bounce' : ''}`} role="row" aria-label={label}>
      {Array.from({ length: WORD_LENGTH }, (_, i) => {
        const letter = letters[i] ?? '';
        const state = states?.[i];
        return (
          <div
            key={i}
            role="gridcell"
            className={`tile${flipping ? ' flip' : ''}`}
            data-state={state ?? (letter ? 'tbd' : 'empty')}
            data-filled={letter ? 'true' : 'false'}
            style={{ '--i': i, '--delay': `${i * FLIP_STAGGER_MS}ms` } as React.CSSProperties}
          >
            {letter.toUpperCase()}
          </div>
        );
      })}
    </div>
  );
}
