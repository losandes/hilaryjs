/*! hilary-build 2016-12-03 */
(function(Hilary) {
    "use strict";
    var newModule;
    if (typeof module !== "undefined" || typeof window === "undefined" || !Hilary) {
        return false;
    }
    newModule = {};
    Object.defineProperty(newModule, "exports", {
        get: function() {
            return null;
        },
        set: function(val) {
            if (!val || !val.scope) {
                return;
            }
            if (!val.scope) {
                console.log("WARNING: you should always declare a scope when registering Hilary modules in a browser");
                return;
            }
            val.scope = val.scope || "default";
            Hilary.scope(val.scope).register(val);
        },
        enumerable: true,
        configurable: false
    });
    Object.defineProperty(window, "module", {
        get: function() {
            return newModule;
        },
        set: function() {
            var err = new Error("module (as in module.exports) is read only. You probably have two libraries that are trying to set module, on window.");
            console.log(err);
            return err;
        },
        enumerable: true,
        configurable: false
    });
})(typeof window !== "undefined" ? window.Hilary : null);