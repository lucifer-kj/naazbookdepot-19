import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPromoCodes() {
	const navigate = useNavigate();

	useEffect(() => {
		// Redirect to canonical promo codes page
		navigate('/admin/promo-codes', { replace: true });
	}, [navigate]);

	return (
		<div className="p-8">
			<h1 className="text-lg font-semibold">Redirecting to Promo Codes...</h1>
			<p className="text-sm text-gray-500">If you are not redirected, <a href="/admin/promo-codes" className="text-naaz-green">click here</a>.</p>
		</div>
	);
}



