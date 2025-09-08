import React from 'react';

class ApiErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('API Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="api-error-boundary">
          <div className="error-container">
            <h2>🚨 Lỗi kết nối API</h2>
            <div className="error-details">
              <p><strong>Nguyên nhân có thể:</strong></p>
              <ul>
                <li>Server backend không chạy (Port 2004)</li>
                <li>Kết nối mạng không ổn định</li>
                <li>CORS policy blocked</li>
                <li>Server đang bảo trì</li>
              </ul>
              
              <div className="error-actions">
                <button 
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="retry-button"
                >
                  🔄 Thử lại
                </button>
                
                <button 
                  onClick={() => window.location.reload()}
                  className="reload-button"
                >
                  ♻️ Tải lại trang
                </button>
              </div>
              
              {import.meta.env.DEV && (
                <details className="error-technical">
                  <summary>Chi tiết lỗi (Development)</summary>
                  <pre>{this.state.error && this.state.error.toString()}</pre>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </details>
              )}
            </div>
          </div>
          
          <style jsx>{`
            .api-error-boundary {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 50vh;
              padding: 20px;
              background: #f8f9fa;
            }
            
            .error-container {
              max-width: 600px;
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border-left: 5px solid #dc3545;
            }
            
            .error-container h2 {
              color: #dc3545;
              margin-bottom: 20px;
              font-size: 1.5rem;
            }
            
            .error-details ul {
              margin: 15px 0;
              padding-left: 20px;
            }
            
            .error-details li {
              margin: 8px 0;
              color: #666;
            }
            
            .error-actions {
              margin: 20px 0;
              display: flex;
              gap: 15px;
            }
            
            .retry-button, .reload-button {
              padding: 10px 20px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.2s;
            }
            
            .retry-button {
              background: #007bff;
              color: white;
            }
            
            .retry-button:hover {
              background: #0056b3;
            }
            
            .reload-button {
              background: #6c757d;
              color: white;
            }
            
            .reload-button:hover {
              background: #5a6268;
            }
            
            .error-technical {
              margin-top: 20px;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 6px;
              border: 1px solid #dee2e6;
            }
            
            .error-technical pre {
              font-size: 12px;
              overflow-x: auto;
              margin: 10px 0;
              color: #dc3545;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ApiErrorBoundary;
