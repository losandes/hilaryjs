(function (Hilary) {
    'use strict';

    var newModule;

    if (
        typeof module !== 'undefined' ||
        typeof window === 'undefined' ||
        !Hilary
    ) {
        // module.exports is already defined - bail
        return false;
    }

    newModule = {};

    Object.defineProperty(newModule, 'exports', {
        get: function () {
            return null;
        },
        set: function (val) {
            if (!val || !val.scope) {
                return;
            }

            if (!val.scope) {
                console.log('WARNING: you should always declare a scope when registering Hilary modules in a browser');
                return;
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
            console.log(err);
            return err;
        },
        // this property should show up when this object's property names are enumerated
        enumerable: true,
        // this property may not be deleted
        configurable: false
    });

}(typeof window !== 'undefined' ? window.Hilary : null));
