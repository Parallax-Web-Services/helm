import React from 'react';
import clsx from 'clsx';
import { Checkbox as HeadlessCheckbox, Description, Field, Label } from '@headlessui/react';
import { CheckIcon, MinusIcon } from '@heroicons/react/16/solid';

/**
 * Checkbox on Headless UI (Space toggles it; `name` submits it with a form).
 * Give it `label` (and optionally `hint`) for a ready-made labelled row,
 * or label it yourself with aria-label.
 */
export function Checkbox({ label, hint, className, ...props }) {
    const box = (
        <HeadlessCheckbox
            className={clsx(
                'group mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-white/20 bg-black/25 transition focus-ring',
                'hover:border-white/35 data-checked:border-accent-400 data-checked:bg-accent-400',
                'data-indeterminate:border-accent-400 data-indeterminate:bg-accent-400',
                'data-disabled:cursor-not-allowed data-disabled:opacity-50',
                !label && className,
            )}
            {...props}
        >
            <CheckIcon aria-hidden="true" className="size-3.5 text-accent-contrast opacity-0 group-data-checked:opacity-100 group-data-indeterminate:hidden" />
            <MinusIcon aria-hidden="true" className="hidden size-3.5 text-accent-contrast group-data-indeterminate:block" />
        </HeadlessCheckbox>
    );

    if (!label) {
        return box;
    }

    return (
        <Field className={clsx('flex items-start gap-3', className)}>
            {box}
            <span className="grid gap-0.5">
                <Label className="cursor-pointer text-sm text-slate-200 data-disabled:opacity-50">{label}</Label>
                {hint && <Description className="text-xs/5 text-slate-400">{hint}</Description>}
            </span>
        </Field>
    );
}

export default Checkbox;
