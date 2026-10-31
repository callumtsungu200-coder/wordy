import { useState } from 'react';
import type { Theme } from '../lib/storage';

interface SettingsPanelProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onResetStats: () => void;
}

const THEMES: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function SettingsPanel({ theme, onThemeChange, onResetStats }: SettingsPanelProps) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div className="settings">
      <div className="setting">
        <div>
          <div className="setting-title">Appearance</div>
          <div className="setting-desc">Choose light, dark, or follow your device.</div>
        </div>
        <div className="segmented" role="radiogroup" aria-label="Theme">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={theme === t.value}
              className={theme === t.value ? 'active' : ''}
              onClick={() => onThemeChange(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="setting setting-danger">
        <div>
          <div className="setting-title">Reset statistics</div>
          <div className="setting-desc">
            {done ? 'Statistics cleared.' : 'Permanently clear games played, streaks and distribution.'}
          </div>
        </div>
        {!confirming && (
          <button
            type="button"
            className="btn btn-danger-outline"
            onClick={() => {
              setConfirming(true);
              setDone(false);
            }}
          >
            Reset
          </button>
        )}
      </div>

      {confirming && (
        <div className="confirm" role="alertdialog" aria-label="Confirm reset">
          <p>Reset all statistics? This can’t be undone.</p>
          <div className="confirm-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)} autoFocus>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                onResetStats();
                setConfirming(false);
                setDone(true);
              }}
            >
              Yes, reset
            </button>
          </div>
        </div>
      )}

      <p className="footnote">All statistics and preferences are stored only on this device.</p>
    </div>
  );
}
