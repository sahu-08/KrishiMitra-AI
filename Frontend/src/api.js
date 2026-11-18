const API = import.meta.env.VITE_API_URL || 'https://krishimitra-ai-vqd4.onrender.com/api';

async function request(path, options = {}) {
    const res = await fetch(`${API}${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

export const api = {
    register: (body) =>
        request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    login: (body) =>
        request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

    logout: () => request('/auth/logout', { method: 'POST', body: '{}' }),

    me: () => request('/auth/me'),

    recommend: (body) =>
        request('/crops/recommend', {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    history: () => request('/crops/history'),

    chat: (message) =>
        request('/chat', { method: 'POST', body: JSON.stringify({ message }) }),
};
