import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User } from 'lucide-react';

const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'Staff', value: 'staff' },
];

const AdminLogin: React.FC = () => {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-naaz-green/10 to-naaz-gold/10 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <img src="/lovable-uploads/logo.png" alt="Brand Logo" className="w-20 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-center text-naaz-green mb-2">Admin Login</h2>
        <div className="flex justify-center gap-2 mb-4">
          {roles.map(r => (
            <button
              key={r.value}
              className={`px-4 py-1 rounded-full border text-sm font-medium transition-colors ${role === r.value ? 'bg-naaz-green text-white' : 'border-naaz-green text-naaz-green bg-white'}`}
              onClick={() => setRole(r.value)}
              type="button"
            >
              {r.label}
            </button>
          ))}
        </div>
        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-naaz-green" size={18} />
              <input
                type="email"
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-naaz-green outline-none"
                placeholder="admin@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-naaz-green" size={18} />
              <input
                type="password"
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-naaz-green outline-none"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Button className="w-full bg-naaz-green hover:bg-naaz-green/90 text-white py-2 rounded-lg font-medium mt-2">Login</Button>
          <button type="button" className="text-sm text-naaz-green hover:underline mt-2">Forgot Password?</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
