/*jslint plusplus: true*/
/*globals module, require*/
(function (exports, Hilary) {
    "use strict";
    
    var AMDContainer;
    
    Hilary.extend('define', function (scope) {
        var context = scope.getContext(),
            utils = context.utils,
            err = context.exceptionHandlers;
        
        return function (moduleName, dependencies, factory) {
            if (utils.isFunction(factory)) {
                // all 3 arguments are present
                return scope.register({
                    name: moduleName,
                    dependencies: dependencies,
                    factory: factory
                });
            } else if (utils.isString(moduleName) && utils.isFunction(dependencies)) {
                // the factory was passed in as the second argument - no dependencies exist
                // moduleName == moduleName and dependencies == factory
                return scope.register({
                    name: moduleName,
                    factory: dependencies
                });
            } else if (utils.isArray(moduleName) && utils.isFunction(dependencies)) {
                // anonymous definition: the factory was passed in as the second argument - dependencies exist
                // moduleName == dependencies and dependencies == factory
                return scope.autoResolve({
                    dependencies: moduleName,
                    factory: dependencies
                });
            } else if (utils.isFunction(moduleName)) {
                // anonymous definition: the factory was passed in as the first argument
                return scope.require(moduleName);
            } else if (utils.isObject(moduleName)) {
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
            } else if (utils.isString(moduleName) && utils.isObject(dependencies)) {
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
    });
    
    Hilary.extend('require', function (scope) {
        var context = scope.getContext(),
            utils = context.utils;
        
        return function (dependencies, factory) {
            if (utils.isFunction(dependencies)) {
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
    });
    
    AMDContainer = new Hilary();
    
    // export the main container and make define and require globals
    exports.AMDContainer = AMDContainer;
    exports.define = AMDContainer.define;
    exports.define.amd = {};
    exports.require = AMDContainer.require;

}(
    (typeof module !== 'undefined' && module.exports) ? module.exports : window,
    (typeof module !== 'undefined' && module.exports) ? require('hilary') : window.Hilary
));
