import React, { createContext, useContext } from 'react';
import clsx from 'clsx';
import { Description, Field as HeadlessField, Label as HeadlessLabel } from '@headlessui/react';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';

const FieldState = createContext({ invalid: false, error: null });

/** The error state of the surrounding <Field>, for custom controls. */
export function useFieldState() {
    return useContext(FieldState);
}

/**
 * Groups a label, a control, a hint and an error. Headless UI wires the ids:
 * the control is labelled by <Label> and described by <Hint> and <FieldError>.
 * Pass `error` (a message or null) to mark the control invalid.
 */
export function Field({ error = null, disabled = false, className, children, ...props }) {
    return (
        <FieldState.Provider value={{ invalid: Boolean(error), error }}>
            <HeadlessField disabled={disabled} className={clsx('grid gap-2', className)} {...props}>
                {children}
            </HeadlessField>
        </FieldState.Provider>
    );
}

export function Label({ optional = false, className, children, ...props }) {
    return (
        <HeadlessLabel className={clsx('text-sm font-medium text-slate-200 select-none data-disabled:opacity-50', className)} {...props}>
            {children}
            {optional && <span className="ml-1.5 text-xs font-normal text-slate-500">Optional</span>}
        </HeadlessLabel>
    );
}

export function Hint({ className, ...props }) {
    return <Description className={clsx('text-xs/5 text-slate-400 data-disabled:opacity-50', className)} {...props} />;
}

/** Shows `children`, or the error given to the surrounding <Field>. Renders nothing without one. */
export function FieldError({ className, children }) {
    const { error } = useFieldState();
    const message = children ?? error;

    if (!message) {
        return null;
    }

    return (
        <Description className={clsx('flex items-start gap-1.5 text-xs/5 text-rose-300', className)}>
            <ExclamationCircleIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{message}</span>
        </Description>
    );
}

export default Field;
