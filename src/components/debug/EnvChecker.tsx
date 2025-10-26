import { useEffect, useState } from 'react';

export function EnvChecker() {
  const [envStatus, setEnvStatus] = useState({
    supabaseUrl: false,
    supabaseKey: false,
    nodeEnv: '',
    apiBaseUrl: '',
  });

  useEffect(() => {
    setEnvStatus({
      supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      nodeEnv: import.meta.env.VITE_NODE_ENV || 'not set',
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'not set',
    });
  }, []);

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-gray-800 text-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-2">Environment Status:</h3>
      <ul className="space-y-1">
        <li>Supabase URL: {envStatus.supabaseUrl ? '✅' : '❌'}</li>
        <li>Supabase Key: {envStatus.supabaseKey ? '✅' : '❌'}</li>
        <li>Node Env: {envStatus.nodeEnv}</li>
        <li>API URL: {envStatus.apiBaseUrl}</li>
      </ul>
    </div>
  );
}