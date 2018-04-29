/*! hilary 2018-04-29 */

(function(register) {
    "use strict";
    register({
        name: "locale",
        factory: {
            errorTypes: {
                INVALID_ARG: "InvalidArgument",
                INVALID_REGISTRATION: "InvalidRegistration",
                MODULE_NOT_FOUND: "ModuleNotFound",
                MODULE_NOT_RESOLVED: "ModuleNotResolved",
                BOOTSTRAP_FAILED: "BootstrapFailed"
            },
            container: {
                CONSUMER_REQUIRED: "A consumer function is required to `enumerate` over a container"
            },
            hilaryModule: {
                FACTORY_UNDEFINED: "This implementation does not satisfy blueprint, Hilary::HilaryModule. It should have the property, factory.",
                DEPENDENCIES_NO_FACTORY: "Dependencies were declared, but the factory is not a function, so they cannot be applied.",
                DEPENDENCY_FACTORY_MISMATCH: "The number of dependencies that were declared does not match the number of arguments that the factory accepts."
            },
            api: {
                REGISTER_ERR: "register failed. see cause for more information",
                REGISTER_ARG: "register expects either a hilary module, or an array of hilary modules as the first argument, but instead saw this: ",
                RESOLVE_ARG: "resolve expects a moduleName (string) as the first argument, but instead saw this: ",
                MODULE_NOT_FOUND: 'The module, "{{module}}", cannot be found',
                MODULE_NOT_FOUND_RELYING: ', and is a dependency of, "{{startingModule}}"',
                MODULE_THREW: 'The module, "{{module}}", cannot be resolved because it returned or threw an Error',
                REGISTRATION_BLACK_LIST: "A module was registered with a reserved name: ",
                PARENT_CONTAINER_ARG: "setParentScope expects the name of the parent scope, or an instance of Hilary"
            },
            bootstrap: {
                TASKS_ARRAY: "bootstrap expects the first argument to be an array of functions",
                INVALID_TASK_ARGUMENT: "The task expected a first argument of scope, and a callback as the second argument"
            }
        }
    });
})(function(registration) {
    "use strict";
    try {
        if (typeof module !== "undefined" && module.exports) {
            module.exports = registration.factory;
        } else if (typeof window !== "undefined") {
            window.__hilary = window.__hilary || {};
            window.__hilary[registration.name] = registration.factory;
        } else {
            throw new Error("[HILARY] Unkown runtime environment");
        }
    } catch (e) {
        var name = registration && registration.name ? registration.name : "MISSING NAME";
        var err = new Error("[HILARY] Registration failure: " + name);
        err.cause = e;
        throw err;
    }
});

(function(register) {
    "use strict";
    register({
        name: "Exception",
        factory: Exception
    });
    function Exception(input) {
        return {
            isException: true,
            type: input.type,
            error: normalizeError(input),
            messages: normalizeMessages(input),
            data: input.data
        };
    }
    function normalizeError(input) {
        if (typeof input.error === "object") {
            return input.error;
        } else if (typeof input.error === "string") {
            return new Error(input.error);
        } else {
            return new Error();
        }
    }
    function normalizeMessages(input) {
        if (Array.isArray(input.messages)) {
            return input.messages;
        } else if (typeof input.messages === "string") {
            return [ input.messages ];
        } else if (input.error && input.error.message) {
            return [ input.error.message ];
        } else {
            return [];
        }
    }
})(function(registration) {
    "use strict";
    try {
        if (typeof module !== "undefined" && module.exports) {
            module.exports = registration.factory;
        } else if (typeof window !== "undefined") {
            window.__hilary = window.__hilary || {};
            window.__hilary[registration.name] = registration.factory;
        } else {
            throw new Error("[HILARY] Unkown runtime environment");
        }
    } catch (e) {
        var name = registration && registration.name ? registration.name : "MISSING NAME";
        var err = new Error("[HILARY] Registration failure: " + name);
        err.cause = e;
        throw err;
    }
});

