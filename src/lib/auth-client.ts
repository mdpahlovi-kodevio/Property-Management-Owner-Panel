import { createAuthClient } from 'better-auth/react';

export const auth = createAuthClient({
    baseURL: import.meta.env.VITE_APP_SERVER as string || 'http://localhost:5000',
});
