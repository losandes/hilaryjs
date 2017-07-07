(function (register) {
    'use strict';

    register({
        name: 'HilaryModule',
        factory: HilaryModule
    });

    function HilaryModule (is, Blueprint, objectHelper, locale, Exception) {
        var IModule = new Blueprint({
            __blueprintId: 'Hilary::HilaryModule',
            isHilaryModule: 'boolean',
            name: 'string',
            singleton: {
                type: 'boolean',
                required: false
            },
            dependencies: {
                type: 'array',
                required: false
            },
            factory: {
                validate: function (val, errors, input) {
                    if (is.not.defined(val)) {
                        errors.push(locale.hilaryModule.FACTORY_UNDEFINED);
                    } else if (
                        is.not.function(val) &&
                        is.array(input.dependencies) &&
                        input.dependencies.length
                    ) {
                        errors.push(locale.hilaryModule.DEPENDENCIES_NO_FACTORY);
                    } else if (
                        is.function(val) &&
                        is.array(input.dependencies) &&
                        input.dependencies.length &&
                        val.length !== input.dependencies.length
                    ) {
                        errors.push(locale.hilaryModule.DEPENDENCY_FACTORY_MISMATCH);
                    }
                }
            }
        });

        return function (input) {
            input = input || {};
            input.isHilaryModule = true;
            // make modules singletons, by default
            input.singleton = is.boolean(input.singleton) ?
                input.singleton :
                true;

            if (is.not.defined(input.dependencies) && is.function(input.factory)) {
                // generate an array of dependency names from the arguments that
                // the factory accepts
                input.dependencies = objectHelper.getArgumentNames(input.factory);
            } else if (input.dependencies === false) {
                input.dependencies = [];
            }

            if (!IModule.validate(input).result) {
                return new Exception({
                    type: locale.errorTypes.INVALID_REGISTRATION,
                    error: new Error(locale.api.REGISTER_ARG + JSON.stringify(input)),
                    messages: IModule.validate(input).errors,
                    data: input
                });
            }

            return input;
        };
    }

}(function (registration) {
    'use strict';

    try {
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = registration.factory;
        } else if (typeof window !== 'undefined') {
            window.__hilary = window.__hilary || {};
            window.__hilary[registration.name] = registration.factory;
        } else {
            throw new Error('[HILARY] Unkown runtime environment');
        }
    } catch (e) {
        var name = registration && registration.name ? registration.name : 'MISSING NAME';
        var err = new Error('[HILARY] Registration failure: ' + name);
        err.cause = e;
        throw err;
    }
}));
