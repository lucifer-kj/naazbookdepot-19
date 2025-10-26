import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This file was a duplicate/legacy admin page. It now redirects to the canonical
// admin products page to avoid confusion. The original duplicate was archived at
// src/pages/archive/admin/AdminProducts.tsx

export default function AdminProducts() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin/products', { replace: true });
  }, [navigate]);

  return (
    <div className="p-8">
      <h1 className="text-lg font-semibold">Redirecting to Admin Products...</h1>
      <p className="text-sm text-gray-500">If you are not redirected, <a href="/admin/products" className="text-naaz-green">click here</a>.</p>
    </div>
  );
}