(function(register) {
    "use strict";
    register({
        name: "Container",
        factory: Container
    });
    function Container(locale, is, Immutable, Exception) {
        return function() {
            var container = {}, self = {
                get: get,
                register: register,
                resolve: resolve,
                exists: exists,
                enumerate: enumerate,
                dispose: dispose,
                disposeOne: disposeOne
            };
            function get() {
                return container;
            }
            function register(hilaryModule) {
                container[hilaryModule.name] = hilaryModule;
            }
            function resolve(name) {
                return container[name];
            }
            function exists(name) {
                if (is.regexp(name)) {
                    return true;
                }
                return container.hasOwnProperty(name);
            }
            function enumerate(consumer) {
                var prop;
                if (!is.function(consumer)) {
                    return new Exception({
                        type: locale.errorTypes.INVALID_ARG,
                        error: new Error(locale.container.CONSUMER_REQUIRED)
                    });
                }
                for (prop in container) {
                    if (container.hasOwnProperty(prop)) {
                        consumer(prop, container[prop]);
                    }
                }
            }
            function dispose(moduleName) {
                var key, i, tempResult, result, results = {
                    result: true,
                    disposed: []
                };
                if (is.string(moduleName)) {
                    return self.disposeOne(moduleName);
                } else if (is.array(moduleName)) {
                    for (i = 0; i < moduleName.length; i += 1) {
                        tempResult = self.disposeOne(moduleName[i]);
                        results.result = results.result && tempResult;
                        if (tempResult) {
                            results.disposed.push(moduleName[i]);
                        }
                    }
                    return results;
                } else if (!moduleName) {
                    result = true;
                    for (key in container) {
                        if (container.hasOwnProperty(key)) {
                            result = result && self.disposeOne(key);
                        }
                    }
                    return result;
                } else {
                    return false;
                }
            }
            function disposeOne(moduleName) {
                if (container[moduleName]) {
                    delete container[moduleName];
                    return true;
                } else {
                    return false;
                }
            }
            return self;
        };
    }
})(function(registration) {
    "use strict";
    try {
        if (typeof module !== "undefined" && module.exports) {
            module.exports = registration.factory;
        } else if (typeof window !== "undefined") {
            window.__hilary = window.__hilary || {};
            window.__hilary[registration.name] = registration.factory;
        } else {
            throw new Error("[HILARY] Unkown runtime environment");
        }
    } catch (e) {
        var name = registration && registration.name ? registration.name : "MISSING NAME";
        var err = new Error("[HILARY] Registration failure: " + name);
        err.cause = e;
        throw err;
    }
});

(function(register) {
    "use strict";
    register({
        name: "Context",
        factory: Context
    });
    function Context(Blueprint, Container, Exception, locale) {
        var IContext = new Blueprint({
            __blueprintId: "Hilary::Context",
            scope: "string",
            parent: {
                type: "string",
                required: false
            },
            container: {
                type: "object",
                required: false
            },
            singletonContainer: {
                type: "object",
                required: false
            }
        });
        return function Ctor(options) {
            var self = {};
            if (!IContext.validate(options).result) {
                return new Exception({
                    type: locale.errorTypes.INVALID_ARG,
                    messages: IContext.validate(options).errors
                });
            }
            setReadOnlyProperty(self, "scope", options.scope);
            self.parent = options.parent;
            setReadOnlyProperty(self, "container", options.container || new Container());
            setReadOnlyProperty(self, "singletonContainer", options.singletonContainer || new Container());
            return self;
        };
    }
    function setReadOnlyProperty(obj, name, value) {
        Object.defineProperty(obj, name, {
            enumerable: true,
            configurable: false,
            get: function() {
                return value;
            },
            set: function() {
                console.log(name + " is read only");
            }
        });
    }
})(function(registration) {
    "use strict";
    try {
        if (typeof module !== "undefined" && module.exports) {
            module.exports = registration.factory;
        } else if (typeof window !== "undefined") {
            window.__hilary = window.__hilary || {};
            window.__hilary[registration.name] = registration.factory;
        } else {
            throw new Error("[HILARY] Unkown runtime environment");
        }
    } catch (e) {
        var name = registration && registration.name ? registration.name : "MISSING NAME";
        var err = new Error("[HILARY] Registration failure: " + name);
        err.cause = e;
        throw err;
    }
});

