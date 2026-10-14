import React from 'react';
import clsx from 'clsx';
import { Head, usePage } from '@inertiajs/react';
import { brand, navigation, workspaces } from '../helm.config.js';
import { useAccent } from '../Helm/theme.js';
import { Eyebrow } from '../Helm/deck/Eyebrow.jsx';
import { AppShell } from '../Helm/shell/AppShell.jsx';
import { BrandMark } from '../Helm/shell/BrandMark.jsx';
import { Breadcrumbs } from '../Helm/shell/Breadcrumbs.jsx';
import { FlashMessages } from '../Helm/shell/FlashMessages.jsx';
import { isCurrentItem } from '../Helm/shell/navigation.js';
import { Sidebar, SidebarItem, SidebarSection } from '../Helm/shell/Sidebar.jsx';
import { Tabs } from '../Helm/shell/Tabs.jsx';
import { TeamSwitcher } from '../Helm/shell/TeamSwitcher.jsx';
import { UserMenu } from '../Helm/shell/UserMenu.jsx';
import { WorkspaceSwitcher } from '../Helm/shell/WorkspaceSwitcher.jsx';
import { Heading } from '../Helm/ui/Heading.jsx';
import { Link } from '../Helm/ui/Link.jsx';
import { Text } from '../Helm/ui/Text.jsx';

const widths = {
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-none',
};

/**
 * The Helm page frame: sidebar navigation from helm.config.js, suite and
 * team switchers, user menu, flash messages and a page header.
 *
 *   title        document title, and the page heading unless `heading` is given
 *   heading      visible heading (string or node); false hides the header
 *   eyebrow      kicker above the heading
 *   description  line under the heading
 *   actions      buttons on the right of the header
 *   breadcrumbs  [{ label, href? }], the last one being this page
 *   tabs         [{ label, href, count? }] sub-navigation under the header
 *   width        3xl | 4xl | 5xl | 6xl | 7xl | full
 *   accent       override the brand accent on this page
 */
export default function HelmLayout({
    title,
    heading,
    eyebrow,
    description,
    actions,
    breadcrumbs = [],
    tabs = [],
    width = '6xl',
    accent,
    children,
}) {
    const { url, props } = usePage();
    const signedIn = Boolean(props.auth?.user);
    useAccent(accent ?? brand.accent);

    const sections = navigation
        .map((section) => ({ ...section, items: section.items.filter((item) => signedIn || !item.auth) }))
        .filter((section) => section.items.length > 0);

    const sidebar = (
        <Sidebar
            header={(
                <>
                    <WorkspaceSwitcher brand={brand} workspaces={workspaces} />
                    <TeamSwitcher />
                </>
            )}
            footer={<UserMenu variant="sidebar" />}
        >
            {sections.map((section) => (
                <SidebarSection key={section.title} title={section.title}>
                    {section.items.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            external={item.external}
                            badge={item.badge}
                            current={isCurrentItem(url, item)}
                        >
                            {item.label}
                        </SidebarItem>
                    ))}
                </SidebarSection>
            ))}
        </Sidebar>
    );

    const homeCrumb = { label: brand.name, href: brand.home ?? '/' };
    const topbar = (
        <>
            <Link
                href={signedIn ? homeCrumb.href : '/'}
                className="flex min-w-0 items-center gap-2.5 rounded-lg focus-ring lg:hidden"
            >
                <BrandMark src={brand.mark} tint={brand.tintMark !== false} className="size-6" />
                <span className="truncate font-display text-xs font-semibold uppercase tracking-[0.22em] text-white">{brand.name}</span>
            </Link>
            {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} home={homeCrumb} className="max-lg:hidden" />}
            <div className="ml-auto lg:hidden">
                <UserMenu variant="compact" />
            </div>
        </>
    );

    const visibleHeading = heading === undefined ? title : heading;
    const showHeader = heading !== false && Boolean(visibleHeading || eyebrow || description || actions);

    return (
        <>
            {title && <Head title={title} />}
            <AppShell sidebar={sidebar} topbar={topbar} topbarOnDesktop={breadcrumbs.length > 0}>
                <div className={clsx('helm-adopt mx-auto w-full px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pt-10', widths[width] ?? widths['6xl'])}>
                    {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} home={homeCrumb} className="mb-5 lg:hidden" />}
                    <FlashMessages className="mb-6" />
                    {showHeader && (
                        <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
                            <div className="min-w-0 max-w-3xl">
                                {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
                                {visibleHeading && <Heading>{visibleHeading}</Heading>}
                                {description && <Text className="mt-3 max-w-2xl">{description}</Text>}
                            </div>
                            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                        </header>
                    )}
                    {tabs.length > 0 && <Tabs tabs={tabs} className="mb-8" />}
                    {children}
                </div>
            </AppShell>
        </>
    );
}
