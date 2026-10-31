import type { LetterState } from '../lib/game';
import { BackspaceIcon } from './Icons';

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

interface KeyboardProps {
  keyStates: Record<string, LetterState>;
  onLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
}

export function Keyboard({ keyStates, onLetter, onEnter, onBackspace }: KeyboardProps) {
  // Keep focus off the keys so the physical Enter key never re-clicks one.
  const noFocus = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="keyboard" aria-label="Keyboard">
      {ROWS.map((row, r) => (
        <div className="key-row" key={row}>
          {r === 1 && <div className="key-spacer" />}
          {r === 2 && (
            <button type="button" className="key wide" onMouseDown={noFocus} onClick={onEnter}>
              Enter
            </button>
          )}
          {[...row].map((letter) => (
            <button
              key={letter}
              type="button"
              className="key"
              data-state={keyStates[letter]}
              onMouseDown={noFocus}
              onClick={() => onLetter(letter)}
              aria-label={`${letter}${keyStates[letter] ? `, ${keyStates[letter]}` : ''}`}
            >
              {letter}
            </button>
          ))}
          {r === 2 && (
            <button
              type="button"
              className="key wide"
              onMouseDown={noFocus}
              onClick={onBackspace}
              aria-label="Backspace"
            >
              <BackspaceIcon />
            </button>
          )}
          {r === 1 && <div className="key-spacer" />}
        </div>
      ))}
    </div>
  );
}
