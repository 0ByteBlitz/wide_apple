// Utility for token refresh logic
export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;
    const res = await fetch('http://localhost:8000/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        return data.access_token;
    }
    return null;
}

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}, retry = true): Promise<Response> {
    let accessToken = localStorage.getItem('access_token');
    const headers = { ...(init.headers || {}), Authorization: `Bearer ${accessToken}` };
    const res = await fetch(input, { ...init, headers });
    if (res.status === 401 && retry) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            const retryHeaders = { ...(init.headers || {}), Authorization: `Bearer ${newToken}` };
            return fetch(input, { ...init, headers: retryHeaders });
        } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }
    }
    return res;
} 