(function(register) {
    "use strict";
    register({
        name: "HilaryModule",
        factory: HilaryModule
    });
    function HilaryModule(is, Blueprint, objectHelper, locale, Exception) {
        var IModule = new Blueprint({
            __blueprintId: "Hilary::HilaryModule",
            isHilaryModule: "boolean",
            name: "string",
            singleton: {
                type: "boolean",
                required: false
            },
            dependencies: {
                type: "array",
                required: false
            },
            factory: {
                validate: function(val, errors, input) {
                    if (is.not.defined(val)) {
                        errors.push(locale.hilaryModule.FACTORY_UNDEFINED);
                    } else if (is.not.function(val) && is.array(input.dependencies) && input.dependencies.length) {
                        errors.push(locale.hilaryModule.DEPENDENCIES_NO_FACTORY);
                    } else if (is.function(val) && is.array(input.dependencies) && input.dependencies.length && val.length !== input.dependencies.length) {
                        errors.push(locale.hilaryModule.DEPENDENCY_FACTORY_MISMATCH);
                    }
                }
            }
        });
        return function(input) {
            input = input || {};
            input.isHilaryModule = true;
            input.singleton = is.boolean(input.singleton) ? input.singleton : true;
            if (is.not.defined(input.dependencies) && is.function(input.factory)) {
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
})(function(registration) {
    "use strict";
    try {
        if (typeof module !== "undefined" && module.exports) {
            module.exports = registration.factory;
        } else if (typeof window !== "undefined") {
            window.__hilary = window.__hilary || {};
            window.__hilary[registration.name] = registration.factory;
        } else {
            throw new Error("[HILARY] Unkown runtime environment");
        }
    } catch (e) {
        var name = registration && registration.name ? registration.name : "MISSING NAME";
        var err = new Error("[HILARY] Registration failure: " + name);
        err.cause = e;
        throw err;
    }
});

(function(register) {
    "use strict";
    register({
        name: "Logger",
        factory: Logger
    });
    function Logger(is) {
        return function(options) {
            var log = makeLogHandler(new Options(options));
            return {
                trace: function() {
                    log(10, arguments);
                },
                debug: function() {
                    log(20, arguments);
                },
                info: function() {
                    log(30, arguments);
                },
                warn: function() {
                    log(40, arguments);
                },
                error: function() {
                    log(50, arguments);
                },
                fatal: function() {
                    log(60, arguments);
                }
            };
        };
        function Options(options) {
            var level, log, printer;
            if (typeof options === "string") {
                options = {};
            } else {
                options = options || {};
            }
            options.logging = options.logging || {};
            if (options.logging.level && is.string(options.logging.level)) {
                switch (options.logging.level) {
                  case "debug":
                    level = 20;
                    break;

                  case "info":
                    level = 30;
                    break;

                  case "warn":
                    level = 40;
                    break;

                  case "error":
                    level = 50;
                    break;

                  case "fatal":
                    level = 60;
                    break;

                  case "off":
                    level = 70;
                    break;

                  default:
                    level = 10;
                    break;
                }
            } else if (options.logging.level && is.number(options.logging.level) && options.logging.level > 0 && options.logging.level <= 70) {
                level = options.logging.level;
            } else {
                level = 30;
            }
            log = is.function(options.logging.log) ? options.logging.log : null;
            printer = is.function(options.logging.printer) ? options.logging.printer : null;
            return {
                level: level,
                log: log,
                printer: printer
            };
        }
        function makeLogHandler(options) {
            if (options.log) {
                return function(level, entry) {
                    return options.log(level, new Entry(entry[0]));
                };
            } else if (options.printer) {
                return function(level, entry) {
                    if (level < options.level) {
                        return;
                    }
                    return options.printer(new Entry(entry[0]));
                };
            } else {
                return function(level, entry) {
                    var printer;
                    if (level < options.level) {
                        return;
                    }
                    switch (level) {
                      case 60:
                        printer = console.error || console.log;
                        break;

                      case 50:
                        printer = console.error || console.log;
                        break;

                      case 40:
                        printer = console.warn || console.log;
                        break;

                      default:
                        printer = console.log;
                        break;
                    }
                    printer.apply(null, new Entry(entry));
                };
            }
        }
        function Entry(entry) {
            if (is.string(entry)) {
                return {
                    message: entry
                };
            }
            return entry;
        }
    }
})(function(registration) {
    "use strict";
    try {
        if (typeof module !== "undefined" && module.exports) {
            module.exports = registration.factory;
        } else if (typeof window !== "undefined") {
            window.__hilary = window.__hilary || {};
            window.__hilary[registration.name] = registration.factory;
        } else {
            throw new Error("[HILARY] Unkown runtime environment");
        }
    } catch (e) {
        var name = registration && registration.name ? registration.name : "MISSING NAME";
        var err = new Error("[HILARY] Registration failure: " + name);
        err.cause = e;
        throw err;
    }
});

(function(register) {
    "use strict";
    register({
        name: "ResolveTasks",
        factory: ResolveTasks
    });
    function ResolveTasks(async, is, locale, Exception) {
        return function Ctor(context, logger, resolve) {
            return {
                validateModuleName: validateModuleName,
                findModule: findModule,
                findDegraded: findDegraded,
                resolveDependencies: resolveDependencies,
                reduceMembers: reduceMembers,
                optionallyRegisterSingleton: optionallyRegisterSingleton,
                bindToOutput: bindToOutput,
                filterMatchingRegistrations: filterMatchingRegistrations
            };
            function validateModuleName(ctx, next) {
                if (is.string(ctx.name)) {
                    logger.trace("module name is valid: " + ctx.name);
                    next(null, ctx);
                } else {
                    logger.error("module name is INVALID: " + ctx.name);
                    next(new Exception({
                        type: locale.errorTypes.INVALID_ARG,
                        error: new Error(locale.api.RESOLVE_ARG + JSON.stringify(ctx.name))
                    }));
                }
            }
            function findModule(ctx, next) {
                var parsed = parseDependencyName(ctx.name);
                if (context.singletonContainer.exists(ctx.name)) {
                    logger.trace("found singleton for: " + ctx.name);
                    ctx.resolved = context.singletonContainer.resolve(ctx.name).factory;
                    ctx.isResolved = true;
                    ctx.registerSingleton = false;
                    return next(null, ctx);
                } else if (parsed.members.length && context.container.exists(parsed.name)) {
                    logger.trace("found factory for: " + ctx.name);
                    ctx.theModule = context.container.resolve(parsed.name);
                    ctx.members = parsed.members;
                    return next(null, ctx);
                } else if (context.container.exists(ctx.name)) {
                    logger.trace("found factory for: " + ctx.name);
                    ctx.theModule = context.container.resolve(ctx.name);
                    return next(null, ctx);
                } else {
                    logger.trace("module not found: " + ctx.name);
                    ctx.parsedName = parsed.name;
                    ctx.members = parsed.members;
                    return next(makeNotFoundException(ctx));
                }
            }
            function findDegraded(ctx, next) {
                var result = gracefullyDegrade(ctx.parsedName);
                if (result) {
                    logger.trace("found module (via degrade) for: " + ctx.name);
                    ctx.resolved = result;
                    ctx.isResolved = true;
                    ctx.registerSingleton = ctx.members.length > 0;
                    return next(null, ctx);
                } else {
                    return next(makeNotFoundException(ctx));
                }
            }
            function filterMatchingRegistrations(item, scopeContext, moduleNameBeingResolved) {
                return Object.keys(scopeContext.singletonContainer.get()).concat(Object.keys(scopeContext.container.get())).reduce(function(distinct, name) {
                    if (distinct.indexOf(name) === -1) {
                        distinct.push(name);
                    }
                    return distinct;
                }, []).filter(function(key) {
                    return key !== moduleNameBeingResolved && item.test(key);
                });
            }
            function makeDependencyResolveTask(item) {
                return function(dependencies, relyingModuleName, cb) {
                    var dependency = resolve(item, relyingModuleName);
                    if (!dependency) {
                        logger.trace("the following dependency was not resolved: " + item);
                        return cb(null, dependencies, relyingModuleName);
                    } else if (dependency.isException || dependency instanceof Error) {
                        logger.error("the following dependency returned an exception: " + item);
                        return cb(dependency);
                    }
                    logger.trace("the following dependency was resolved: " + item);
                    dependencies.push(dependency);
                    cb(null, dependencies, relyingModuleName);
                };
            }
            function makeDependencyArrayResolveTask(items, ctx) {
                const subTasks = items.map(makeDependencyResolveTask);
                subTasks.unshift(function(cb) {
                    cb(null, [], ctx.relyingName);
                });
                return function(dependencies, relyingModuleName, cb) {
                    async.waterfall(subTasks, {
                        blocking: true
                    }, function(err, resolved) {
                        if (err) {
                            return cb(err);
                        }
                        dependencies.push(resolved);
                        return cb(null, dependencies, relyingModuleName);
                    });
                };
            }
            function recursivelyResolveDependencies(ctx, next) {
                var subTasks = ctx.theModule.dependencies.reduce(function(tasks, item) {
                    if (is.regexp(item)) {
                        var dependencies = filterMatchingRegistrations(item, context, ctx.name);
                        tasks = tasks.concat(makeDependencyArrayResolveTask(dependencies, ctx));
                        return tasks;
                    }
                    tasks.push(makeDependencyResolveTask(item));
                    return tasks;
                }, []);
                subTasks.unshift(function(cb) {
                    cb(null, [], ctx.relyingName);
                });
                return async.waterfall(subTasks, {
                    blocking: true
                }, function(err, dependencies) {
                    if (err) {
                        logger.trace({
                            message: "at least one dependency was not found for: " + ctx.name,
                            err: err
                        });
                        return next(err);
                    }
                    ctx.resolved = invoke(ctx.theModule.name, ctx.theModule.factory, dependencies);
                    ctx.registerSingleton = ctx.theModule.singleton;
                    ctx.isResolved = true;
                    logger.trace("dependencies resolved for: " + ctx.name);
                    next(null, ctx);
                });
            }
            function resolveDependencies(ctx, next) {
                logger.trace("resolving dependencies for: " + ctx.name);
                if (ctx.isResolved) {
                    return next(null, ctx);
                } else if (is.array(ctx.theModule.dependencies) && ctx.theModule.dependencies.length > 0) {
                    logger.trace("resolving with dependencies array: " + ctx.theModule.dependencies.join(", "));
                    return recursivelyResolveDependencies(ctx, next);
                } else if (is.function(ctx.theModule.factory) && ctx.theModule.factory.length === 0) {
                    logger.trace("the factory is a function and takes no arguments, returning the result of executing it: " + ctx.name);
                    ctx.resolved = invoke(ctx.theModule.name, ctx.theModule.factory);
                } else {
                    logger.trace("the factory takes arguments and has no dependencies, returning the function as-is: " + ctx.name);
                    ctx.resolved = ctx.theModule.factory;
                }
                ctx.registerSingleton = ctx.theModule.singleton;
                ctx.isResolved = true;
                next(null, ctx);
            }
            function reduceMembers(ctx, next) {
                var reduced;
                if (!ctx.members.length) {
                    return next(null, ctx);
                }
                if (ctx.members.length === 1) {
                    if (!ctx.resolved.hasOwnProperty(ctx.members[0].member)) {
                        logger.trace("the following dependency was NOT reduced to chosen members: " + ctx.name);
                    }
                    logger.trace("the following dependency was reduced to chosen members: " + ctx.name);
                    ctx.resolved = ctx.resolved[ctx.members[0].member];
                    return next(null, ctx);
                }
                reduced = {};
                ctx.members.forEach(function(item) {
                    reduced[item.alias] = ctx.resolved[item.member];
                });
                logger.trace("the following dependency was reduced to chosen members: " + ctx.name);
                ctx.resolved = reduced;
                return next(null, ctx);
            }
            function optionallyRegisterSingleton(ctx, next) {
                if (ctx.registerSingleton) {
                    logger.trace("registering the resolved module as a singleton: " + ctx.name);
                    context.singletonContainer.register({
                        name: ctx.name,
                        factory: ctx.resolved
                    });
                    logger.trace("removing the resolved module registration: " + ctx.name);
                    context.container.dispose(ctx.name);
                }
                next(null, ctx);
            }
            function bindToOutput(ctx, next) {
                logger.trace("binding the module to the output: " + ctx.name);
                next(null, ctx.resolved);
            }
            function makeNotFoundException(ctx) {
                var message = locale.api.MODULE_NOT_FOUND.replace("{{module}}", ctx.name);
                if (ctx.name !== ctx.relyingName) {
                    message += locale.api.MODULE_NOT_FOUND_RELYING.replace("{{startingModule}}", ctx.relyingName);
                }
                return new Exception({
                    type: locale.errorTypes.MODULE_NOT_FOUND,
                    error: new Error(message),
                    data: {
                        moduleName: ctx.name,
                        relyingModuleName: ctx.relyingName
                    }
                });
            }
        };
        function invoke(name, factory, args) {
            try {
                if (isConstructor(factory)) {
                    if (args) {
                        args = [ null ].concat(args);
                    } else {
                        args = [ null ];
                    }
                    return new (Function.prototype.bind.apply(factory, args))();
                } else {
                    return factory.apply(null, args);
                }
            } catch (e) {
                return new Exception({
                    type: locale.errorTypes.MODULE_NOT_RESOLVED,
                    messages: [ locale.api.MODULE_THREW.replace(/{{module}}/, name), e.message ],
                    error: e
                });
            }
        }
    }
    function parseDependencyName(dependencyName) {
        var memberMatches = /\{([^}]+)\}/.exec(dependencyName), members = [];
        if (memberMatches) {
            dependencyName = dependencyName.split("{")[0].trim();
            members = memberMatches[1].split(",").map(function(item) {
                var member = item.trim(), withAlias = member.split(" ");
                if (withAlias.length === 3 && withAlias[1].toLowerCase() === "as") {
                    return {
                        member: withAlias[0],
                        alias: withAlias[2]
                    };
                } else {
                    return {
                        member: member,
                        alias: member
                    };
                }
            });
        }
        return {
            name: dependencyName,
            members: members
        };
    }
    function gracefullyDegrade(moduleName) {
        if (typeof module !== "undefined" && module.exports && require) {
            try {
                if (require.main && typeof require.main.require === "function") {
                    return require.main.require(moduleName);
                } else {
                    return require(moduleName);
                }
            } catch (e) {
                return null;
            }
        } else if (typeof window !== "undefined") {
            return window[moduleName];
        }
    }
    function isConstructor(func) {
        try {
            new func();
            return true;
        } catch (e) {
            if (e.message.indexOf("is not a constructor")) {
                return false;
            }
        }
    }
})(function(registration) {
    "use strict";
    try {
        if (typeof module !== "undefined" && module.exports) {
            module.exports = registration.factory;
        } else if (typeof window !== "undefined") {
            window.__hilary = window.__hilary || {};
            window.__hilary[registration.name] = registration.factory;
        } else {
            throw new Error("[HILARY] Unkown runtime environment");
        }
    } catch (e) {
        var name = registration && registration.name ? registration.name : "MISSING NAME";
        var err = new Error("[HILARY] Registration failure: " + name);
        err.cause = e;
        throw err;
    }
});

(function(register) {
    "use strict";
    var ASYNC = "polyn::async", CONTEXT = "hilary::context", IMMUTABLE = "polyn::Immutable", IS = "polyn::is", DEFAULT = "default";
    register({
        name: "HilaryApi",
        factory: HilaryApi
    });
    function HilaryApi(async, is, id, Immutable, locale, Logger, Exception, Context, HilaryModule, ResolveTasks) {
        var Api, scopes = {}, defaultScope;
        Api = function(options) {
            var self, logger = new Logger(options), config = new Config(options), context, resolveTasks;
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
            Object.defineProperty(self, "name", {
                enumerable: false,
                configurable: false,
                get: function() {
                    return self.context.scope;
                },
                set: function() {
                    logger.warn(name + " is read only");
                }
            });
            scopes[config.scope] = self;
            function register(moduleOrArray, callback) {
                var err = new Error(locale.api.REGISTER_ERR);
                if (is.object(moduleOrArray)) {
                    logger.trace({
                        message: "Registering a single module",
                        module: moduleOrArray
                    });
                    return registerOne(moduleOrArray, err, callback);
                } else if (is.array(moduleOrArray)) {
                    logger.trace({
                        message: "Registering an array of modules",
                        modules: moduleOrArray
                    });
                    return optionalAsync(function() {
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
                        message: "Registration failed",
                        exception: exc
                    });
                    if (is.function(callback)) {
                        callback(exc);
                    }
                    return exc;
                }
            }
            function registerOne(input, err, callback) {
                var tasks = [];
                if (self.name === DEFAULT && input && input.scope && input.scope !== DEFAULT) {
                    return self.scope(input.scope).register(input, callback);
                }
                tasks.push(function bind(next) {
                    var hilaryModule = new HilaryModule(input);
                    if (hilaryModule.isException) {
                        logger.error({
                            message: "Invalid registration model",
                            module: hilaryModule
                        });
                        return next(new Exception({
                            type: locale.errorTypes.INVALID_REGISTRATION,
                            error: new Error(hilaryModule.error.message),
                            messages: hilaryModule.messages,
                            data: input
                        }));
                    } else {
                        logger.trace("Successfully bound to HilaryModule: " + hilaryModule.name);
                        return next(null, hilaryModule);
                    }
                });
                tasks.push(function addToContainer(hilaryModule, next) {
                    context.container.register(hilaryModule);
                    logger.trace("Module registered on container: " + hilaryModule.name);
                    next(null, hilaryModule);
                });
                if (is.function(callback)) {
                    return async.waterfall(tasks, function(err, hilaryModule) {
                        if (err) {
                            logger.error({
                                message: "Registration failed",
                                input: input,
                                err: err
                            });
                            return callback(err);
                        }
                        logger.debug("Registration success: " + hilaryModule.name);
                        callback(err, hilaryModule);
                    });
                } else {
                    var output;
                    async.waterfall(tasks, {
                        blocking: true
                    }, function(err, hilaryModule) {
                        if (err) {
                            logger.error({
                                message: "Registration failed",
                                input: input,
                                err: err
                            });
                            output = err;
                            return;
                        }
                        logger.debug("Registration success: " + hilaryModule.name);
                        output = hilaryModule;
                    });
                    return output;
                }
            }
            function makeRegistrationTask(moduleOrArray) {
                logger.trace({
                    message: "Making a registration task",
                    module: moduleOrArray
                });
                return function(scope, done) {
                    var err;
                    if (!scope || !scope.__isHilaryScope || is.not.function(done)) {
                        err = new Error(locale.bootstrap.INVALID_TASK_ARGUMENT);
                        logger.error({
                            message: locale.bootstrap.INVALID_TASK_ARGUMENT,
                            err: err
                        });
                        return arguments[arguments.length - 1](new Exception({
                            type: locale.errorTypes.INVALID_REGISTRATION,
                            error: err,
                            messages: [ locale.bootstrap.INVALID_TASK_ARGUMENT ],
                            data: moduleOrArray
                        }));
                    }
                    register(moduleOrArray, function(err) {
                        if (err) {
                            return done(err);
                        }
                        done(null, scope);
                    });
                };
            }
            function resolve(moduleName, callback) {
                logger.trace("resolving: " + moduleName);
                if (is.regexp(moduleName)) {
                    var modules = resolveTasks.filterMatchingRegistrations(moduleName, context).map(function(moduleNameText) {
                        return resolveOne(moduleNameText, moduleNameText);
                    });
                    if (is.function(callback)) {
                        callback(null, modules);
                    } else {
                        return modules;
                    }
                }
                return resolveOne(moduleName, moduleName, callback);
            }
            function resolveOne(moduleName, relyingModuleName, callback) {
                var ctx = {
                    name: moduleName,
                    relyingName: relyingModuleName,
                    theModule: undefined,
                    resolved: undefined,
                    isResolved: false,
                    registerSingleton: true,
                    members: []
                }, tasks = [];
                tasks.push(function(next) {
                    next(null, ctx);
                });
                tasks.push(resolveTasks.validateModuleName);
                tasks.push(resolveTasks.findModule);
                tasks.push(resolveTasks.resolveDependencies);
                tasks.push(resolveTasks.reduceMembers);
                tasks.push(resolveTasks.optionallyRegisterSingleton);
                tasks.push(resolveTasks.bindToOutput);
                if (is.function(callback)) {
                    async.waterfall(tasks, function(err, results) {
                        if (err && err.type === locale.errorTypes.MODULE_NOT_FOUND && context.parent && scopes[context.parent]) {
                            logger.trace("Attempting to resolve the module, " + ctx.name + ", on the parent scope: " + context.parent);
                            return scopes[context.parent].resolve(moduleName, callback);
                        } else if (err && err.type === locale.errorTypes.MODULE_NOT_FOUND) {
                            logger.trace("Attempting to gracefully degrade, " + ctx.name);
                            return resolveDegraded(ctx, callback);
                        }
                        if (err) {
                            logger.error({
                                message: "Resolve failed for: " + ctx.name,
                                err: err
                            });
                            return callback(err);
                        }
                        logger.debug("Module resolved: " + ctx.name);
                        callback(null, results);
                    });
                } else {
                    var output;
                    async.waterfall(tasks, {
                        blocking: true
                    }, function(err, results) {
                        if (err && err.type === locale.errorTypes.MODULE_NOT_FOUND && context.parent && scopes[context.parent]) {
                            logger.trace("Attempting to resolve the module, " + ctx.name + ", on the parent scope: " + context.parent);
                            output = scopes[context.parent].resolve(moduleName);
                            return;
                        } else if (err && err.type === locale.errorTypes.MODULE_NOT_FOUND) {
                            logger.trace("Attempting to gracefully degrade, " + ctx.name);
                            output = resolveDegraded(ctx);
                            return;
                        }
                        if (err) {
                            logger.error({
                                message: "Resolve failed for: " + ctx.name,
                                err: err
                            });
                            output = err;
                            return;
                        }
                        logger.debug("Module resolved: " + ctx.name);
                        output = results;
                    });
                    return output;
                }
            }
            function resolveDegraded(ctx, callback) {
                var tasks = [];
                tasks.push(function(next) {
                    next(null, ctx);
                });
                tasks.push(resolveTasks.findDegraded);
                tasks.push(resolveTasks.reduceMembers);
                tasks.push(resolveTasks.optionallyRegisterSingleton);
                tasks.push(resolveTasks.bindToOutput);
                if (is.function(callback)) {
                    async.waterfall(tasks, function(err, results) {
                        if (err) {
                            logger.error({
                                message: "Resolve failed for: " + ctx.name,
                                err: err
                            });
                            return callback(err);
                        }
                        logger.debug("Module resolved: " + ctx.name);
                        callback(null, results);
                    });
                } else {
                    var output;
                    async.waterfall(tasks, {
                        blocking: true
                    }, function(err, results) {
                        if (err) {
                            logger.error({
                                message: "Resolve failed for: " + ctx.name,
                                err: err
                            });
                            output = err;
                            return;
                        }
                        logger.debug("Module resolved: " + ctx.name);
                        output = results;
                    });
                    return output;
                }
            }
            function exists(moduleName) {
                logger.debug("Checking if module exists: " + moduleName);
                return context.container.exists(moduleName);
            }
            function dispose(moduleNames, callback) {
                var nameOrArr, cb;
                if (typeof moduleNames === "function") {
                    logger.debug("Disposing all modules on scope, " + self.name);
                    nameOrArr = null;
                    cb = moduleNames;
                } else {
                    logger.debug({
                        message: "Disposing module(s) on scope, " + self.name,
                        moduleNames: moduleNames
                    });
                    nameOrArr = moduleNames;
                    cb = callback;
                }
                return optionalAsync(function() {
                    var results;
                    if (is.array(nameOrArr)) {
                        results = context.container.dispose(nameOrArr).disposed.concat(context.singletonContainer.dispose(nameOrArr).disposed);
                        return {
                            result: results.length === nameOrArr.length,
                            disposed: results
                        };
                    }
                    return context.container.dispose(nameOrArr) || context.singletonContainer.dispose(nameOrArr);
                }, new Error(), cb);
            }
            function scope(name, options, callback) {
                name = name || id.createUid(8);
                options = options || {};
                options.parent = self.context.scope === DEFAULT ? getScopeName(options.parent) : getScopeName(options.parent || self);
                if (scopes[name]) {
                    logger.debug("Returning existing scope: " + name);
                } else {
                    logger.debug({
                        message: "Creating new scope: " + name,
                        options: options
                    });
                }
                return optionalAsync(function() {
                    return Api.scope(name, options);
                }, new Error(), callback);
            }
            function setParentScope(scope) {
                var name = getScopeName(scope);
                if (!name) {
                    logger.error("Unable to set the parent scope of, " + self.context.scope + ", to: " + name);
                    return new Exception({
                        type: locale.errorTypes.INVALID_ARG,
                        error: new Error(locale.api.PARENT_CONTAINER_ARG)
                    });
                }
                logger.debug("Setting the parent scope of, " + self.context.scope + ", to: " + name);
                context.parent = name;
                return context;
            }
            function getScopeName(scope) {
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
            function bootstrap(startupTasks, callback) {
                var tasks = [], callbackExists = is.function(callback), done;
                if (is.defined(startupTasks) && is.not.array(startupTasks)) {
                    tasks.push(function(next) {
                        next(new Exception({
                            type: locale.errorTypes.BOOTSTRAP_FAILED,
                            error: new Error(locale.bootstrap.TASKS_ARRAY)
                        }));
                    });
                }
                if (callbackExists) {
                    logger.trace("Using the callback argument for the bootstrapper for: " + self.context.scope);
                    done = callback;
                } else {
                    logger.trace("A callback was not defined for the bootstrapper for: " + self.context.scope);
                    done = function(err) {
                        if (err) {
                            logger.fatal(new Exception({
                                type: locale.errorTypes.BOOTSTRAP_FAILED,
                                error: err
                            }));
                        } else {
                            logger.trace("finished bootstrapping: " + self.context.scope);
                        }
                    };
                }
                tasks.push(function start(next) {
                    logger.trace("bootstrapping hilary for: " + self.context.scope);
                    next(null, self);
                });
                if (Array.isArray(startupTasks)) {
                    startupTasks.forEach(function(task) {
                        if (is.function(task)) {
                            tasks.push(task);
                        }
                    });
                }
                if (is.defined(startupTasks) && startupTasks.length > 0 && tasks.length === 1) {
                    tasks.push(function(scope, next) {
                        next(new Exception({
                            type: locale.errorTypes.BOOTSTRAP_FAILED,
                            error: new Error(locale.bootstrap.TASKS_ARRAY)
                        }));
                    });
                }
                if (tasks.length === 1) {
                    logger.trace("no task functions were found in the bootstrapper for: " + self.context.scope);
                }
                return async.waterfall(tasks, done);
            }
            function optionalAsync(func, err, callback) {
                if (is.function(callback)) {
                    async.runAsync(function() {
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
                    err.message += "(" + e.message + ")";
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
            function Config(options) {
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
                self.logging = options.logging || {
                    level: 30
                };
                if (is.string(options.parent)) {
                    self.parent = options.parent;
                } else if (options.parent && options.parent.__isHilaryScope) {
                    self.parent = options.parent.context.scope;
                }
                return self;
            }
            return self;
        };
        Api.scope = function(name, options, seal) {
            seal = typeof seal !== "boolean" ? true : seal;
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
        defaultScope.context.singletonContainer.register({
            name: ASYNC,
            factory: async
        });
        defaultScope.context.singletonContainer.register({
            name: CONTEXT,
            singleton: false,
            factory: function() {
                return defaultScope.context;
            }
        });
        defaultScope.context.singletonContainer.register({
            name: IMMUTABLE,
            factory: Immutable
        });
        defaultScope.context.singletonContainer.register({
            name: IS,
            factory: is
        });
        freeze(defaultScope);
        return defaultScope;
    }
    function freeze(scope) {
        Object.freeze(scope);
        Object.seal(scope.context);
        Object.seal(scope.context.container);
        Object.seal(scope.context.singletonContainer);
    }
})(function(registration) {
    "use strict";
    try {
        if (typeof module !== "undefined" && module.exports) {
            module.exports = registration.factory;
        } else if (typeof window !== "undefined") {
            window.__hilary = window.__hilary || {};
            window.__hilary[registration.name] = registration.factory;
        } else {
            throw new Error("[HILARY] Unkown runtime environment");
        }
    } catch (e) {
        var name = registration && registration.name ? registration.name : "MISSING NAME";
        var err = new Error("[HILARY] Registration failure: " + name);
        err.cause = e;
        throw err;
    }
});

if (typeof window !== "undefined") {
    if (!window.polyn) {
        throw new Error("[HILARY] Hilary depends on polyn. Make sure it is included before loading Hilary (https://github.com/losandes/polyn)");
    } else if (!window.__hilary) {
        throw new Error("[HILARY] Hilary modules were loaded out of order");
    }
    (function(polyn, __hilary, window) {
        "use strict";
        var locale = __hilary.locale, Exception = __hilary.Exception, Container = __hilary.Container(locale, polyn.is, polyn.Immutable, Exception), Context = __hilary.Context(polyn.Immutable, Container), HilaryModule = __hilary.HilaryModule(polyn.is, polyn.Blueprint, polyn.objectHelper, locale, Exception), Logger = __hilary.Logger(polyn.is), ResolveTasks = __hilary.ResolveTasks(polyn.async, polyn.is, locale, Exception);
        polyn.Blueprint.configure({
            compatibility: "2017-03-20"
        });
        window.hilary = __hilary.HilaryApi(polyn.async, polyn.is, polyn.id, polyn.Immutable, locale, Logger, Exception, Context, HilaryModule, ResolveTasks);
    })(window.polyn, window.__hilary, window);
} else if (typeof module !== "undefined" && module.exports) {
    var polyn = require("polyn"), locale = require("./locale"), Exception = require("./Exception"), Container = require("./Container")(locale, polyn.is, polyn.Immutable, Exception), Context = require("./Context")(polyn.Blueprint, Container, Exception, locale), HilaryModule = require("./HilaryModule")(polyn.is, polyn.Blueprint, polyn.objectHelper, locale, Exception), Logger = require("./Logger")(polyn.is), ResolveTasks = require("./ResolveTasks")(polyn.async, polyn.is, locale, Exception), hilary = require("./HilaryApi")(polyn.async, polyn.is, polyn.id, polyn.Immutable, locale, Logger, Exception, Context, HilaryModule, ResolveTasks);
    polyn.Blueprint.configure({
        compatibility: "2017-03-20"
    });
    module.exports = hilary;
} else {
    throw new Error("[HILARY] Unkown runtime environment");
}