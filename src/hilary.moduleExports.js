(function (Hilary) {
    'use strict';

    var newModule,
        warn;

    if (
        typeof module !== 'undefined' ||
        typeof window === 'undefined' ||
        !Hilary
    ) {
        // module.exports is already defined - bail
        return false;
    }

    newModule = {};

    warn = function (err) {
        var log = console.warn || console.log;
        log(err.message, err);
    };

    Object.defineProperty(newModule, 'exports', {
        get: function () {
            return null; //newModule.exports;
        },
        set: function (val) {
            if (!val) {
                return;
            }

            if (!val.scope) {
                warn(new Error('WARNING: you should always declare a scope when registering Hilary modules in a browser (module: ' + val.name + ')'));
            }

            val.scope = val.scope || 'default';

            Hilary.scope(val.scope).register(val);
        },
        // this property should show up when this object's property names are enumerated
        enumerable: true,
        // this property may not be deleted
        configurable: false
    });

    Object.defineProperty(window, 'module', {
        get: function () {
            return newModule;
        },
        set: function () {
            var err = new Error('module (as in module.exports) is read only. You probably have two libraries that are trying to set module, on window.');
            warn(err);
            return err;
        },
        // this property should show up when this object's property names are enumerated
        enumerable: true,
        // this property may not be deleted
        configurable: false
    });

}(typeof window !== 'undefined' ? window.Hilary : null));
