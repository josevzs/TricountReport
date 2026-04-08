import { useState, useRef } from 'react';
import { saveSettings } from '../../api/client';
import { useAppStore } from '../../store/appStore';
import type { ProviderSettings, AIProvider } from '../../types';
import './SettingsPanel.css';

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { settings, setSettings } = useAppStore();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(patch: Partial<ProviderSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try { await saveSettings(next); } finally { setSaving(false); }
    }, 600);
  }

  return (
    <div className="settings-wrapper">
      <button className="settings-toggle" onClick={() => setOpen(o => !o)}>
        {saving ? <span className="spinner" /> : '⚙'}{' '}Settings
      </button>

      {open && (
        <div className="settings-panel">
          <div className="settings-header">
            <span className="settings-title">AI PROVIDER</span>
            <button className="settings-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="provider-grid">
            {(['ollama', 'claude', 'openai'] as AIProvider[]).map(p => (
              <label key={p} className={`provider-option ${settings.provider === p ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="provider"
                  value={p}
                  checked={settings.provider === p}
                  onChange={() => handleChange({ provider: p })}
                />
                <span>{p === 'ollama' ? 'Ollama' : p === 'claude' ? 'Claude' : 'OpenAI'}</span>
              </label>
            ))}
          </div>

          {/* All provider fields always visible — just the active section is highlighted */}
          <div className="settings-all-providers">

            <div className={`settings-provider-block ${settings.provider === 'openai' ? 'active' : ''}`}>
              <div className="settings-provider-label">OpenAI</div>
              <div className="settings-fields">
                <div className="settings-field">
                  <label>API KEY</label>
                  <input
                    type="password"
                    placeholder="sk-…"
                    value={settings.openai_api_key}
                    onChange={e => handleChange({ openai_api_key: e.target.value })}
                  />
                </div>
                <div className="settings-field">
                  <label>MODEL</label>
                  <select value={settings.openai_model} onChange={e => handleChange({ openai_model: e.target.value })}>
                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                    <option value="gpt-4o">gpt-4o</option>
                    <option value="gpt-4-turbo">gpt-4-turbo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={`settings-provider-block ${settings.provider === 'claude' ? 'active' : ''}`}>
              <div className="settings-provider-label">Claude</div>
              <div className="settings-fields">
                <div className="settings-field">
                  <label>API KEY</label>
                  <input
                    type="password"
                    placeholder="sk-ant-…"
                    value={settings.claude_api_key}
                    onChange={e => handleChange({ claude_api_key: e.target.value })}
                  />
                </div>
                <div className="settings-field">
                  <label>MODEL</label>
                  <select value={settings.claude_model} onChange={e => handleChange({ claude_model: e.target.value })}>
                    <option value="claude-sonnet-4-6">claude-sonnet-4-6</option>
                    <option value="claude-opus-4-6">claude-opus-4-6</option>
                    <option value="claude-haiku-4-5-20251001">claude-haiku-4-5</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={`settings-provider-block ${settings.provider === 'ollama' ? 'active' : ''}`}>
              <div className="settings-provider-label">Ollama (local)</div>
              <div className="settings-fields">
                <div className="settings-field">
                  <label>BASE URL</label>
                  <input
                    type="text"
                    value={settings.ollama_base_url}
                    onChange={e => handleChange({ ollama_base_url: e.target.value })}
                  />
                </div>
                <div className="settings-field">
                  <label>MODEL</label>
                  <input
                    type="text"
                    value={settings.ollama_model}
                    onChange={e => handleChange({ ollama_model: e.target.value })}
                    placeholder="llama3.2"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
