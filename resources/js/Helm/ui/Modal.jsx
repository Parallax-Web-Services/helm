import React from 'react';
import clsx from 'clsx';
import { CloseButton, Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';

const sizes = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
};

/**
 * Modal dialog on Headless UI: traps focus, closes on Escape or a click
 * outside, and returns focus to whatever opened it. `actions` renders a
 * footer row (put the primary action last).
 */
export function Modal({ open, onClose, title, description, actions, size = 'md', initialFocus, className, children }) {
    return (
        <Dialog open={open} onClose={onClose} initialFocus={initialFocus} className="relative z-50">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#010308]/75 backdrop-blur-sm transition duration-200 data-closed:opacity-0"
            />
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-3 sm:items-center sm:p-6">
                    <DialogPanel
                        transition
                        className={clsx(
                            'helm relative w-full rounded-3xl border border-white/10 bg-deck-panel p-5 text-slate-200 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] sm:p-7',
                            'transition duration-200 ease-out data-closed:translate-y-4 data-closed:opacity-0 sm:data-closed:translate-y-0 sm:data-closed:scale-95',
                            sizes[size] ?? sizes.md,
                            className,
                        )}
                    >
                        <div className="flex items-start justify-between gap-4">
                            {title && <DialogTitle className="text-lg/7 font-semibold text-white">{title}</DialogTitle>}
                            <CloseButton
                                aria-label="Close"
                                className="-mr-2 -mt-1 ml-auto rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white focus-ring"
                            >
                                <XMarkIcon aria-hidden="true" className="size-5" />
                            </CloseButton>
                        </div>
                        {description && <Description className="mt-2 text-sm/6 text-slate-400">{description}</Description>}
                        {children && <div className="mt-5">{children}</div>}
                        {actions && (
                            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">{actions}</div>
                        )}
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default Modal;
