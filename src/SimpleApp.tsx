import React from 'react';

const SimpleApp: React.FC = () => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#2D5A27', marginBottom: '20px' }}>
          🕌 Naaz Book Depot
        </h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Islamic Books & Literature
        </p>
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e8f5e8', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          ✅ React App is Running Successfully!
        </div>
        <p style={{ fontSize: '14px', color: '#888' }}>
          Environment: {import.meta.env.MODE}<br />
          Time: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default SimpleApp;