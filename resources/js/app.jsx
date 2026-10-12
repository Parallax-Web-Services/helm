import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

const applicationPages = import.meta.glob('./Pages/*.jsx', { eager: true });
const modulePages = import.meta.glob('../../modules/*/resources/js/Pages/*.jsx', { eager: true });

function resolvePage(name) {
    const separator = name.indexOf('/');
    const page = separator === -1
        ? applicationPages['./Pages/' + name + '.jsx']
        : modulePages['../../modules/' + name.slice(0, separator) + '/resources/js/Pages/' + name.slice(separator + 1) + '.jsx'];

    if (!page) {
        throw new Error('Unknown Inertia page: ' + name);
    }

    return page.default;
}

createInertiaApp({
    title: (title) => `${title} · Zefram`,
    resolve: resolvePage,
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
