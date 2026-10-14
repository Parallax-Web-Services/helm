import React from 'react';
import clsx from 'clsx';
import { Card } from './Card.jsx';

function formatValue(value) {
    return typeof value === 'number' ? value.toLocaleString() : value;
}

/** A single readout: small label, large display-face value, optional hint and heroicon. */
export function Stat({ label, value, hint, icon: Icon, className }) {
    return (
        <Card className={clsx('relative p-4 sm:p-5', className)}>
            {Icon && <Icon aria-hidden="true" className="absolute right-4 top-4 size-5 text-accent-300/70 sm:right-5 sm:top-5" />}
            <dl>
                <dt className="pr-8 text-[10px]/4 font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</dt>
                <dd className="mt-3 font-display text-3xl tabular-nums text-white">{formatValue(value)}</dd>
                {hint && <dd className="mt-1.5 text-xs/5 text-slate-400">{hint}</dd>}
            </dl>
        </Card>
    );
}

export default Stat;
