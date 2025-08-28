import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          background: '#fff5f5',
          border: '2px solid #fed7d7',
          borderRadius: '8px',
          margin: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#c53030', marginBottom: '1rem' }}>
            🚫 Có lỗi xảy ra
          </h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Đã xảy ra lỗi khi tải component. Vui lòng thử lại.
          </p>
          <details style={{ textAlign: 'left', marginTop: '1rem' }}>
            <summary style={{ cursor: 'pointer', color: '#2d3748' }}>
              Chi tiết lỗi (Click để xem)
            </summary>
            <pre style={{ 
              background: '#f7fafc', 
              padding: '1rem', 
              borderRadius: '4px', 
              fontSize: '0.8rem',
              overflow: 'auto',
              marginTop: '0.5rem'
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#2E86AB',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '1rem',
              fontSize: '1rem'
            }}
          >
            🔄 Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;