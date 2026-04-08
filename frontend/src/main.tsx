import { StrictMode, Component, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '60px 40px', fontFamily: 'monospace', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>Something went wrong</h2>
          <pre style={{ fontSize: 12, background: '#f5f5f5', padding: 16, whiteSpace: 'pre-wrap' }}>
            {(this.state.error as Error).message}
          </pre>
          <button
            style={{ marginTop: 20, padding: '8px 16px', cursor: 'pointer' }}
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
