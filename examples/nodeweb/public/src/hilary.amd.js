/*jslint plusplus: true*/
/*globals module, Hilary, HilaryModule*/
(function (exports) {
    "use strict";
    
    var AMDContainer;
    
    Hilary.extend('define', function (scope) {
        var result = function (moduleName, dependencies, factory) {
            var utils = scope.getUtils(),
                exceptions = scope.getExceptionHandlers();
            
            if (utils.isFunction(factory)) {
                // all 3 arguments are present
                return scope.register(moduleName, new HilaryModule(dependencies, factory));
            } else if (utils.isString(moduleName) && utils.isFunction(dependencies)) {
                // the factory was passed in as the second argument - no dependencies exist
                // moduleName == moduleName and dependencies == factory
                return scope.register(moduleName, new HilaryModule(dependencies));
            } else if (utils.isArray(moduleName) && utils.isFunction(dependencies)) {
                // anonymous definition: the factory was passed in as the second argument - dependencies exist
                // moduleName == dependencies and dependencies == factory
                return scope.require(moduleName, dependencies);
            } else if (utils.isFunction(moduleName)) {
                // anonymous definition: the factory was passed in as the first argument
                return scope.require(moduleName);
            } else if (utils.isObject(moduleName)) {
                // anonymous definition: an object literal was passed in as the first argument
                return scope.require(function (require, exports, module) {
                    var prop;
                    
                    for (prop in moduleName) {
                        if (moduleName.hasOwnProperty(prop)) {
                            exports[prop] = moduleName[prop];
                        }
                    }
                });
            } else if (utils.isString(moduleName) && utils.isObject(dependencies)) {
                // the factory in an object literal and was passed in as the second argument - no dependencies exist
                // moduleName == moduleName and dependencies == object literal
                return scope.require(function (require, exports, module) {
                    exports[moduleName] = dependencies;
                });
            } else {
                throw exceptions.argumentException('A factory function was not found to define this module', 'factory');
            }
        };
        
        result.amd = {};
        
        return result;
    });
    
    Hilary.extend('require', function (scope) {
        return function (dependencies, factory) {
            if (typeof dependencies === 'function') {
                // The first argument is the factory
                return dependencies(scope.resolve, scope.getContainer(), typeof module !== 'undefined' ? module : exports);
            } else if (typeof dependencies === 'string') {
                // A single module is being required
                return scope.resolve(dependencies);
            } else {
                // An array of dependencies are being required for the factory
                var i,
                    resolved = [];

                for (i = 0; i < dependencies.length; i++) {
                    resolved.push(scope.resolve(dependencies[i]));
                }

                return factory.apply(null, resolved);
            }
        };
    });
    
    AMDContainer = new Hilary();
    
    // export the main container and make define and require globals
    exports.AMDContainer = AMDContainer;
    exports.define = AMDContainer.define;
    exports.require = AMDContainer.require;

}((typeof module !== 'undefined' && module.exports) ? module.exports : window));