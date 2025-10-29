import React, { useEffect, useState } from 'react';

interface DiagnosticInfo {
  reactVersion: string;
  nodeEnv: string;
  timestamp: string;
  userAgent: string;
  url: string;
  errors: string[];
}

export const AppDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo>({
    reactVersion: React.version,
    nodeEnv: import.meta.env.MODE,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    errors: []
  });

  useEffect(() => {
    // Capture any console errors
    const originalError = console.error;
    const errors: string[] = [];
    
    console.error = (...args) => {
      errors.push(args.join(' '));
      originalError(...args);
    };

    // Check if app is rendering
    console.log('🚀 App Diagnostic Component Loaded');
    console.log('Environment:', import.meta.env.MODE);
    console.log('React Version:', React.version);
    
    setDiagnostics(prev => ({ ...prev, errors }));

    return () => {
      console.error = originalError;
    };
  }, []);

  if (import.meta.env.PROD) {
    return null; // Don't show in production
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#000',
      color: '#0f0',
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      borderBottom: '2px solid #0f0'
    }}>
      <div>🚀 APP DIAGNOSTIC - {diagnostics.nodeEnv.toUpperCase()}</div>
      <div>React: {diagnostics.reactVersion} | Time: {new Date().toLocaleTimeString()}</div>
      <div>URL: {diagnostics.url}</div>
      {diagnostics.errors.length > 0 && (
        <div style={{ color: '#f00' }}>
          Errors: {diagnostics.errors.slice(-3).join(' | ')}
        </div>
      )}
    </div>
  );
};