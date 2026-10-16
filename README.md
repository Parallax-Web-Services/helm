<p align="center">
  <img src="public/helm/mark.svg" width="72" alt="">
</p>

# HELM

**The command deck for your Laravel apps. One sign-in across all of them, through Nexus.**

Helm by Parallax is the dashboard pattern Parallax builds its own apps with, released as an open-source starter app. You get a dark command-deck shell, a set of UI components, and sign-in through [Nexus](https://github.com/Parallax-Web-Services/nexus), Parallax's open-source accounts server. Build one app with it, or a whole suite that shares one account, one team list and one sign-in.

Helm is a [ZEFRAM](https://github.com/Parallax-Web-Services/zefram) edition: **LARAVEL 13**, **INERTIA 3**, **REACT 19**, **TAILWIND 4** and **VITE 8**, with ZEFRAM's modules, SLIPSTREAM kits and Maiden Voyage included.

## Why we're sharing this

HELM grew out of interface work for Parallax's Slipstream and Continuum products. We're releasing the reusable command-deck patterns so developers can build on them without needing a commercial Parallax account or adopting the full platform.

**Start with HELM alone:** local demo sign-in lets you explore the interface. **Add NEXUS later:** self-host the shared accounts and team layer when you need a suite of applications.

## What's included

- **The shell**: a sidebar that becomes a drawer on small screens, a top bar, breadcrumbs, tabs and flash messages.
- **Team switcher and app switcher**: switch the team you're looking at, or hop to a sibling app in your suite. Each app has its own accent colour.
- **Deck components**: panels, cards, stats, eyebrows, empty states and a spinner, in the command-deck style.
- **UI primitives**: buttons, form fields, menus, modals, tables and pagination, built on [Headless UI](https://headlessui.com) for keyboard support and accessibility.
- **Nexus sign-in**: OAuth 2.0 through Nexus. Helm keeps a local copy of each account and its teams, and refreshes it while people work.
- **Local dev sign-in**: explore a fresh checkout with a demo account and crew before you run Nexus.
- **Everything from ZEFRAM**: the Notes module, SLIPSTREAM kits, Maiden Voyage at `/voyage` and local docs at `/docs`.

## Get started

You'll need **PHP 8.4 or newer**, **COMPOSER**, **NODE.JS 24** and **NPM**.

```sh
git clone https://github.com/Parallax-Web-Services/helm.git my-app
cd my-app
composer run setup
php artisan serve
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) and choose **Local dev sign-in**. It signs you in as a demo account with a small team, so every page has something to show. Local dev sign-in only exists when `APP_ENV=local`.

For ongoing development, run `composer run dev` instead of `php artisan serve`.

## Explore the interface

After [local setup](#get-started), try `/dashboard` for the command deck, `/team` for team context, `/voyage` for Maiden Voyage and `/docs` for local documentation. `resources/js/helm.config.js` controls branding, navigation and workspace links.

For a genuine UI recording and screenshot checklist, see [the showcase capture guide](docs/DEMO.md). We prefer real application screenshots to rendered promotional mockups.

## Connect Nexus

Nexus owns accounts, teams and billing. Helm is one of its OAuth clients.

1. Run Nexus. Its README covers local setup. Locally, serve it on a different hostname from Helm so the two apps don't share cookies, for example `php artisan serve --host=localhost --port=8001`.
2. In Nexus, register Helm as a client, with the redirect URL `http://127.0.0.1:8000/oauth/callback` (your Helm `APP_URL` followed by `/oauth/callback`):

   ```sh
   php artisan passport:client
   ```

3. In Helm's `.env`, set:

   ```sh
   APP_URL=http://127.0.0.1:8000
   NEXUS_URL=http://localhost:8001
   OAUTH_CLIENT_ID=<client id from Nexus>
   OAUTH_CLIENT_SECRET=<client secret from Nexus>
   ```

**Sign in with Nexus** now sends people to Nexus and back. Signing out of Helm also signs out of Nexus. The Account, Team and Billing links in the shell open the matching Nexus pages.

### How sign-in works

- Nexus authenticates people. Helm never stores passwords.
- On sign-in, Helm copies the account and its teams from Nexus's `/api/me` into its own `users`, `teams` and `team_user` tables, using the same ids as Nexus.
- While someone is signed in, Helm pulls `/api/me` again once its copy is older than `NEXUS_SYNC_INTERVAL` seconds (default 60). Teams created or changed in Nexus show up without signing out. If Nexus is unreachable, Helm keeps working and tries again later.
- Switching teams in Helm changes only which team you're looking at in this session. Membership and the account's default team stay in Nexus.

## Make it yours

Most changes start in one file, `resources/js/helm.config.js`:

- `brand`: your app's name, mark and accent colour.
- `navigation`: sidebar sections and links.
- `workspaces`: the apps in your suite, for the app switcher.

Pages live in `resources/js/Pages` and use the Helm layout:

```jsx
import HelmLayout from '../Layouts/HelmLayout.jsx';
import { Panel } from '../Helm/deck/Panel.jsx';
import { Stat } from '../Helm/deck/Stat.jsx';

export default function Reports({ total }) {
    return (
        <HelmLayout title="Reports">
            <Panel>
                <Stat label="Reports filed" value={total} />
            </Panel>
        </HelmLayout>
    );
}
```

The components are in `resources/js/Helm`: `ui` for primitives, `deck` for the command-deck pieces and `shell` for the layout. They're your code. Edit them freely.

## Build a suite

Helm is designed for several apps that share one Nexus:

1. Start each app from Helm and give it its own `brand` and accent in `helm.config.js`.
2. Register each app as a separate client in Nexus, with its own redirect URL.
3. List every app in each app's `workspaces`.

People sign in once at Nexus. The app switcher takes them between apps, and every app sees the same accounts and teams.

## Built on ZEFRAM

Helm keeps ZEFRAM's tools for growing an app:

| Path | What you'll find |
| --- | --- |
| `/voyage` | Maiden Voyage, ZEFRAM's guided first app |
| `/notes` | The Notes module |
| `/docs` | Getting started, modules and SLIPSTREAM kits |

To generate a module with a SLIPSTREAM kit, see `/docs/slipstream-kits` or the [ZEFRAM README](https://github.com/Parallax-Web-Services/zefram#make-your-first-module). To install without COMPOSER or NPM, use [ARCHER](https://archer.zefram.tech).

## Development checks

```sh
composer run test
npm run test:js
npm run build
```

## Contributing

Issues and pull requests are welcome. Follow the [contributor guide](CONTRIBUTING.md) for local setup, test commands and how to submit UI changes. For vulnerabilities, use the private reporting instructions in [SECURITY.md](SECURITY.md).

A working two-app setup is documented in [the HELM + NEXUS integration guide](docs/INTEGRATION.md).

## License

Helm is open-source software licensed under the [MIT license](LICENSE).

The names and logos for Helm by Parallax, Parallax, ZEFRAM and Nexus are not covered by the MIT license. Helm by Parallax is not affiliated with Helm, the Kubernetes package manager, which is a trademark of The Linux Foundation.
