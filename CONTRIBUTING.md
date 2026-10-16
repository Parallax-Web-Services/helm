# Contributing to HELM

Thanks for helping improve HELM by Parallax. HELM is an MIT-licensed Laravel starter and component collection drawn from the application UI work behind Slipstream and Continuum. You can use it without adopting other Parallax products.

## Start with a local checkout

Use PHP 8.4+, Composer, Node.js 24 and npm. On a new checkout:

```sh
composer run setup
composer run dev
```

Visit the app URL from `.env` (normally `http://localhost:8000`). Choose **Local dev sign-in** to explore the dashboard and sample team without running NEXUS. This sign-in route is available only with `APP_ENV=local`; it is not a production authentication option.

For a shared sign-in across applications, follow [the HELM + NEXUS integration guide](docs/INTEGRATION.md).

## Where to contribute

- **Interface and components:** `resources/js/Helm/ui`, `resources/js/Helm/deck` and `resources/js/Helm/shell`.
- **Application composition:** `resources/js/helm.config.js`, `resources/js/Pages` and `resources/js/Layouts`.
- **Documentation and onboarding:** `README.md` and `docs/`.
- **Authentication, synchronization and teams:** look at `tests/Feature` before changing behavior.

Please open an issue for significant interface or integration changes so contributors can discuss the expected behavior first. Small fixes and documentation improvements can be proposed directly as pull requests. Do not add new product dependencies or require a Parallax account without discussing the impact.

## Validate your changes

```sh
composer run test
npm run test:js
npm run build
```

For PHP changes, also run Pint on the changed files where appropriate. Note any checks you could not run, and why.

A useful pull request explains **the problem**, **the change**, **how it was tested**, and **any screenshots or recordings** that make UI differences easy to review. For accessibility-sensitive components, check keyboard navigation, focus states and reduced-motion behavior. Avoid committing generated bundles, secrets, customer data or real OAuth client credentials.

## Security and conduct

See [SECURITY.md](SECURITY.md) to report security vulnerabilities privately; do **not** disclose exploit details in a public issue.

Be constructive and respectful with other contributors. Report abusive behavior through GitHub's moderation/reporting mechanisms. Maintainers may close off-topic or abusive discussions. The [MIT license](LICENSE) applies to source code, not to the separately reserved Parallax and HELM names and logos.
