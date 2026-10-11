const normalizePath = (path) => new URL(path, 'https://zefram.local').pathname.replace(/\/+$/, '') || '/';

export function createRouter() {
    const routes = new Map();

    const router = {
        get(path, handler) {
            return register('GET', path, handler);
        },
        post(path, handler) {
            return register('POST', path, handler);
        },
        async handle(request) {
            const path = normalizePath(request.url);
            const handler = routes.get(path)?.get(request.method);

            if (handler) {
                const response = await handler(request);

                if (!(response instanceof Response)) {
                    throw new TypeError('Route handlers must return a Response.');
                }

                return response;
            }

            if (routes.has(path)) {
                return Response.json({ message: 'Method not allowed.' }, {
                    status: 405,
                    headers: { Allow: [...routes.get(path).keys()].join(', ') },
                });
            }

            return Response.json({ message: 'Not found.' }, { status: 404 });
        },
    };

    function register(method, path, handler) {
        if (typeof handler !== 'function') {
            throw new TypeError('Route handlers must be functions.');
        }

        const normalizedPath = normalizePath(path);
        const methods = routes.get(normalizedPath) ?? new Map();
        methods.set(method, handler);
        routes.set(normalizedPath, methods);

        return router;
    }

    return router;
}

export function validateText(value, { label = 'Text', maxLength = 200 } = {}) {
    const text = typeof value === 'string' ? value.trim() : '';

    if (text.length === 0) {
        return { value: text, error: `${label} is required.` };
    }

    if (Array.from(text).length > maxLength) {
        return { value: text, error: `${label} must be ${maxLength} characters or fewer.` };
    }

    return { value: text, error: null };
}

export function createNotesStore({ storage, key = 'zefram.notes' }) {
    if (typeof storage?.getItem !== 'function' || typeof storage?.setItem !== 'function') {
        throw new TypeError('A Storage-compatible adapter is required.');
    }

    function all() {
        const stored = storage.getItem(key);

        if (stored === null) {
            return [];
        }

        let notes;

        try {
            notes = JSON.parse(stored);
        } catch {
            return [];
        }

        if (!Array.isArray(notes)) {
            return [];
        }

        return notes.filter((note) => note !== null
            && typeof note === 'object'
            && typeof note.id === 'string'
            && typeof note.title === 'string'
            && typeof note.createdAt === 'string');
    }

    return {
        all,
        add(title) {
            const validation = validateText(title, { label: 'Title' });

            if (validation.error) {
                throw new TypeError(validation.error);
            }

            const note = {
                id: globalThis.crypto.randomUUID(),
                title: validation.value,
                createdAt: new Date().toISOString(),
            };

            storage.setItem(key, JSON.stringify([...all(), note]));

            return note;
        },
    };
}
