import React from 'react';
import clsx from 'clsx';
import { Select as HeadlessSelect } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/16/solid';
import { controlClasses } from './control.js';
import { useFieldState } from './Field.jsx';

/** Native <select>, styled for the deck. Pass <option> children as usual. */
export function Select({ invalid, className, children, ...props }) {
    const field = useFieldState();

    return (
        <span className={clsx('relative block', className)}>
            <HeadlessSelect
                invalid={invalid ?? field.invalid}
                className={clsx(controlClasses, 'appearance-none pr-10 [&_optgroup]:bg-deck-panel [&_option]:bg-deck-panel')}
                {...props}
            >
                {children}
            </HeadlessSelect>
            <ChevronUpDownIcon aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        </span>
    );
}

export default Select;
