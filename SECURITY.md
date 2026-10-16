# Security policy

Security issues should not be posted in public GitHub issues, discussions or pull requests.

## Report a vulnerability

1. Visit this repository's **Security** tab and choose **Report a vulnerability** if GitHub private vulnerability reporting is enabled.
2. If that option is not available, open a **public issue requesting a private reporting channel**, without including vulnerability details, proof-of-concept code, credentials or affected-user information. A maintainer can arrange a private handoff.

Include enough information in a private report to reproduce the problem: the affected commit/version, environment, steps to reproduce, expected and actual behavior, and potential impact. Redact secrets and personal data.

## Scope and expectations

HELM is an open-source starter. Treat authentication, OAuth callbacks, team authorization and deployment configuration as security-sensitive. The local demo sign-in must never be enabled outside `APP_ENV=local`.

There is no published security response-time or long-term maintenance guarantee. Supported versions and the preferred private reporting channel should be clarified by maintainers before the first tagged release.

For non-security bugs, use a regular issue.
