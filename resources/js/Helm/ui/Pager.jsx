import React from 'react';
import clsx from 'clsx';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/16/solid';
import { Button } from './Button.jsx';

function summaryOf(meta) {
    if (!meta) {
        return null;
    }

    if (meta.total != null && meta.from != null) {
        return `Showing ${meta.from}–${meta.to} of ${meta.total}`;
    }

    if (meta.current_page != null) {
        return meta.last_page ? `Page ${meta.current_page} of ${meta.last_page}` : `Page ${meta.current_page}`;
    }

    return null;
}

/**
 * Previous/next pagination for a Laravel paginator. Pass the paginator
 * (`->paginate()`, `->simplePaginate()` or an API resource collection) as
 * `paginator`, or explicit `prev` / `next` URLs. Renders nothing on one page.
 */
export function Pager({ paginator, prev, next, label = 'Pagination', preserveScroll = true, className }) {
    const meta = paginator?.meta ?? paginator;
    const previousUrl = prev ?? paginator?.prev_page_url ?? paginator?.links?.prev ?? null;
    const nextUrl = next ?? paginator?.next_page_url ?? paginator?.links?.next ?? null;

    if (!previousUrl && !nextUrl) {
        return null;
    }

    const summary = summaryOf(meta);

    return (
        <nav aria-label={label} className={clsx('flex items-center justify-between gap-3', className)}>
            <div className="flex-1">
                {previousUrl && (
                    <Button href={previousUrl} rel="prev" preserveScroll={preserveScroll} variant="outline" tone="neutral" size="sm" icon={ArrowLeftIcon}>
                        Previous
                    </Button>
                )}
            </div>
            {summary && <p className="text-center text-xs text-slate-500">{summary}</p>}
            <div className="flex flex-1 justify-end">
                {nextUrl && (
                    <Button href={nextUrl} rel="next" preserveScroll={preserveScroll} variant="outline" tone="neutral" size="sm" trailingIcon={ArrowRightIcon}>
                        Next
                    </Button>
                )}
            </div>
        </nav>
    );
}

export default Pager;
