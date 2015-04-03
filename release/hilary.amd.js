/*! hilary-build 2015-04-03 */
(function(exports, Hilary) {
    "use strict";
    if (exports.AMDContainer && exports.define && exports.require) {
        return false;
    }
    var extension = function(Hilary) {
        var AMDContainer;
        Hilary.extend("useAMD", function(scope) {
            var context = scope.getContext(), utils = context.utils, err = context.exceptionHandlers, constants = context.constants;
            return function() {
                scope.define = function(moduleName, dependencies, factory) {
                    if (utils.isFunction(factory)) {
                        return scope.register({
                            name: moduleName,
                            dependencies: dependencies,
                            factory: factory
                        });
                    } else if (utils.isString(moduleName) && utils.isFunction(dependencies)) {
                        return scope.register({
                            name: moduleName,
                            factory: dependencies
                        });
                    } else if (utils.isArray(moduleName) && utils.isFunction(dependencies)) {
                        return scope.autoResolve({
                            dependencies: moduleName,
                            factory: dependencies
                        });
                    } else if (utils.isFunction(moduleName)) {
                        return scope.require(moduleName);
                    } else if (utils.isObject(moduleName)) {
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
                    } else if (utils.isString(moduleName) && utils.isObject(dependencies)) {
                        return scope.register({
                            name: moduleName,
                            factory: dependencies
                        });
                    } else {
                        throw err.argumentException("A factory function was not found to define " + moduleName, "factory");
                    }
                };
                scope.require = function(dependencies, factory) {
                    if (utils.isFunction(dependencies)) {
                        return dependencies(scope.require, context.container, window || module);
                    } else if (typeof dependencies === "string") {
                        return scope.resolve(dependencies);
                    } else {
                        return scope.resolveMany(dependencies, factory);
                    }
                };
                scope.registerEvent(constants.pipeline.afterNewChild, function(scope, options, child) {
                    child.useAMD();
                });
                return scope;
            };
        });
        AMDContainer = new Hilary().useAMD();
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