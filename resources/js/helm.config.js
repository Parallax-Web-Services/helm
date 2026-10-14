/*
 * Helm configuration: the one file you edit to brand and navigate your app.
 *
 *   brand       name, mark and accent colour for this app
 *   navigation  sidebar sections and links
 *   workspaces  the apps in your suite, listed in the app switcher
 */
import {
    BookOpenIcon,
    PencilSquareIcon,
    RocketLaunchIcon,
    UserGroupIcon,
    ViewfinderCircleIcon,
} from '@heroicons/react/20/solid';

export const brand = {
    // Must match this app's entry in `workspaces` below.
    key: 'helm',
    name: 'Helm',
    tagline: 'by Parallax',
    // A single-colour SVG or PNG. With tintMark it is filled with the accent;
    // set tintMark to false for a multi-colour logo.
    mark: '/helm/mark.svg',
    tintMark: true,
    // A preset (sky, violet, emerald, amber, coral, cyan, sand, rose, lime)
    // or any hex colour, such as '#ff6b9a'. Drives buttons, focus rings and
    // the active nav state, and tints the near-black surfaces.
    accent: 'sky',
    // Where the home icon in breadcrumbs points.
    home: '/dashboard',
};

/*
 * Sidebar sections. Each item: { label, href, icon, match?, auth?, external? }
 *   icon      a heroicon component (20/solid reads best at sidebar size)
 *   match     URL prefixes that mark the item current (defaults to href);
 *             '/team' matches /team and /team/5, but not /teams
 *   auth      true hides the item from signed-out visitors
 *   external  true renders a plain link, for pages outside this app
 */
export const navigation = [
    {
        title: 'Command deck',
        items: [
            { label: 'Bridge', href: '/dashboard', icon: ViewfinderCircleIcon, match: ['/dashboard'], auth: true },
            { label: 'Notes', href: '/notes', icon: PencilSquareIcon, match: ['/notes'] },
            { label: 'Team', href: '/team', icon: UserGroupIcon, match: ['/team'], auth: true },
        ],
    },
    {
        title: 'Learn',
        items: [
            { label: 'Maiden Voyage', href: '/voyage', icon: RocketLaunchIcon, match: ['/voyage'] },
            { label: 'Docs', href: '/docs', icon: BookOpenIcon, match: ['/docs'] },
        ],
    },
];

/*
 * Your suite. Every Helm app that signs in through the same Nexus server
 * shares one sign-in: list the sibling apps here and people can hop between
 * them from the app switcher without logging in again.
 *
 * To add a sibling app:
 *   1. Register it as an OAuth client in the same Nexus.
 *   2. Add an entry here: { key, name, description, href, accent, icon? }.
 *      `href` is its full URL; `icon` is optional (a heroicon or an image URL).
 *   3. Copy this list into each app's helm.config.js so every switcher matches.
 */
export const workspaces = [
    {
        key: 'helm',
        name: brand.name,
        description: 'The command deck you are on.',
        href: '/dashboard',
        accent: brand.accent,
    },
    {
        // Example sibling app: replace it with your own, or delete it.
        key: 'logbook',
        name: 'Logbook',
        description: 'Example sibling app. Swap in your own.',
        href: 'https://logbook.test/dashboard',
        accent: 'amber',
    },
];

export default { brand, navigation, workspaces };
