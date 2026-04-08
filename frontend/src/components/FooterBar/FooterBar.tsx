import { useState } from 'react';
import './FooterBar.css';

// ── Inline SVG icons ───────────────────────────────────────────────────────

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577
        0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756
        -1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304
        3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931
        0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322
        3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404
        2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84
        1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823
        2.222 0 1.606-.015 2.898-.015 3.293 0 .319.216.694.825.576C20.565 21.795
        24 17.298 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

function KoFiIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604
        0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672
        2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734
        4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011
        3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09
        -.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01
        3.005-.846 4.136.622l.19.133.134-.117c1.231-1.662 3.314-1.733
        4.26-.48.87 1.17.7 2.757-.166 3.597z"/>
    </svg>
  );
}

function N26Icon() {
  // Simple stylised bank card icon
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="2" y1="9" x2="22" y2="9" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="5" y1="14" x2="9" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── Overlay for how-to and legal pages ────────────────────────────────────

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fb-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fb-overlay-panel">
        <button className="fb-overlay-close" onClick={onClose}>✕</button>
        <div className="fb-overlay-content">{children}</div>
      </div>
    </div>
  );
}

// ── Instructions page ─────────────────────────────────────────────────────

function HowToPage() {
  return (
    <>
      <h2>How to use TricountReport</h2>

      <h4>Step 1 — Load your data</h4>
      <p>
        You can load expenses in two ways:
      </p>
      <ul>
        <li>
          <strong>Upload a file</strong> — export your Tricount registry as <code>.xlsx</code>
          (Tricount app → registry → ⋯ → Export → Excel) and drop it in the upload box.
        </li>
        <li>
          <strong>Fetch directly</strong> — paste your Tricount share link (e.g.
          <code>https://tricount.com/tXxXxXxX</code>) or just the registry code.
          No credentials needed.
        </li>
      </ul>

      <h4>Step 2 — AI Categorize</h4>
      <p>
        Click <strong>Auto-categorize with AI</strong>. The AI reads every expense description
        and suggests a category with a confidence score. You can use Ollama (local, free),
        OpenAI, or Claude — configure via the ⚙ Settings button.
      </p>
      <p>
        Hit <strong>Apply ≥85%</strong> to bulk-accept all high-confidence suggestions, or
        accept them one by one.
      </p>

      <h4>Step 3 — Review & correct</h4>
      <p>
        The table shows every expense. Change any category from the dropdown.
        Use the filters (description, category, payer) to focus on specific rows.
        All changes are saved locally — you can close the tab and come back.
      </p>

      <h4>Step 4 — Generate report</h4>
      <p>
        Choose a trip name, select <strong>Global</strong> (totals for the whole group) or
        <strong>Personal</strong> (one member's share of each expense), and click
        <strong>Generate Report</strong>. Download as <code>.md</code> (Markdown) or
        <code>.pdf</code>.
      </p>

      <h4>AI provider setup</h4>
      <table>
        <thead>
          <tr><th>Provider</th><th>What you need</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Ollama (local)</td>
            <td><a href="https://ollama.com" target="_blank" rel="noreferrer">ollama.com</a> running locally + <code>ollama pull llama3.2</code></td>
          </tr>
          <tr>
            <td>OpenAI</td>
            <td>API key from <a href="https://platform.openai.com" target="_blank" rel="noreferrer">platform.openai.com</a></td>
          </tr>
          <tr>
            <td>Claude</td>
            <td>API key from <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a></td>
          </tr>
        </tbody>
      </table>

      <h4>Privacy note</h4>
      <p>
        All data stays on your browser and the local server. Nothing is sent to third-party
        services except the AI provider you choose (only expense descriptions — no names,
        amounts, or balances). Sessions expire after 48 hours.
      </p>
    </>
  );
}

// ── Legal page ────────────────────────────────────────────────────────────

function LegalPage() {
  return (
    <>
      <h2>Legal &amp; Privacy</h2>

      <h4>What this service is</h4>
      <p>
        TricountReport is a free, open-source tool for generating expense reports from Tricount
        data. It is provided as-is, with no warranty. It is not affiliated with Tricount or any
        AI provider.
      </p>

      <h4>Data processing (GDPR — EU)</h4>
      <p>
        Under the EU General Data Protection Regulation (GDPR), you are the sole controller of
        the data you process with this tool.
      </p>
      <ul>
        <li>
          <strong>What is stored:</strong> expense data you upload or fetch is held in a
          temporary server-side session that expires after 48 hours. It is also cached in your
          browser's <code>localStorage</code>.
        </li>
        <li>
          <strong>What is shared:</strong> if you use an AI provider (OpenAI, Claude, or a
          remote Ollama instance), expense <em>descriptions</em> are sent to that provider's
          API. No participant names, amounts, or balances are included in the AI prompt.
        </li>
        <li>
          <strong>Cookies:</strong> no tracking cookies are set. The only data stored locally
          is your settings and session state in <code>localStorage</code> (necessary for the
          tool to function).
        </li>
        <li>
          <strong>Third-party services:</strong> this page embeds fonts from Google Fonts.
          Google may log your IP address when loading these fonts. If you prefer no external
          requests, run the tool locally.
        </li>
      </ul>

      <h4>Your rights (EU residents)</h4>
      <p>
        You have the right to access, correct, or delete any personal data processed through
        this tool. Since all data is in your own browser session, you can clear it at any time
        by clicking the reset / load-new button at step 01, or clearing your browser storage.
      </p>

      <h4>Liability</h4>
      <p>
        This tool is provided free of charge for personal use. The author accepts no liability
        for any errors in generated reports. Always verify totals before using them for financial
        decisions.
      </p>

      <h4>Open source</h4>
      <p>
        Source code is available on{' '}
        <a href="https://github.com/josevzs/tric-yreports" target="_blank" rel="noreferrer">
          GitHub
        </a>
        . MIT licence.
      </p>
    </>
  );
}

// ── Footer bar ────────────────────────────────────────────────────────────

export default function FooterBar() {
  const [overlay, setOverlay] = useState<'howto' | 'legal' | null>(null);

  return (
    <>
      <footer className="footer-bar">
        <button className="fb-link" onClick={() => setOverlay('howto')}>
          How to use
        </button>

        <button className="fb-link" onClick={() => setOverlay('legal')}>
          Legal &amp; Privacy
        </button>

        <a
          className="fb-link fb-icon-link"
          href="https://github.com/josevzs/tric-yreports"
          target="_blank"
          rel="noreferrer"
          title="Source code on GitHub"
        >
          <GitHubIcon />
          <span>GitHub</span>
        </a>

        <a
          className="fb-link fb-icon-link fb-kofi"
          href="https://ko-fi.com/josevzs"
          target="_blank"
          rel="noreferrer"
          title="Buy me a coffee — this trip report won't pay for itself"
        >
          <KoFiIcon />
          <span>Buy me a coffee</span>
          <span className="fb-kofi-aside">(the one expense the AI always gets right)</span>
        </a>

        <a
          className="fb-link fb-icon-link fb-n26"
          href="https://n26.com/r/josev1686?cid=CTK&lang=en"
          target="_blank"
          rel="noreferrer"
        >
          <N26Icon />
          <span>N26 — real rates, free cash worldwide</span>
          <span className="fb-n26-tooltip">
            <strong>Stop losing money on currency exchange.</strong><br />
            N26 uses the official Mastercard rate — no markup, no surprises.
            Withdraw cash for free almost anywhere in the world.<br /><br />
            Perfect for trips like the ones you're reporting here.
            Open an account with this link and we both get a small bonus.
          </span>
        </a>
      </footer>

      {overlay === 'howto' && (
        <Overlay onClose={() => setOverlay(null)}>
          <HowToPage />
        </Overlay>
      )}
      {overlay === 'legal' && (
        <Overlay onClose={() => setOverlay(null)}>
          <LegalPage />
        </Overlay>
      )}
    </>
  );
}
