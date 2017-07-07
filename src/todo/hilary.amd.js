(function (exports, Hilary) {
    'use strict';

    if (exports.AMDContainer && exports.define && exports.require) {
        // Hilary AMD was already defined; ignore this instance
        return false;
    }

    var extension = function (Hilary) {
        var AMDContainer;

        Hilary.extend('useAMD', function (scope) {
            var context = scope.getContext(),
                is = context.is,
                err = context.exceptionHandlers,
                constants = context.constants;

            return function () {
                scope.define = function (moduleName, dependencies, factory) {
                    if (is.function(factory)) {
                        // all 3 arguments are present
                        return scope.register({
                            name: moduleName,
                            dependencies: dependencies,
                            factory: factory
                        });
                    } else if (is.string(moduleName) && is.function(dependencies)) {
                        // the factory was passed in as the second argument - no dependencies exist
                        // moduleName == moduleName and dependencies == factory
                        return scope.register({
                            name: moduleName,
                            factory: dependencies
                        });
                    } else if (is.array(moduleName) && is.function(dependencies)) {
                        // anonymous definition: the factory was passed in as the second argument - dependencies exist
                        // moduleName == dependencies and dependencies == factory
                        return scope.autoResolve({
                            dependencies: moduleName,
                            factory: dependencies
                        });
                    } else if (is.function(moduleName)) {
                        // anonymous definition: the factory was passed in as the first argument
                        return scope.require(moduleName);
                    } else if (is.object(moduleName)) {
                        // anonymous definition: an object literal was passed in as the first argument
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
                        // the factory in an object literal and was passed in as the second argument - no dependencies exist
                        // moduleName == moduleName and dependencies == object literal
                        return scope.register({
                            name: moduleName,
                            factory: dependencies
                        });
                    } else {
                        throw err.argumentException('A factory function was not found to define ' + moduleName, 'factory');
                    }
                };

                scope.require = function (dependencies, factory) {
                    if (is.function(dependencies)) {
                        // The first argument is the factory
                        return dependencies(scope.require, context.container, (window || module));
                    } else if (typeof dependencies === 'string') {
                        // A single module is being required
                        return scope.resolve(dependencies);
                    } else {
                        // An array of dependencies are being required for the factory
                        return scope.resolveMany(dependencies, factory);
                    }
                };

                scope.getContext().pipeline.register.after.newChild(function (err, payload) {
                    if (payload && payload.child && payload.child.useAMD) {
                        payload.child.useAMD();
                    }
                });

                return scope;
            };
        });

        AMDContainer = Hilary.scope('__AMD').useAMD();

        // export the main container and make define and require globals
        exports.AMDContainer = AMDContainer;
        exports.define = AMDContainer.define;
        exports.define.amd = {};
        exports.require = AMDContainer.require;
    };

    if (Hilary) {
        extension(Hilary);
    } else {
        exports.useAMD = function (Hilary) {
            extension(Hilary);
        };
    }

}(
    (typeof module !== 'undefined' && module.exports) ? module.exports : window,
    typeof window !== 'undefined' ? window.Hilary : null
));
