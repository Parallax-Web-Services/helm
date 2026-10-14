import React from 'react';
import clsx from 'clsx';
import { Input } from '@headlessui/react';
import { controlClasses } from './control.js';
import { useFieldState } from './Field.jsx';

/** Single-line text control. `icon` adds a leading heroicon. */
export function TextInput({ type = 'text', invalid, icon: Icon, className, ...props }) {
    const field = useFieldState();
    const input = (
        <Input
            type={type}
            invalid={invalid ?? field.invalid}
            className={clsx(controlClasses, Icon && 'pl-10', !Icon && className)}
            {...props}
        />
    );

    if (!Icon) {
        return input;
    }

    return (
        <span className={clsx('relative block', className)}>
            <Icon aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-slate-500" />
            {input}
        </span>
    );
}

export default TextInput;
