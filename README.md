# Wordy

An unlimited five-letter word puzzle built with React and TypeScript. Guess the hidden word in six tries, then start another round straight away. There's no daily limit, no account and no server. Everything runs and saves in your browser.

## Features

- **Unlimited rounds.** Every round picks a new random answer and avoids your 200 most recent words.
- **Scoring.** Green means the right letter in the right spot, yellow means the letter is in the word but in another spot, and grey means the letter isn't in the word. Repeated letters are scored correctly.
- **Dictionary checks.** About 12,600 five-letter words are accepted as guesses. Answers come from a hand-picked list of 960 common words.
- **On-screen and physical keyboard.** The keys change colour as you learn about each letter.
- **Animations.** Tiles pop as you type, flip one by one to reveal, shake when a guess is rejected and bounce when you win. All motion respects `prefers-reduced-motion`.
- **Win and loss screens.** They show the answer, your stats and a **Play again** button. You can also press <kbd>Enter</kbd> after a round to start the next one.
- **Statistics saved in `localStorage`:**
  - games played, wins and losses
  - win percentage
  - current and longest winning streak
  - guess distribution
  - personal best (fewest guesses in a win)
- **Resume.** If you reload mid-round, you pick up where you left off.
- **Light, dark and system themes.** There's a quick toggle in the header, and the setting is saved.
- **Reset statistics.** Available in Settings, behind a confirmation step.
- **Responsive and accessible.** The layout works from small phones to desktop. Dialogs trap focus and close with <kbd>Esc</kbd>.

## Getting started

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # start the dev server at http://localhost:5173
```

### Other scripts

| Command | What it does |
| --- | --- |
| `npm run build` | Type-check and build a static production bundle into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the unit and integration test suite once |
| `npm run test:watch` | Run tests in watch mode |

The production build uses relative paths, so you can host `dist/` from any static host or subfolder.

## How to play

1. Type a five-letter word and press <kbd>Enter</kbd>.
2. The tiles change colour to show how close your guess was.
3. Find the word within six guesses.
4. Press **Play again** or <kbd>Enter</kbd> for a new word.

## Project structure

```
src/
  App.tsx                  App shell, dialogs, physical keyboard handling
  components/
    Board.tsx              6×5 grid with flip / shake / bounce animations
    Keyboard.tsx           On-screen keyboard
    Modal.tsx              Accessible animated dialog
    StatsPanel.tsx         Results + statistics + guess distribution
    HelpPanel.tsx          How-to-play
    SettingsPanel.tsx      Theme picker + reset-statistics confirmation
    Icons.tsx              Inline SVG icons
  lib/
    game.ts                Scoring, validation, answer selection
    storage.ts             localStorage persistence for stats, prefs, game
    useGame.ts             Game state hook (input, reveal timing, results)
  data/
    answers.ts             Curated answer list
    dictionary.ts          Generated list of valid guesses
  styles.css               Design tokens, themes, layout and animations
scripts/
  build-dictionary.mjs     Regenerates src/data/dictionary.ts
```

## Data and privacy

The app stores everything locally under these `localStorage` keys:

| Key | Contents |
| --- | --- |
| `wordy:stats` | Statistics |
| `wordy:prefs` | Theme and whether the help screen has been seen |
| `wordy:game` | The round in progress |
| `wordy:recent` | Recently used answers, so they aren't repeated |

Nothing is sent over the network. The only external request is for the Inter web font, and the app falls back to system fonts if it can't load.

## Customising the words

- **Answers:** edit the list in `src/data/answers.ts`. The test suite checks that every answer is unique, five letters long and accepted as a guess.
- **Valid guesses:** run `node scripts/build-dictionary.mjs` to regenerate `src/data/dictionary.ts` from the [`an-array-of-english-words`](https://www.npmjs.com/package/an-array-of-english-words) package, which is a dev dependency.

## Testing

The project has 35 tests, run with Vitest and Testing Library. They cover:

- scoring, including repeated-letter cases
- dictionary validation and checks on the answer list
- stats calculations, plus persistence and recovery from corrupt storage
- full gameplay through both the physical and on-screen keyboards
- rejected guesses, wins, losses and play again
- resuming a round after a reload, and stats across many games
- theme switching and the reset confirmation

```bash
npm test
```
