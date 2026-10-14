import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { usePage } from '@inertiajs/react';
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/20/solid';

const kinds = {
    success: {
        icon: CheckCircleIcon,
        role: 'status',
        classes: 'border-emerald-300/25 bg-emerald-400/[0.08] text-emerald-50',
        iconClasses: 'text-emerald-300',
    },
    error: {
        icon: ExclamationTriangleIcon,
        role: 'alert',
        classes: 'border-rose-400/30 bg-rose-500/[0.09] text-rose-50',
        iconClasses: 'text-rose-300',
    },
};

/** Banners for the shared `flash.success` / `flash.error` props, dismissible until the next visit. */
export function FlashMessages({ className }) {
    const { flash } = usePage().props;
    const [dismissed, setDismissed] = useState({});

    useEffect(() => setDismissed({}), [flash]);

    const messages = Object.keys(kinds)
        .map((kind) => [kind, flash?.[kind]])
        .filter(([kind, message]) => message && !dismissed[kind]);

    return (
        <div aria-live="polite" className={clsx('grid gap-3', messages.length > 0 && className)}>
            {messages.map(([kind, message]) => {
                const { icon: Icon, role, classes, iconClasses } = kinds[kind];

                return (
                    <div key={kind} role={role} className={clsx('flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm/6', classes)}>
                        <Icon aria-hidden="true" className={clsx('mt-0.5 size-5 shrink-0', iconClasses)} />
                        <p className="min-w-0 flex-1">{message}</p>
                        <button
                            type="button"
                            onClick={() => setDismissed((current) => ({ ...current, [kind]: true }))}
                            className="-mr-1 rounded-lg p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100 focus-ring"
                        >
                            <XMarkIcon aria-hidden="true" className="size-4" />
                            <span className="sr-only">Dismiss</span>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default FlashMessages;
