import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api_base_url } from '../helper';

export default function OAuthCallback() {
	const navigate = useNavigate();
	const [error, setError] = useState('');
	const params = useMemo(() => new URLSearchParams(window.location.search), []);

	useEffect(() => {
		try {
				const token = params.get('token');
				const userId = params.get('userId');
				const code = params.get('code');
				const state = (params.get('state') || '').toLowerCase();

				// If provider redirected to frontend by mistake, forward code/state to backend
				if (code && state) {
					const dest = state.includes('google')
						? `${api_base_url}/auth/google/callback${window.location.search}`
						: `${api_base_url}/auth/github/callback${window.location.search}`;
					window.location.replace(dest);
					return;
				}
			if (token && userId) {
				localStorage.setItem('token', token);
				localStorage.setItem('isLoggedIn', true);
				localStorage.setItem('userId', userId);
				try { localStorage.setItem('user', JSON.stringify({ userId })); } catch {}
				navigate('/', { replace: true });
				return;
			}
			// If missing params, show message instead of abrupt redirect loop
			setError('Missing OAuth parameters. Please retry login.');
		} catch (e) {
			setError('Failed to parse OAuth response.');
		}
	}, [navigate, params]);

	if (!error) return null;
	return (
		<div className="min-h-screen flex items-center justify-center p-6">
			<div className="bg-white rounded-lg shadow p-6 w-full max-w-md text-center">
				<h1 className="text-xl font-semibold mb-2">Sign-in Error</h1>
				<p className="text-gray-600 mb-4">{error}</p>
				<div className="flex gap-2 justify-center">
					<a href={`${window.location.protocol}//${window.location.hostname}:3001/auth/google`} className="px-4 py-2 bg-gray-200 rounded">Try Google</a>
					<a href={`${window.location.protocol}//${window.location.hostname}:3001/auth/github`} className="px-4 py-2 bg-gray-900 text-white rounded">Try GitHub</a>
				</div>
			</div>
		</div>
	);
}
