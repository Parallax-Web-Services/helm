import React, { createContext, useContext } from 'react';
import clsx from 'clsx';

const TableOptions = createContext({ dense: false });

const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

/**
 * Composable table that scrolls sideways on narrow screens instead of
 * squashing. `label` names the table for assistive tech (and makes the
 * scroll area keyboard-focusable); `minWidth` sets when scrolling kicks in.
 *
 *   <Table label="Members" minWidth="36rem">
 *     <THead><HeaderCell>Name</HeaderCell></THead>
 *     <TBody><Row><Cell>Ada</Cell></Row></TBody>
 *   </Table>
 */
export function Table({ label, minWidth, dense = false, className, children }) {
    return (
        <TableOptions.Provider value={{ dense }}>
            <div
                role={label ? 'region' : undefined}
                aria-label={label}
                tabIndex={label ? 0 : undefined}
                className={clsx('overflow-x-auto rounded-2xl border border-white/8 bg-black/20 focus-ring', className)}
            >
                <table className="w-full border-collapse text-left text-sm" style={minWidth ? { minWidth } : undefined}>
                    {label && <caption className="sr-only">{label}</caption>}
                    {children}
                </table>
            </div>
        </TableOptions.Provider>
    );
}

export const DataTable = Table;

/** Header row. Children are <HeaderCell>s. */
export function THead({ className, children }) {
    return (
        <thead className={clsx('border-b border-white/8 text-[10px] uppercase tracking-[0.2em] text-slate-500', className)}>
            <tr>{children}</tr>
        </thead>
    );
}

export function TBody({ className, children }) {
    return <tbody className={className}>{children}</tbody>;
}

export function Row({ className, children, ...props }) {
    return (
        <tr className={clsx('border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.025]', className)} {...props}>
            {children}
        </tr>
    );
}

export function HeaderCell({ align = 'left', className, children, ...props }) {
    const { dense } = useContext(TableOptions);

    return (
        <th scope="col" className={clsx('px-4 font-semibold', dense ? 'py-2' : 'py-3', alignments[align], className)} {...props}>
            {children}
        </th>
    );
}

export function Cell({ align = 'left', className, children, ...props }) {
    const { dense } = useContext(TableOptions);

    return (
        <td className={clsx('px-4 align-middle text-slate-300', dense ? 'py-2' : 'py-3.5', alignments[align], className)} {...props}>
            {children}
        </td>
    );
}

export default Table;
