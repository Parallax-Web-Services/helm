/** The path part of a URL, without query, hash or trailing slash. */
export function pathOf(url) {
    const path = String(url ?? '/').split(/[?#]/)[0].replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]+/i, '');

    return path.replace(/\/+$/, '') || '/';
}

/** True when `url` is `prefix` itself or a page beneath it (/team matches /team/5, not /teams). */
export function matchesPrefix(url, prefix) {
    const path = pathOf(url);
    const base = pathOf(prefix);

    return base === '/' ? path === '/' : path === base || path.startsWith(`${base}/`);
}

/** Whether a navigation item ({ href, match? }) is the current page. */
export function isCurrentItem(url, item) {
    const prefixes = item.match?.length ? item.match : [item.href];

    return prefixes.some((prefix) => matchesPrefix(url, prefix));
}
