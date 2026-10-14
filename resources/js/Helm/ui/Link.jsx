import React from 'react';
import { Link as InertiaLink } from '@inertiajs/react';

const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

// Visit options that only mean something to Inertia; dropped for plain anchors.
const INERTIA_ONLY = [
    'method', 'data', 'replace', 'preserveScroll', 'preserveState', 'preserveUrl', 'only', 'except',
    'headers', 'queryStringArrayFormat', 'async', 'prefetch', 'cacheFor', 'cacheTags', 'viewTransition',
    'onBefore', 'onStart', 'onProgress', 'onFinish', 'onCancel', 'onSuccess', 'onError', 'onCancelToken',
];

/**
 * True when a URL leaves this app: another origin, or a non-http scheme such
 * as mailto:. Absolute URLs on this origin (Laravel paginator links) stay internal.
 */
export function isExternalHref(href) {
    if (typeof href !== 'string') {
        return false;
    }

    if (!href.startsWith('//') && !SCHEME.test(href)) {
        return false;
    }

    if (typeof window === 'undefined') {
        return true;
    }

    try {
        const url = new URL(href, window.location.href);

        return url.origin !== window.location.origin || !/^https?:$/.test(url.protocol);
    } catch {
        return true;
    }
}

/**
 * Inertia-aware link. Renders an Inertia <Link> for in-app pages and a plain
 * <a> for other origins, or whenever `external` is set. Use `external` for
 * routes the server redirects off-site, such as /login, /logout and /account.
 */
export function Link({ href, external = false, ref, ...props }) {
    if (external || isExternalHref(href)) {
        const anchorProps = { ...props };
        INERTIA_ONLY.forEach((key) => delete anchorProps[key]);

        return <a ref={ref} href={href} {...anchorProps} />;
    }

    return <InertiaLink ref={ref} href={href} {...props} />;
}

export default Link;
