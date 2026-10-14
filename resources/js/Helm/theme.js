import { useLayoutEffect } from 'react';

/**
 * Accent presets. Each is the "400" step of a scale; resources/css/app.css
 * derives the rest of the scale (50–950), the glow and the tinted near-black
 * surfaces from it. Any hex colour works too: accent: '#ff6b9a'.
 */
export const ACCENTS = {
    sky: '#73bbff',
    violet: '#a78bfa',
    emerald: '#34d399',
    amber: '#fbbf24',
    coral: '#ff967d',
    cyan: '#5fd4ec',
    sand: '#d6a37a',
    rose: '#fb7185',
    lime: '#a3e635',
};

export const DEFAULT_ACCENT = 'sky';

const DARK_INK = '#04101d';
const LIGHT_INK = '#ffffff';

/** Resolve a preset name or a CSS colour to the colour used as accent-400. */
export function accentColor(accent) {
    if (typeof accent !== 'string' || accent.trim() === '') {
        return ACCENTS[DEFAULT_ACCENT];
    }

    return ACCENTS[accent] ?? accent.trim();
}

function channelsOf(hex) {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);

    if (!match) {
        return null;
    }

    const digits = match[1].length === 3
        ? match[1].split('').map((digit) => digit + digit).join('')
        : match[1];

    return [0, 2, 4].map((offset) => parseInt(digits.slice(offset, offset + 2), 16) / 255);
}

function relativeLuminance(channels) {
    const [red, green, blue] = channels.map((channel) => (
        channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    ));

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * Pick the text colour that reads best on a solid accent fill (WCAG contrast).
 * Non-hex colours fall back to dark ink, which suits the light accents Helm favours.
 */
export function accentContrast(accent) {
    const channels = channelsOf(accentColor(accent));

    if (!channels) {
        return DARK_INK;
    }

    const luminance = relativeLuminance(channels);
    const againstWhite = 1.05 / (luminance + 0.05);
    const againstInk = (luminance + 0.05) / (relativeLuminance(channelsOf(DARK_INK)) + 0.05);

    return againstInk >= againstWhite ? DARK_INK : LIGHT_INK;
}

/**
 * Inline style that re-themes one subtree. Pair it with the
 * `helm-accent-scope` class so the derived scale is recalculated there.
 */
export function accentStyle(accent) {
    return {
        '--helm-accent-400': accentColor(accent),
        '--helm-accent-contrast': accentContrast(accent),
    };
}

/** Apply an accent to the whole document (or another element). */
export function applyAccent(accent, element = typeof document === 'undefined' ? null : document.documentElement) {
    if (!element) {
        return;
    }

    for (const [property, value] of Object.entries(accentStyle(accent))) {
        element.style.setProperty(property, value);
    }

    element.dataset.accent = typeof accent === 'string' && ACCENTS[accent] ? accent : 'custom';
}

/** Keep the document accent in sync with a component's accent before paint. */
export function useAccent(accent) {
    useLayoutEffect(() => {
        applyAccent(accent);
    }, [accent]);
}
