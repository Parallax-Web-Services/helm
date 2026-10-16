# HELM showcase capture guide

The most convincing way to introduce HELM is to show a real running checkout, not a generated mockup. Use a fresh local demo account and avoid screenshots containing production or customer information.

## Capture a genuine walkthrough

1. Install HELM using [the README](../README.md#get-started), launch it locally, and select **Local dev sign-in**.
2. Record the **dashboard/Bridge** screen and its navigation shell at desktop width.
3. Open the **team switcher** and **workspace switcher**. The default `Logbook` sibling entry is a placeholder URL; **do not portray it as a deployed app**.
4. Show real component states (panels, stats, forms or empty states). Switch between desktop and narrow/mobile widths to show the responsive drawer.
5. Open `resources/js/helm.config.js`, change the brand name or accent in a development checkout, and show the result.
6. End on the GitHub repository URL and the invitation to use, fork or contribute.

The walkthrough should be 45–90 seconds, with minimal promotional copy. Add a still screenshot of the actual dashboard to the README once captured. Make the social preview image show the interface clearly.

## Suggested first screenshots

- 16:9 dashboard in a clean demo state.
- Narrow layout with the drawer open.
- Workspace switcher and team switcher, using only demonstrative accounts.
- Reusable deck components on an actual rendered page.

## Before publishing

Verify the captured state against the repository branch being announced; check for account names, access tokens, hostnames, emails, browser notifications and irrelevant sample links. Provide captions/alt text and a reduced-motion option for any animated demonstration.
