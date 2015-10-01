/*! hilary-build 2015-10-01 */
(function(exports, Hilary) {
    "use strict";
    if (exports.AMDContainer && exports.define && exports.require) {
        return false;
    }
    var extension = function(Hilary) {
        var AMDContainer;
        Hilary.extend("useAMD", function(scope) {
            var context = scope.getContext(), is = context.is, err = context.exceptionHandlers, constants = context.constants;
            return function() {
                scope.define = function(moduleName, dependencies, factory) {
                    if (is.function(factory)) {
                        return scope.register({
                            name: moduleName,
                            dependencies: dependencies,
                            factory: factory
                        });
                    } else if (is.string(moduleName) && is.function(dependencies)) {
                        return scope.register({
                            name: moduleName,
                            factory: dependencies
                        });
                    } else if (is.array(moduleName) && is.function(dependencies)) {
                        return scope.autoResolve({
                            dependencies: moduleName,
                            factory: dependencies
                        });
                    } else if (is.function(moduleName)) {
                        return scope.require(moduleName);
                    } else if (is.object(moduleName)) {
                        var prop;
                        for (prop in moduleName) {
                            if (moduleName.hasOwnProperty(prop)) {
                                scope.register({
                                    name: prop,
                                    factory: moduleName[prop]
                                });
                            }
                        }
                        return scope;
                    } else if (is.string(moduleName) && is.object(dependencies)) {
                        return scope.register({
                            name: moduleName,
                            factory: dependencies
                        });
                    } else {
                        throw err.argumentException("A factory function was not found to define " + moduleName, "factory");
                    }
                };
                scope.require = function(dependencies, factory) {
                    if (is.function(dependencies)) {
                        return dependencies(scope.require, context.container, window || module);
                    } else if (typeof dependencies === "string") {
                        return scope.resolve(dependencies);
                    } else {
                        return scope.resolveMany(dependencies, factory);
                    }
                };
                scope.getContext().pipeline.register.after.newChild(function(err, payload) {
                    if (payload && payload.child && payload.child.useAMD) {
                        payload.child.useAMD();
                    }
                });
                return scope;
            };
        });
        AMDContainer = Hilary.scope("__AMD").useAMD();
        exports.AMDContainer = AMDContainer;
        exports.define = AMDContainer.define;
        exports.define.amd = {};
        exports.require = AMDContainer.require;
    };
    if (Hilary) {
        extension(Hilary);
    } else {
        exports.useAMD = function(Hilary) {
            extension(Hilary);
        };
    }
})(typeof module !== "undefined" && module.exports ? module.exports : window, typeof window !== "undefined" ? window.Hilary : null);