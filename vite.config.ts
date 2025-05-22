import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: parseInt(process.env.VITE_DEV_SERVER_PORT || '5173'),
    },
    plugins: [react()],
});