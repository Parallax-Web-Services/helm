import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

const pages = import.meta.glob('./Pages/*.jsx', { eager: true });

createInertiaApp({
    title: (title) => `${title} · Zefram`,
    resolve: (name) => pages[`./Pages/${name}.jsx`].default,
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
