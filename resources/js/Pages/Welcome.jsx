import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowRightEndOnRectangleIcon, BookOpenIcon, RocketLaunchIcon } from '@heroicons/react/20/solid';
import { brand, workspaces } from '../helm.config.js';
import { accentStyle, useAccent } from '../Helm/theme.js';
import { Card } from '../Helm/deck/Card.jsx';
import { Eyebrow } from '../Helm/deck/Eyebrow.jsx';
import { Panel } from '../Helm/deck/Panel.jsx';
import { BrandMark } from '../Helm/shell/BrandMark.jsx';
import { FlashMessages } from '../Helm/shell/FlashMessages.jsx';
import { Button } from '../Helm/ui/Button.jsx';
import { Link } from '../Helm/ui/Link.jsx';
import { Code, Text } from '../Helm/ui/Text.jsx';

function DevLogin() {
    const [processing, setProcessing] = useState(false);
    const [failed, setFailed] = useState(false);

    function submit(event) {
        event.preventDefault();
        router.post('/dev/login', {}, {
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onError: () => setFailed(true),
        });
    }

    return (
        <Card className="mt-8 max-w-md border-dashed bg-black/20">
            <Eyebrow className="text-slate-400">Local dev sign-in</Eyebrow>
            <Text className="mt-2">
                Explore without a running Nexus as a demo operator with a seeded crew. Only shown while <Code>APP_ENV=local</Code>.
            </Text>
            <form onSubmit={submit} className="mt-4">
                <Button type="submit" variant="outline" tone="neutral" loading={processing}>
                    Sign in as demo operator
                </Button>
                {failed && <p role="alert" className="mt-3 text-xs text-rose-300">Local sign-in failed. Check the server log.</p>}
            </form>
        </Card>
    );
}

export default function Welcome() {
    const { nexus, devLogin } = usePage().props;
    useAccent(brand.accent);

    return (
        <>
            <Head title="Welcome" />
            <div className="helm relative isolate flex min-h-dvh flex-col overflow-hidden bg-deck text-slate-200">
                <div aria-hidden="true" className="helm-ambient pointer-events-none absolute inset-0 -z-10" />
                <div aria-hidden="true" className="helm-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />

                <header className="px-4 py-5 sm:px-6">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                        <span className="flex items-center gap-3">
                            <BrandMark src={brand.mark} tint={brand.tintMark !== false} className="size-8" />
                            <span className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-white">{brand.name}</span>
                        </span>
                        <nav aria-label="Learn" className="flex items-center gap-1 text-sm">
                            <Link href="/voyage" className="rounded-lg px-3 py-2 text-slate-400 transition hover:text-white focus-ring">
                                <span className="sm:hidden">Tour</span>
                                <span className="max-sm:hidden">Maiden Voyage</span>
                            </Link>
                            <Link href="/docs" className="rounded-lg px-3 py-2 text-slate-400 transition hover:text-white focus-ring">Docs</Link>
                        </nav>
                    </div>
                </header>

                <main className="flex flex-1 items-center px-4 py-10 sm:px-6 sm:py-16">
                    <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
                        <div>
                            <FlashMessages className="mb-8 max-w-xl" />
                            <Eyebrow live>{brand.name} {brand.tagline}</Eyebrow>
                            <h1 className="mt-5 max-w-xl font-display text-3xl/tight tracking-[0.06em] text-balance text-white sm:text-5xl/tight">
                                The command deck for your Laravel apps.
                            </h1>
                            <p className="mt-5 max-w-lg text-base/7 text-slate-300 sm:text-lg/8">
                                One sign-in across all of them, through Nexus.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Button href="/login" external size="lg" icon={ArrowRightEndOnRectangleIcon}>
                                    Sign in with Nexus
                                </Button>
                                <Button href="/voyage" variant="ghost" tone="neutral" size="lg" icon={RocketLaunchIcon}>
                                    Take the tour
                                </Button>
                            </div>
                            {!nexus?.url && (
                                <Text className="mt-4 max-w-md" tone="subtle">
                                    Nexus isn&apos;t connected yet. Set <Code>NEXUS_URL</Code> in <Code>.env</Code> to turn on sign-in.
                                </Text>
                            )}
                            {devLogin && <DevLogin />}
                        </div>

                        <Panel aria-labelledby="suite-title" className="max-lg:hidden">
                            <Eyebrow as="h2" id="suite-title">Your suite</Eyebrow>
                            <p className="mt-3 text-sm/6 text-slate-400">
                                Every app here signs in through the same Nexus. Sign in once, then hop between them from the app switcher.
                            </p>
                            <ul role="list" className="mt-6 grid gap-3">
                                {workspaces.map((app) => (
                                    <li key={app.key} className="helm-accent-scope" style={accentStyle(app.accent)}>
                                        <Card className="flex items-center gap-4 p-4">
                                            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-accent-400/30 bg-accent-400/10 font-display text-sm text-accent-200 shadow-[0_0_24px_-8px_var(--helm-glow)]">
                                                {app.key === brand.key
                                                    ? <BrandMark src={brand.mark} tint={brand.tintMark !== false} className="size-6" />
                                                    : <span aria-hidden="true">{app.name.slice(0, 1)}</span>}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block text-sm font-semibold text-white">{app.name}</span>
                                                {app.description && <span className="block truncate text-xs text-slate-400">{app.description}</span>}
                                            </span>
                                        </Card>
                                    </li>
                                ))}
                                <li className="flex items-center gap-3 px-1 pt-1 text-xs text-slate-500">
                                    <BookOpenIcon aria-hidden="true" className="size-4" />
                                    Add sibling apps in <Code>resources/js/helm.config.js</Code>
                                </li>
                            </ul>
                        </Panel>
                    </div>
                </main>

                <footer className="px-4 py-6 sm:px-6">
                    <p className="mx-auto max-w-6xl text-xs text-slate-500">{brand.name} is MIT licensed and built on Zefram.</p>
                </footer>
            </div>
        </>
    );
}
