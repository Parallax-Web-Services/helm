import React from 'react';
import clsx from 'clsx';
import { Description, Field, Label, Switch } from '@headlessui/react';

/**
 * On/off switch on Headless UI. Controlled with `checked` + `onChange`,
 * or uncontrolled with `defaultChecked`; `name` submits it with a form.
 */
export function Toggle({ label, hint, className, ...props }) {
    const toggle = (
        <Switch
            className={clsx(
                'group relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-white/12 bg-white/10 p-0.5 transition focus-ring',
                'data-checked:border-accent-300/60 data-checked:bg-accent-400 data-disabled:cursor-not-allowed data-disabled:opacity-50',
                !label && className,
            )}
            {...props}
        >
            <span
                aria-hidden="true"
                className="size-4.5 rounded-full bg-slate-200 shadow-sm transition group-data-checked:translate-x-5 group-data-checked:bg-white"
            />
        </Switch>
    );

    if (!label) {
        return toggle;
    }

    return (
        <Field className={clsx('flex items-start justify-between gap-4', className)}>
            <span className="grid gap-0.5">
                <Label className="text-sm text-slate-200 data-disabled:opacity-50">{label}</Label>
                {hint && <Description className="text-xs/5 text-slate-400">{hint}</Description>}
            </span>
            {toggle}
        </Field>
    );
}

export default Toggle;
