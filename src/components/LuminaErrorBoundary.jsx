import React from 'react';

export default class LuminaErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[Lumina AI UI Error]', error);
    console.error('[Lumina AI Component Stack]', info?.componentStack);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          textAlign: 'center',
          color: '#f5f3ff',
          background: '#100b20',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h2>Lumina AI में एक समस्या आई</h2>
          <p style={{ maxWidth: 420, color: '#c4b5fd' }}>
            स्क्रीन लोड नहीं हो पाई। दोबारा कोशिश करो।
          </p>
          <button
            type="button"
            onClick={this.retry}
            style={{
              padding: '12px 22px',
              border: 0,
              borderRadius: 10,
              background: '#8b5cf6',
              color: '#fff',
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            फिर से कोशिश करें
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              maxWidth: '100%',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              textAlign: 'left',
              color: '#fca5a5',
              marginTop: 20
            }}>
              {String(this.state.error.stack || this.state.error)}
            </pre>
          )}
        </main>
      );
    }

    return this.props.children;
  }
}
