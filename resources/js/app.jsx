import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { brand } from './helm.config.js';
import { applyAccent } from './Helm/theme.js';

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

// Paint the brand accent before the first page renders.
applyAccent(brand.accent);

createInertiaApp({
    title: (title) => (title ? `${title} · ${brand.name}` : brand.name),
    resolve: resolvePage,
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
