import React from 'react';
import './App.css';

function App() {
  console.log('🚀 App starting...');
  
  return (
    <div style={{
      padding: '2rem',
      background: '#f9f9f9',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1 style={{ color: '#007acc', marginBottom: '1rem' }}>
          ✅ App đã chạy!
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          Nếu thấy text này thì React app đã hoạt động bình thường.
        </p>
        <div style={{
          background: '#e8f5e8',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '1rem'
        }}>
          <p style={{ margin: 0, color: '#2d5016' }}>
            🎉 Không còn màn hình trắng nữa!
          </p>
        </div>
        <button 
          onClick={() => alert('Button hoạt động!')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;
