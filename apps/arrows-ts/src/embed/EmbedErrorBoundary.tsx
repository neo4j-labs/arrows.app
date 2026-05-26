import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}

interface State {
  error: Error | null;
}

export class EmbedErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface to the host so a wrapping VS Code extension / docs site can log it.
    window.parent.postMessage(
      { type: 'embed-error', message: error.message, stack: error.stack, info: info.componentStack },
      '*',
    );
  }

  reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div
        style={{
          padding: '1rem',
          fontFamily: 'sans-serif',
          color: '#a33',
          background: '#fff5f5',
          border: '1px solid #f3c2c2',
          borderRadius: 4,
          margin: '1rem',
        }}
      >
        <strong>{this.props.fallbackLabel ?? 'Render error'}</strong>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 8 }}>{this.state.error.message}</pre>
        <button onClick={this.reset} style={{ marginTop: 8 }}>Retry</button>
      </div>
    );
  }
}
