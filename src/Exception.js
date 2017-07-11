(function (register) {
    'use strict';

    register({
        name: 'Exception',
        factory: Exception
    });

    function Exception (input) {
        return {
            isException: true,
            type: input.type,
            error: normalizeError(input),
            messages: normalizeMessages(input),
            data: input.data
        };
    }

    function normalizeError (input) {
        if (typeof input.error === 'object') {
            return input.error;
        } else if (typeof input.error === 'string') {
            return new Error(input.error);
        } else {
            return new Error();
        }
    }

    function normalizeMessages (input) {
        if (Array.isArray(input.messages)) {
            return input.messages;
        } else if (typeof input.messages === 'string') {
            return [input.messages];
        } else if (input.error && input.error.message) {
            return [input.error.message];
        } else {
            return [];
        }
    }

}(function (registration) {
    'use strict';

    try {
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = registration.factory;
        } else if (typeof window !== 'undefined') {
            window.__hilary = window.__hilary || {};
            window.__hilary[registration.name] = registration.factory;
        } else {
            throw new Error('[HILARY] Unkown runtime environment');
        }
    } catch (e) {
        var name = registration && registration.name ? registration.name : 'MISSING NAME';
        var err = new Error('[HILARY] Registration failure: ' + name);
        err.cause = e;
        throw err;
    }
}));
