import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Archived duplicate page — redirects to canonical ProductNew page
export default function AdminProductNew() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin/products/new', { replace: true });
  }, [navigate]);

  return (
    <div className="p-8">
      <h1 className="text-lg font-semibold">Redirecting to New Product page...</h1>
      <p className="text-sm text-gray-500">If not redirected, <a href="/admin/products/new" className="text-naaz-green">click here</a>.</p>
    </div>
  );
}