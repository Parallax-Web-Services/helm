import React from 'react';
import clsx from 'clsx';

/** Hairline rule. Decorative by default; pass role="separator" when it divides content meaningfully. */
export function Separator({ soft = false, className, ...props }) {
    return (
        <hr
            role="presentation"
            className={clsx('w-full border-0 border-t', soft ? 'border-white/5' : 'border-white/10', className)}
            {...props}
        />
    );
}

export default Separator;
