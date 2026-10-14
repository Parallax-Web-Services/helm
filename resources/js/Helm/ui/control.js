// Shared look for text-like controls (TextInput, TextArea, Select).
export const controlClasses = [
    'block w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-sm text-white shadow-inner',
    'placeholder:text-slate-500 transition hover:border-white/20',
    'focus:border-accent-400/70 focus:outline-none focus:ring-2 focus:ring-accent-400/30',
    'data-invalid:border-rose-400/60 data-invalid:focus:ring-rose-400/30',
    'data-disabled:cursor-not-allowed data-disabled:opacity-50',
].join(' ');
