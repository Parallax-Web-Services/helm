import React from 'react';
import clsx from 'clsx';
import { Textarea } from '@headlessui/react';
import { controlClasses } from './control.js';
import { useFieldState } from './Field.jsx';

/** Multi-line text control. `resizable={false}` locks its height. */
export function TextArea({ rows = 4, resizable = true, invalid, className, ...props }) {
    const field = useFieldState();

    return (
        <Textarea
            rows={rows}
            invalid={invalid ?? field.invalid}
            className={clsx(controlClasses, 'leading-6', resizable ? 'resize-y' : 'resize-none', className)}
            {...props}
        />
    );
}

export default TextArea;
