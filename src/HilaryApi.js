(function (register) {
    'use strict';

    var ASYNC = 'polyn::async',
        CONTEXT = 'hilary::context',
        IMMUTABLE = 'polyn::Immutable',
        IS = 'polyn::is',
        DEFAULT = 'default';

    register({
        name: 'HilaryApi',
        factory: HilaryApi
    });

    function HilaryApi (async, is, id, Immutable, locale, Logger, Exception, Context, HilaryModule, ResolveTasks) {
        var Api,
            scopes = {},
            defaultScope;

        /*
        // The Hilary constructor
        // @param options (string or Object): a named scope, or multiple options
        // @param options.name (string): a named scope
        //
        // @returns new Hilary scope with parent set to this (the current Hilary scope)
        */
        Api = function (options) {
            var self,
                logger = new Logger(options),
                config = new Config(options),
                context,
                resolveTasks;

            context = new Context(config);
            resolveTasks = new ResolveTasks(context, logger, resolve);

            if (context.isException) {
                return context;
            }

            self = {
                __isHilaryScope: true,
                context: context,
                HilaryModule: HilaryModule,
                register: register,
                makeRegistrationTask: makeRegistrationTask,
                resolve: resolve,
                exists: exists,
                dispose: dispose,
                bootstrap: bootstrap,
                scope: scope,
                setParentScope: setParentScope
            };

            Object.defineProperty(self, 'name', {
                enumerable: false,
                configurable: false,
                get: function () {
                  return self.context.scope;
                },
                set: function () {
                  logger.warn(name + ' is read only');
                }
            });

            scopes[config.scope] = self;

            // TODO: this is probably better done with a wrapper
            // if (config.hilaryCompatible) {
            //     // add hilaryjs compatible APIs
            //     self.autoRegister = register;
            //     self.Bootstrapper = bootstrap;
            // }



            /*
            // register a module by name, an array of modules
            // @param definition (object): the module defintion: at least the name and factory properties are required
            // @param next (function): optional async API
            // @returns this (the Hilary scope)
            */
            function register (moduleOrArray, callback) {
                var err = new Error(locale.api.REGISTER_ERR);

                if (is.object(moduleOrArray)) {
                    logger.trace({
                        message: 'Registering a single module',
                        module: moduleOrArray
                    });
                    return registerOne(moduleOrArray, err, callback);
                } else if (is.array(moduleOrArray)) {
                    logger.trace({
                        message: 'Registering an array of modules',
                        modules: moduleOrArray
                    });
                    return optionalAsync(function () {
                        moduleOrArray.forEach(registerOne);
                        return self;
                    }, err, callback);
                } else {
                    var exc = new Exception({
                        type: locale.errorTypes.INVALID_ARG,
                        error: new Error(locale.api.REGISTER_ARG + JSON.stringify(moduleOrArray)),
                        data: moduleOrArray
                    });

                    logger.error({
                        message: 'Registration failed',
                        exception: exc
                    });

                    if (is.function(callback)) {
                        callback(exc);
                    }

                    return exc;
                }
            }

            /*
            // register a module by name
            // @param definition (object): the module defintion: at least the name and factory properties are required
            // @param next (function): optional async API
            // @returns this (the Hilary scope)
            */
            function registerOne (input, err, callback) {
                var tasks = [];

                if (self.name === DEFAULT && input && input.scope && input.scope !== DEFAULT) {
                    // the module declares the scope that is meant to be
                    // registered to, and it is not 'default'
                    return self.scope(input.scope).register(input, callback);
                }

                tasks.push(function bind (next) {
                    var hilaryModule = new HilaryModule(input);

                    if (hilaryModule.isException) {
                        logger.error({
                            message: 'Invalid registration model',
                            module: hilaryModule
                        });
                        return next(new Exception({
                            type: locale.errorTypes.INVALID_REGISTRATION,
                            error: new Error(hilaryModule.error.message),
                            messages: hilaryModule.messages,
                            data: input
                        }));
                    } else {
                        logger.trace('Successfully bound to HilaryModule: ' + hilaryModule.name);
                        return next(null, hilaryModule);
                    }
                });

                tasks.push(function addToContainer (hilaryModule, next) {
                    context.container.register(hilaryModule);
                    logger.trace('Module registered on container: ' + hilaryModule.name);
                    next(null, hilaryModule);
                });

// TODO: addTagReferences (i.e. tags: ['controller']) so modules can be resolved by tag

                if (is.function(callback)) {
                    return async.waterfall(tasks, function (err, hilaryModule) {
                        if (err) {
                            logger.error({
                                message: 'Registration failed',
                                input: input,
                                err: err
                            });
                            return callback(err);
                        }

                        logger.debug('Registration success: ' + hilaryModule.name);
                        callback(err, hilaryModule);
                    });
                } else {
                    var output;

                    async.waterfall(tasks, { blocking: true }, function (err, hilaryModule) {
                        if (err) {
                            logger.error({
                                message: 'Registration failed',
                                input: input,
                                err: err
                            });
                            output = err;
                            return;
                        }

                        logger.debug('Registration success: ' + hilaryModule.name);
                        output = hilaryModule;
                    });

                    return output;
                }
            }

            /*
            // make a registration task that can be added to a bootstrapper startup array
            */
            function makeRegistrationTask (moduleOrArray) {
                logger.trace({
                    message: 'Making a registration task',
                    module: moduleOrArray
                });

                return function (scope, done) {
                    var err;

                    if (!scope || !scope.__isHilaryScope || is.not.function(done)) {
                        err = new Error(locale.bootstrap.INVALID_TASK_ARGUMENT);

                        logger.error({
                            message: locale.bootstrap.INVALID_TASK_ARGUMENT,
                            err: err
                        });

                        return arguments[arguments.length-1](new Exception({
                            type: locale.errorTypes.INVALID_REGISTRATION,
                            error: err,
                            messages: [locale.bootstrap.INVALID_TASK_ARGUMENT],
                            data: moduleOrArray
                        }));
                    }

                    register(moduleOrArray, function (err) {
                        if (err) {
                            return done(err);
                        }

                        done(null, scope);
                    });
                };
            }

            /*
            // attempt to resolve a dependency by name (supports parental hierarchy)
            // @param moduleName (string): the qualified name that the module can be located by in the container
            // @returns the module that is being resolved
            */
            function resolve (moduleName, callback) {
                logger.trace('resolving: ' + moduleName);

                if (is.regexp(moduleName)) {
                    var modules = resolveTasks.filterMatchingRegistrations(moduleName, context)
                        .map(function (moduleNameText) {
                            return resolveOne(moduleNameText, moduleNameText);
                        })

                    if (is.function(callback)) {
                        callback(null, modules);
                    } else {
                        return modules;
                    }
                }

                return resolveOne(moduleName, moduleName, callback);
            }

            function resolveOne (moduleName, relyingModuleName, callback) {
                var ctx = {
                        name: moduleName,
                        relyingName: relyingModuleName,
                        theModule: undefined,
                        resolved: undefined,
                        isResolved: false,
                        registerSingleton: true,
                        members: []
                    },
                    tasks = [];

                tasks.push(function (next) {
                    next(null, ctx);
                });

                tasks.push(resolveTasks.validateModuleName);
                tasks.push(resolveTasks.findModule);
                tasks.push(resolveTasks.resolveDependencies);
                tasks.push(resolveTasks.reduceMembers);
                tasks.push(resolveTasks.optionallyRegisterSingleton);
                tasks.push(resolveTasks.bindToOutput);

                // RUN the waterfall
                if (is.function(callback)) {
                    async.waterfall(tasks, function (err, results) {
                        if (
                            err &&
                            err.type === locale.errorTypes.MODULE_NOT_FOUND &&
                            context.parent &&
                            scopes[context.parent]
                        ) {
                            logger.trace('Attempting to resolve the module, ' + ctx.name + ', on the parent scope: ' + context.parent);
                            return scopes[context.parent].resolve(moduleName, callback);
                        } else if (err && err.type === locale.errorTypes.MODULE_NOT_FOUND) {
                            logger.trace('Attempting to gracefully degrade, ' + ctx.name);
                            return resolveDegraded(ctx, callback);
                        }

                        if (err) {
                            logger.error({
                                message: 'Resolve failed for: ' + ctx.name,
                                err: err
                            });
                            return callback(err);
                        }

                        logger.debug('Module resolved: ' + ctx.name);
                        callback(null, results);
                    });
                } else {
                    var output;

                    async.waterfall(tasks, { blocking: true }, function (err, results) {
                        if (
                            err &&
                            err.type === locale.errorTypes.MODULE_NOT_FOUND &&
                            context.parent &&
                            scopes[context.parent]
                        ) {
                            logger.trace('Attempting to resolve the module, ' + ctx.name + ', on the parent scope: ' + context.parent);
                            output = scopes[context.parent].resolve(moduleName);
                            return;
                        } else if (err && err.type === locale.errorTypes.MODULE_NOT_FOUND) {
                            logger.trace('Attempting to gracefully degrade, ' + ctx.name);
                            output = resolveDegraded(ctx);
                            return;
                        }

                        if (err) {
                            logger.error({
                                message: 'Resolve failed for: ' + ctx.name,
                                err: err
                            });
                            output = err;
                            return;
                        }

                        logger.debug('Module resolved: ' + ctx.name);
                        output = results;
                    });

                    return output;
                }
            }

            function resolveDegraded (ctx, callback) {
                var tasks = [];

                tasks.push(function (next) {
                    next(null, ctx);
                });

                tasks.push(resolveTasks.findDegraded);
                tasks.push(resolveTasks.reduceMembers);
                tasks.push(resolveTasks.optionallyRegisterSingleton);
                tasks.push(resolveTasks.bindToOutput);

                if (is.function(callback)) {
                    async.waterfall(tasks, function (err, results) {
                        if (err) {
                            logger.error({
                                message: 'Resolve failed for: ' + ctx.name,
                                err: err
                            });
                            return callback(err);
                        }

                        logger.debug('Module resolved: ' + ctx.name);
                        callback(null, results);
                    });
                } else {
                    var output;

                    async.waterfall(tasks, { blocking: true }, function (err, results) {
                        if (err) {
                            logger.error({
                                message: 'Resolve failed for: ' + ctx.name,
                                err: err
                            });
                            output = err;
                            return;
                        }

                        logger.debug('Module resolved: ' + ctx.name);
                        output = results;
                    });

                    return output;
                }
            }

            /*
            // Checks to see if a module exists and returns a boolean result
            // @param moduleName (string): the qualified name that the module can be located by in the container
            // @returns true if the module exists, otherwise false
            */
            function exists (moduleName) {
                logger.debug('Checking if module exists: ' + moduleName);
                return context.container.exists(moduleName);
            }

            /*
            // Disposes a module, or all modules. When a moduleName is not passed
            // as an argument, the entire container is disposed.
            // @param moduleNames (string): The name of the module to dispose
            // @returns boolean: true if the object(s) were disposed, otherwise false
            */
            function dispose (moduleNames, callback) {
                var nameOrArr, cb;

                if (typeof moduleNames === 'function') {
                    logger.debug('Disposing all modules on scope, ' + self.name);
                    nameOrArr = null;
                    cb = moduleNames;
                } else {
                    logger.debug({
                        message: 'Disposing module(s) on scope, ' + self.name,
                        moduleNames: moduleNames
                    });
                    nameOrArr = moduleNames;
                    cb = callback;
                }


                return optionalAsync(function () {
                    var results;

                    if (is.array(nameOrArr)) {
                        results = context.container.dispose(nameOrArr).disposed.concat(
                            context.singletonContainer.dispose(nameOrArr).disposed
                        );

                        return {
                            result: results.length === nameOrArr.length,
                            disposed: results
                        };
                    }

                    return context.container.dispose(nameOrArr) ||
                        context.singletonContainer.dispose(nameOrArr);
                }, new Error(), cb);
            }

            /*
            // exposes the constructor for hilary so you can create
            // new scopes, and child scopes
            // @param options.name (string): a named scope
            //
            // @returns new Hilary scope with parent set to this (the current Hilary scope)
            */
            function scope (name, options, callback) {
                name = name || id.createUid(8);
                options = options || {};
                options.parent = self.context.scope === DEFAULT ?
                    getScopeName(options.parent) :
                    getScopeName(options.parent || self);

                if (scopes[name]) {
                    logger.debug('Returning existing scope: ' + name);
                } else {
                    logger.debug({
                        message: 'Creating new scope: ' + name,
                        options: options
                    });
                }

                return optionalAsync(function () {
                    return Api.scope(name, options);
                }, new Error(), callback);
            }

            /*
            // allows you to set a scopes parent container explicitly
            // @param options.utils (object): utilities to use for validation (i.e. isFunction)
            // @param options.exceptions (object): exception handling
            //
            // @returns new Hilary scope with parent set to this (the current Hilary scope)
            */
            function setParentScope (scope) {
                var name = getScopeName(scope);

                if (!name) {
                    logger.error('Unable to set the parent scope of, ' + self.context.scope + ', to: ' + name);
                    return new Exception({
                        type: locale.errorTypes.INVALID_ARG,
                        error: new Error(locale.api.PARENT_CONTAINER_ARG)
                    });
                }

                logger.debug('Setting the parent scope of, ' + self.context.scope + ', to: ' + name);
                context.parent = name;
                return  context;
            }

            function getScopeName (scope) {
                if (!scope) {
                    return null;
                } else if (is.string(scope)) {
                    return scope;
                } else if (scope.__isHilaryScope) {
                    return scope.context.scope;
                } else {
                    return null;
                }
            }

            function bootstrap (startupTasks, callback) {
                var tasks = [],
                    callbackExists = is.function(callback),
                    done;

                if (is.defined(startupTasks) && is.not.array(startupTasks)) {
                    tasks.push(function (next) {
                        next(new Exception({
                            type: locale.errorTypes.BOOTSTRAP_FAILED,
                            error: new Error(locale.bootstrap.TASKS_ARRAY)
                        }));
                    });
                }

                if (callbackExists) {
                    logger.trace('Using the callback argument for the bootstrapper for: ' + self.context.scope);
                    done = callback;
                } else {
                    logger.trace('A callback was not defined for the bootstrapper for: ' + self.context.scope);
                    done = function (err) {
                        if (err) {
                            logger.fatal(new Exception({
                                type: locale.errorTypes.BOOTSTRAP_FAILED,
                                error: err
                            }));
                        } else {
                            logger.trace('finished bootstrapping: ' + self.context.scope);
                        }
                    };
                }

                tasks.push(function start (next) {
                    logger.trace('bootstrapping hilary for: ' + self.context.scope);
                    next(null, self);
                });

                if (Array.isArray(startupTasks)) {
                    startupTasks.forEach(function (task) {
                        if (is.function(task)) {
                            tasks.push(task);
                        }
                    });
                }

                if (is.defined(startupTasks) && startupTasks.length > 0 && tasks.length === 1) {
                    tasks.push(function (scope, next) {
                        next(new Exception({
                            type: locale.errorTypes.BOOTSTRAP_FAILED,
                            error: new Error(locale.bootstrap.TASKS_ARRAY)
                        }));
                    });
                }

                if (tasks.length === 1) {
                    logger.trace('no task functions were found in the bootstrapper for: ' + self.context.scope);
                }

                return async.waterfall(tasks, done);
            }

            function optionalAsync(func, err, callback) {
                if (is.function(callback)) {
                    async.runAsync(function () {
                        var result = tryWith(func, err);

                        if (result.isException) {
                            callback(err);
                        } else {
                            callback(null, result);
                        }
                    });
                } else {
                    return tryWith(func, err);
                }
            }

            function tryWith(func, err) {
                try {
                    return func();
                } catch (e) {
                    err.message += '(' + e.message + ')';
                    err.cause = e;
                    logger.error({
                        message: e.message,
                        err: err
                    });
                    return {
                        err: err,
                        isException: true
                    };
                }
            }

            function Config (options) {
                var self = {};
                options = options || {};

                if (is.string(options)) {
                    self.scope = options;
                } else if (is.nullOrUndefined(options.scope)) {
                    if (is.string(options.name)) {
                        self.scope = options.name;
                    } else {
                        self.scope = id.createUid(8);
                    }
                }

                self.logging = options.logging || { level: 30 };

                if (is.string(options.parent)) {
                    self.parent = options.parent;
                } else if (options.parent && options.parent.__isHilaryScope) {
                    self.parent = options.parent.context.scope;
                }

                return self;
            } // /Config

            return self;
        }; // /Api

        Api.scope = function (name, options, seal) {
            seal = typeof seal !== 'boolean' ? true : seal;

            if (scopes[name]) {
                return scopes[name];
            } else {
                options = options || {};
                options.name = name;
                scopes[name] = new Api(options);

                if (seal) {
                    freeze(scopes[name]);
                }

                return scopes[name];
            }
        };

        defaultScope = Api.scope(DEFAULT, null, false);
        defaultScope.Context = Context;

        // REGISTER Default Modules
// TODO: should these be on the container, as well, since that is normal behavior?
        defaultScope.context.singletonContainer.register({ name: ASYNC,        factory: async });
        defaultScope.context.singletonContainer.register({ name: CONTEXT,      singleton: false, factory: function () { return defaultScope.context; } });
        defaultScope.context.singletonContainer.register({ name: IMMUTABLE,    factory: Immutable });
        defaultScope.context.singletonContainer.register({ name: IS,           factory: is });

        freeze(defaultScope);
        return defaultScope;
    } // /Api

    function freeze (scope) {
        Object.freeze(scope);
        Object.seal(scope.context);
        Object.seal(scope.context.container);
        Object.seal(scope.context.singletonContainer);
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
