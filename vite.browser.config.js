import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    root: 'resources/browser',
    base: './',
    publicDir: false,
    plugins: [react(), tailwindcss()],
    build: {
        outDir: '../../public/browser',
        emptyOutDir: true,
    },
});
