import { useRef, useState } from 'react';
import { uploadFile, fetchRegistry, getExpenses } from '../../api/client';
import { useAppStore } from '../../store/appStore';
import './UploadStep.css';

/** Extract a Tricount registry ID from any URL format or return the raw value.
 *  Handles:
 *   - https://tricount.com/en/registry/ABC123  → ABC123
 *   - https://tricount.com/tCiXdLxCqupzZeeKwJ  → tCiXdLxCqupzZeeKwJ
 *   - ABC123  → ABC123
 */
function parseRegistryInput(input: string): string {
  const clean = input.trim();
  // Named registry path
  const registryMatch = clean.match(/registry\/([A-Za-z0-9_-]+)/);
  if (registryMatch) return registryMatch[1];
  // Short-link: tricount.com/<code>  (last path segment, no slashes after)
  const shortMatch = clean.match(/tricount\.com\/([A-Za-z0-9_-]+)\/?$/);
  if (shortMatch) return shortMatch[1];
  // Bare code or anything else
  return clean;
}

export default function UploadStep() {
  const [tab, setTab] = useState<'file' | 'fetch'>('file');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    lastRegistryInput, setLastRegistryInput,
    setSessionId, setUploadSummary, setData, setStep, setError,
  } = useAppStore();

  async function handleLoad(file: File) {
    setLoading(true);
    setError(null);
    try {
      const summary = await uploadFile(file);
      const data    = await getExpenses(summary.session_id);
      setSessionId(summary.session_id);
      setUploadSummary(summary);
      setData(data);
      setStep('categorize');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleFetch() {
    const id = parseRegistryInput(lastRegistryInput);
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const summary = await fetchRegistry(id);
      const data    = await getExpenses(summary.session_id);
      setSessionId(summary.session_id);
      setUploadSummary(summary);
      setData(data);
      setStep('categorize');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch from Tricount');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="upload-step">
      <div className="upload-header">
        <span className="upload-label">LOAD DATA</span>
      </div>

      <div className="upload-tabs">
        <button className={`upload-tab ${tab === 'file' ? 'active' : ''}`} onClick={() => setTab('file')}>
          Upload .xlsx
        </button>
        <button className={`upload-tab ${tab === 'fetch' ? 'active' : ''}`} onClick={() => setTab('fetch')}>
          Fetch from Tricount
        </button>
      </div>

      {tab === 'file' && (
        <div
          className={`drop-zone ${dragging ? 'dragging' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleLoad(f); }}
          onClick={() => fileRef.current?.click()}
        >
          <div className="drop-icon">[ .xlsx ]</div>
          <p>Drag & drop your Tricount export</p>
          <p className="drop-sub">or click to browse</p>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleLoad(e.target.files[0])}
          />
        </div>
      )}

      {tab === 'fetch' && (
        <div className="fetch-panel">
          <div className="fetch-field">
            <label className="field-label">REGISTRY ID OR LINK</label>
            <input
              type="text"
              placeholder="https://tricount.com/en/registry/ABC123  or just  ABC123"
              value={lastRegistryInput}
              onChange={e => setLastRegistryInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
            />
            <p className="field-hint">
              Accepts full Tricount share links or bare registry IDs. Last value is remembered.
            </p>
          </div>
          <button className="btn btn-fill" onClick={handleFetch} disabled={!lastRegistryInput.trim() || loading}>
            {loading ? <span className="spinner spinner-white" /> : null}
            {loading ? 'Fetching…' : 'Fetch Data →'}
          </button>
        </div>
      )}

      {loading && tab === 'file' && (
        <div className="upload-loading">
          <div className="progress-track"><div className="progress-fill" style={{ width: '100%' }} /></div>
          <span>Loading…</span>
        </div>
      )}
    </div>
  );
}
