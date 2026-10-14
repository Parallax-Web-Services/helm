import React from 'react';
import clsx from 'clsx';
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/16/solid';
import { Link } from '../ui/Link.jsx';

const statusText = {
    done: 'Done: ',
    current: 'Next: ',
    upcoming: 'To do: ',
};

/**
 * Vertical checklist. Each step: { title, description?, done?, action?: { label, href, external? } }.
 * The first step that is not done is marked as the current one.
 */
export function Steps({ steps, label = 'Checklist', className }) {
    const currentIndex = steps.findIndex((step) => !step.done);

    return (
        <ol aria-label={label} className={clsx('relative', className)}>
            {steps.map((step, index) => {
                const status = step.done ? 'done' : index === currentIndex ? 'current' : 'upcoming';
                const last = index === steps.length - 1;

                return (
                    <li key={step.key ?? index} aria-current={status === 'current' ? 'step' : undefined} className="relative flex gap-4 pb-7 last:pb-0">
                        {!last && (
                            <span
                                aria-hidden="true"
                                className={clsx('absolute bottom-1.5 left-4 top-[2.6rem] w-px -translate-x-1/2', step.done ? 'bg-accent-400/50' : 'bg-white/10')}
                            />
                        )}
                        <span
                            aria-hidden="true"
                            className={clsx(
                                'relative grid size-8 shrink-0 place-items-center rounded-full border font-display text-xs',
                                status === 'done' && 'border-accent-400 bg-accent-400 text-accent-contrast',
                                status === 'current' && 'border-accent-400/70 bg-accent-400/10 text-accent-100 shadow-[0_0_18px_-2px_var(--helm-glow)]',
                                status === 'upcoming' && 'border-white/12 bg-white/[0.03] text-slate-500',
                            )}
                        >
                            {step.done ? <CheckIcon className="size-4" /> : index + 1}
                        </span>
                        <div className="min-w-0 flex-1 pt-1">
                            <p className={clsx('text-sm/6 font-semibold', status === 'upcoming' ? 'text-slate-300' : 'text-white')}>
                                <span className="sr-only">{statusText[status]}</span>
                                {step.title}
                            </p>
                            {step.description && <div className="mt-1 text-sm/6 text-slate-400">{step.description}</div>}
                            {step.action && !step.done && (
                                <Link
                                    href={step.action.href}
                                    external={step.action.external}
                                    className="mt-2 inline-flex items-center gap-1.5 rounded text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-200 transition hover:text-accent-100 focus-ring"
                                >
                                    {step.action.label}
                                    <ArrowRightIcon aria-hidden="true" className="size-3.5" />
                                </Link>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}

export default Steps;
