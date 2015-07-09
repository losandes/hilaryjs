/*globals window, module*/
(function (exports, Hilary) {
    "use strict";
    
    var extension = function (Hilary) {
        Hilary.extend('registerBlueprint', function (scope) {
            var context = scope.getContext(),
                utils = context.utils,
                exceptions = context.exceptionHandlers,
                registerBlueprint;
                
            registerBlueprint = function (name, implementationName) {
                scope.register({
                    name: name,
                    factory: function () {
                        return scope.resolve(implementationName);
                    }
                });
            };

            //scope.registerBlueprint('IFoo', 'IFooBlueprint', 'foo');

            return function (name, blueprintName, implementationName, callback) {
                var blueprint = scope.resolve(blueprintName),
                    implementation = scope.resolve(implementationName),
                    blueprintNotBlueprint = utils.notDefined(blueprint) || utils.notFunction(blueprint.signatureMatches),
                    callbackIsFunc = utils.isFunction(callback),
                    errorMessage = 'The second argument must be a valid polyn.Blueprint',
                    newCallback;

                if (blueprintNotBlueprint && callbackIsFunc) {
                    callback([errorMessage], false);
                } else if (blueprintNotBlueprint) {
                    throw exceptions.makeException(errorMessage);
                }

                newCallback = function (err, result) {
                    registerBlueprint(name, implementationName);
                    callback(err, result);
                };

                if (callbackIsFunc) {
                    blueprint.signatureMatches(implementation, newCallback);
                } else {
                    var blueprintResult = blueprint.syncSignatureMatches(implementation);

                    if (blueprintResult.result) {
                        registerBlueprint(name, implementationName);
                    } else {
                        throw exceptions.makeException('Blueprint Signature Match Failure', implementationName + ' does not implement ' + blueprintName, blueprintResult.errors);
                    }

                    return blueprintResult;
                }
                
                return scope;
            };
            
        });

    };
    
    if (Hilary) {
        extension(Hilary);
    } else {
        exports.usePolyn = function (Hilary) {
            extension(Hilary);
        };
    }

}(
    (typeof module !== 'undefined' && module.exports) ? module.exports : window,
    typeof window !== 'undefined' ? window.Hilary : null
));
