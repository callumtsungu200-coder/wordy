import type { LetterState } from '../lib/game';

function Example({ word, index, state }: { word: string; index: number; state: LetterState }) {
  return (
    <div className="example">
      {[...word].map((l, i) => (
        <span key={i} className="mini-tile" data-state={i === index ? state : 'tbd'}>
          {l}
        </span>
      ))}
    </div>
  );
}

export function HelpPanel() {
  return (
    <div className="help">
      <p className="lead">Guess the hidden five-letter word in six tries. Play as many rounds as you like.</p>
      <ul>
        <li>Each guess must be a valid five-letter word.</li>
        <li>After each guess, the tiles change colour to show how close you were.</li>
      </ul>

      <h3 className="section-title">Examples</h3>
      <Example word="CRANE" index={0} state="correct" />
      <p>
        <strong>C</strong> is in the word and in the correct spot.
      </p>
      <Example word="PLUMB" index={2} state="present" />
      <p>
        <strong>U</strong> is in the word but in the wrong spot.
      </p>
      <Example word="STORM" index={3} state="absent" />
      <p>
        <strong>R</strong> is not in the word.
      </p>

      <h3 className="section-title">Shortcuts</h3>
      <p>
        Type with your keyboard, <kbd>Backspace</kbd> to delete and <kbd>Enter</kbd> to submit. Press{' '}
        <kbd>Enter</kbd> after a round ends to start the next one.
      </p>
    </div>
  );
}
