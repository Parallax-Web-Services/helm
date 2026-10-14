import React from 'react';
import clsx from 'clsx';

/**
 * The app's mark. With `tint` (the default) a single-colour image is used as
 * a mask and filled with the current accent; set `tint={false}` for a
 * multi-colour logo.
 */
export function BrandMark({ src, tint = true, className }) {
    if (!src) {
        return null;
    }

    if (!tint) {
        return <img src={src} alt="" aria-hidden="true" className={clsx('shrink-0 object-contain', className)} />;
    }

    const mask = `url("${src}")`;

    return (
        <span
            aria-hidden="true"
            className={clsx('inline-block shrink-0 bg-accent-300 drop-shadow-[0_0_10px_var(--helm-glow)]', className)}
            style={{
                maskImage: mask,
                WebkitMaskImage: mask,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
            }}
        />
    );
}

export default BrandMark;
