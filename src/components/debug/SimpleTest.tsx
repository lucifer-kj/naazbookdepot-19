import React from 'react';

export const SimpleTest: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      border: '2px solid #000',
      padding: '20px',
      zIndex: 10000,
      fontSize: '18px',
      fontWeight: 'bold'
    }}>
      ✅ React is Working!
      <br />
      Time: {new Date().toLocaleTimeString()}
      <br />
      Environment: {import.meta.env.MODE}
    </div>
  );
};