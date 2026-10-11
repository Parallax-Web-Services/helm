import { defineConfig } from 'vite';

export default defineConfig({
    publicDir: false,
    build: {
        outDir: 'public/preview',
        emptyOutDir: true,
        lib: {
            entry: 'resources/js/preview.jsx',
            name: 'VoyagePreview',
            formats: ['iife'],
            fileName: () => 'preview.js',
        },
        minify: true,
    },
    define: { 'process.env.NODE_ENV': '"production"' },
});
