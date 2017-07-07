(function (hilary) {
    'use strict';

    var warn;

    if (
        typeof module !== 'undefined' ||
        typeof window === 'undefined' ||
        !hilary
    ) {
        // module.exports is already defined - bail
        return false;
    }

    warn = function (err) {
        var log = console.warn || console.log;
        log(err.message, err);
    };

    window.module = {};

    Object.defineProperty(window.module, 'exports', {
        get: function () {
            return null; //newModule.exports;
        },
        set: function (val) {
            if (!val) {
                return;
            }

            if (val.scope) {
                hilary.scope(val.scope).register(val);
            } else {
                warn(new Error('WARNING: you should always declare a scope when registering hilary modules in a browser (module: ' + val.name + ')'));
                hilary.register(val);
            }
        },
        // this property should show up when this object's property names are enumerated
        enumerable: true,
        // this property may not be deleted
        configurable: false
    });

    Object.freeze(window.module);

}(typeof window !== 'undefined' ? window.hilary : null));
