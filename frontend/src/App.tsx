import { useEffect, useState } from 'react';
import { useAppStore } from './store/appStore';
import { saveSettings } from './api/client';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import UploadStep from './components/UploadStep/UploadStep';
import AIControls from './components/AIControls/AIControls';
import ExpenseTable from './components/ExpenseTable/ExpenseTable';
import ReportView from './components/ReportView/ReportView';
import FooterBar from './components/FooterBar/FooterBar';
import type { AppStep } from './types';
import './App.css';

const STEPS: { id: AppStep; label: string }[] = [
  { id: 'upload',     label: '01 — Load' },
  { id: 'categorize', label: '02 — Categorize' },
  { id: 'review',     label: '03 — Review' },
  { id: 'report',     label: '04 — Report' },
];

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return [theme, () => setTheme(t => t === 'dark' ? 'light' : 'dark')] as const;
}

export default function App() {
  const { currentStep, uploadSummary, setStep, error, setError, settings } = useAppStore();
  const [theme, toggleTheme] = useTheme();
  const stepIndex = STEPS.findIndex(s => s.id === currentStep);

  // On startup, push persisted settings to backend so it stays in sync with localStorage
  useEffect(() => {
    saveSettings(settings).catch((err) => console.warn("Could not sync settings to backend:", err));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <h1>tric-yreports</h1>
          {uploadSummary && (
            <span className="session-info">
              {uploadSummary.expense_count} exp · {uploadSummary.total_amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {uploadSummary.currency}
            </span>
          )}
        </div>
        <div className="header-right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {theme === 'dark' ? '○' : '●'}
          </button>
          <SettingsPanel />
        </div>
      </header>

      <nav className="step-nav">
        {STEPS.map((step, i) => {
          const isActive = currentStep === step.id;
          const isCompleted = stepIndex > i;
          return (
            <button
              key={step.id}
              className={`step-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => (isCompleted || isActive) && setStep(step.id)}
              disabled={!isCompleted && !isActive}
            >
              {step.label}
            </button>
          );
        })}
      </nav>

      {error && (
        <div className="global-error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <main className="app-main">
        {currentStep === 'upload'     && <UploadStep />}
        {currentStep === 'categorize' && <AIControls />}
        {currentStep === 'review'     && <ExpenseTable />}
        {currentStep === 'report'     && <ReportView />}
      </main>

      <FooterBar />
    </div>
  );
}
