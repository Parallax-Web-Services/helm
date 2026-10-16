# Connect HELM to NEXUS

HELM runs on its own with local development sign-in. To share accounts and teams across separate applications, run a self-hosted [NEXUS](https://github.com/Parallax-Web-Services/nexus) instance and configure each application as its own OAuth 2.0 client.

The example below uses **different hostnames for browser cookies**, not merely different ports.

## 1. Start NEXUS

Use the [NEXUS local setup instructions](https://github.com/Parallax-Web-Services/nexus#local-setup). NEXUS currently requires PHP 8.5 and Node.js 24.

In NEXUS's `.env`:

```dotenv
APP_URL=http://localhost:8001
```

Run it with a matching hostname and port:

```sh
php artisan serve --host=localhost --port=8001
```

Register an account at `http://localhost:8001/register`. This is your development NEXUS account, not a default shared user.

## 2. Register an OAuth client

From the NEXUS project directory:

```sh
php artisan passport:client --name="HELM" --redirect_uri="http://127.0.0.1:8000/oauth/callback"
```

Create a confidential authorization-code client (not a personal-access client). Save the client ID and client secret somewhere private. Every additional application/environment needs its own exact redirect URL and registered client.

## 3. Configure HELM

From your HELM checkout, run `composer run setup` if you have not already. In its `.env`:

```dotenv
APP_URL=http://127.0.0.1:8000
NEXUS_URL=http://localhost:8001
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
NEXUS_SYNC_INTERVAL=60
```

Then start HELM:

```sh
php artisan serve --host=127.0.0.1 --port=8000
```

Use `composer run dev` for everyday frontend development as documented in the README, rather than running two development servers for the same application.

## 4. Verify the flow

1. Visit `http://127.0.0.1:8000` and choose **Sign in with Nexus**.
2. Authenticate on NEXUS and return to HELM's dashboard.
3. Check the team switcher. HELM caches the signed-in account and teams from NEXUS's `GET /api/me` endpoint and refreshes them periodically.
4. Register another HELM-based app with a different callback URL, update each app's `resources/js/helm.config.js` `workspaces` array, and try the app switcher.

The workspace switcher is navigation, **not an automatic app registry**. Changing the selected team in HELM changes local session context; membership is still managed by NEXUS.

## Production boundaries

- Use HTTPS, exact redirect URLs, and distinct OAuth credentials for each deployment.
- Keep `OAUTH_CLIENT_SECRET` server-side and out of source control.
- Local development sign-in is intentionally limited to `APP_ENV=local`.
- NEXUS does not currently promise OpenID Connect discovery or ID tokens. HELM's `/api/me` integration is not a general-purpose OIDC implementation.
- Stripe billing is optional and requires separate operator configuration; the sample setup does not create live billing plans.

For troubleshooting, compare the configured `APP_URL` and `NEXUS_URL` to the actual hostnames and ports, confirm the Passport callback registration, and check each app's logs without publishing credentials.
