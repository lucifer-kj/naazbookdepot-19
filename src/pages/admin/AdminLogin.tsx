import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TEST_ADMIN = {
  username: 'admin',
  password: 'admin123'
};

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === TEST_ADMIN.username && password === TEST_ADMIN.password) {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-naaz-cream">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-naaz-green mb-6 text-center">Admin Login</h2>
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Username</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-naaz-green text-white py-2 rounded hover:bg-naaz-green/90 transition-colors"
        >
          Login
        </button>
        <div className="mt-4 text-xs text-gray-500 text-center">
          Test credentials: <br />
          <span className="font-mono">admin / admin123</span>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
