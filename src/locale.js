(function (register) {
    'use strict';

    register({
        name: 'locale',
        factory: {
            errorTypes: {
                INVALID_ARG: 'InvalidArgument',
                INVALID_REGISTRATION: 'InvalidRegistration',
                MODULE_NOT_FOUND: 'ModuleNotFound',
                MODULE_NOT_RESOLVED: 'ModuleNotResolved',
                BOOTSTRAP_FAILED: 'BootstrapFailed'
            },
            container: {
                CONSUMER_REQUIRED: 'A consumer function is required to `enumerate` over a container'
            },
            hilaryModule: {
                FACTORY_UNDEFINED: 'This implementation does not satisfy blueprint, Hilary::HilaryModule. It should have the property, factory.',
                DEPENDENCIES_NO_FACTORY: 'Dependencies were declared, but the factory is not a function, so they cannot be applied.',
                DEPENDENCY_FACTORY_MISMATCH: 'The number of dependencies that were declared does not match the number of arguments that the factory accepts.'
            },
            api: {
                REGISTER_ERR: 'register failed. see cause for more information',
                REGISTER_ARG: 'register expects either a hilary module, or an array of hilary modules as the first argument, but instead saw this: ',
                RESOLVE_ARG: 'resolve expects a moduleName (string) as the first argument, but instead saw this: ',
                MODULE_NOT_FOUND: 'The module, "{{module}}", cannot be found',
                MODULE_NOT_FOUND_RELYING: ', and is a dependency of, "{{startingModule}}"',
                MODULE_THREW: 'The module, "{{module}}", cannot be resolved because it returned or threw an Error',
                // MODULE_NOT_RESOLVABLE: 'The module, "{{module}}", cannot be resolved because of a dependency exception',
                // MODULE_NOT_RESOLVABLE_RELYING: ', causing a ripple effect for, "{{startingModule}}"',
                REGISTRATION_BLACK_LIST: 'A module was registered with a reserved name: ',
                PARENT_CONTAINER_ARG: 'setParentScope expects the name of the parent scope, or an instance of Hilary'
            },
            bootstrap: {
                TASKS_ARRAY: 'bootstrap expects the first argument to be an array of functions',
                INVALID_TASK_ARGUMENT: 'The task expected a first argument of scope, and a callback as the second argument'
            }
        }
    });

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
