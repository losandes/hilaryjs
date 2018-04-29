(function (register) {
    'use strict';

    register({
        name: 'ResolveTasks',
        factory: ResolveTasks
    });

    function ResolveTasks (async, is, locale, Exception) {

        return function Ctor (context, logger, resolve) {
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


            function validateModuleName (ctx, next) {
                if (is.string(ctx.name)) {
                    logger.trace('module name is valid: ' + ctx.name);
                    next(null, ctx);
                } else {
                    logger.error('module name is INVALID: ' + ctx.name);
                    next(new Exception({
                        type: locale.errorTypes.INVALID_ARG,
                        error: new Error(locale.api.RESOLVE_ARG + JSON.stringify(ctx.name))
                    }));
                }
            } // /validateModuleName

            function findModule (ctx, next) {
                var parsed = parseDependencyName(ctx.name);

                if (context.singletonContainer.exists(ctx.name)) {
                    // singleton exists
                    logger.trace('found singleton for: ' + ctx.name);
                    ctx.resolved = context.singletonContainer
                        .resolve(ctx.name)
                        .factory;
                    ctx.isResolved = true;
                    ctx.registerSingleton = false;
                    return next(null, ctx);
                } else if (parsed.members.length && context.container.exists(parsed.name)) {
                    // registration exists, and we're being asked for a subset of its members
                    logger.trace('found factory for: ' + ctx.name);
                    ctx.theModule = context.container.resolve(parsed.name);
                    ctx.members = parsed.members;
                    return next(null, ctx);
                } else if (context.container.exists(ctx.name)) {
                    // registration exists
                    logger.trace('found factory for: ' + ctx.name);
                    ctx.theModule = context.container.resolve(ctx.name);
                    return next(null, ctx);
                } else {
                    // module not found
                    logger.trace('module not found: ' + ctx.name);
                    ctx.parsedName = parsed.name;
                    ctx.members = parsed.members;
                    return next(makeNotFoundException(ctx));
                }
            } // /findModule

            function findDegraded (ctx, next) {
                var result = gracefullyDegrade(ctx.parsedName);

                if (result) {
                    // singleton exists
                    logger.trace('found module (via degrade) for: ' + ctx.name);
                    ctx.resolved = result;
                    ctx.isResolved = true;
                    ctx.registerSingleton = ctx.members.length > 0;
                    return next(null, ctx);
                } else {
                    return next(makeNotFoundException(ctx));
                }
            }

            function filterMatchingRegistrations (item, scopeContext, moduleNameBeingResolved) {
                return Object.keys(scopeContext.singletonContainer.get())
                    .concat(Object.keys(scopeContext.container.get()))
                    .reduce(function (distinct, name) {
                        if (distinct.indexOf(name) === -1) {
                            distinct.push(name);
                        }

                        return distinct;
                    }, [])
                    .filter(function (key) {
                        return key !== moduleNameBeingResolved &&   // isn't the module that is being resolve (stack overflow)
                            item.test(key);                         // dependency matches expression
                    });
            }

            function makeDependencyResolveTask (item) {
                return function (dependencies, relyingModuleName, cb) {
                    var dependency = resolve(item, relyingModuleName);

                    if (!dependency) {
                        // short circuit
                        logger.trace('the following dependency was not resolved: ' + item);
                        return cb(null, dependencies, relyingModuleName);
                    } else if (dependency.isException || dependency instanceof Error) {
                        // short circuit
                        logger.error('the following dependency returned an exception: ' + item);
                        return cb(dependency);
                    }

                    logger.trace('the following dependency was resolved: ' + item);
                    dependencies.push(dependency);
                    cb(null, dependencies, relyingModuleName);
                };
            }

            function makeDependencyArrayResolveTask (items, ctx) {
                const subTasks = items.map(makeDependencyResolveTask);
                subTasks.unshift(function (cb) {
                    cb(null, [], ctx.relyingName);
                });

                return function (dependencies, relyingModuleName, cb) {
                    async.waterfall(subTasks, { blocking: true }, function (err, resolved) {
                        if (err) {
                            return cb(err);
                        }

                        dependencies.push(resolved);
                        return cb(null, dependencies, relyingModuleName);
                    });
                }
            }

            function recursivelyResolveDependencies (ctx, next) {
                var subTasks = ctx.theModule.dependencies.reduce(function (tasks, item) {
                    if (is.regexp(item)) {
                        var dependencies = filterMatchingRegistrations(item, context, ctx.name);
                        tasks = tasks.concat(makeDependencyArrayResolveTask(dependencies, ctx));
                        return tasks;
                    }

                    tasks.push(makeDependencyResolveTask(item));
                    return tasks;
                }, []);

                subTasks.unshift(function (cb) {
                    cb(null, [], ctx.relyingName);
                });

                return async.waterfall(subTasks, { blocking: true }, function (err, dependencies) {
                    if (err) {
                        logger.trace({
                            message: 'at least one dependency was not found for: ' + ctx.name,
                            err: err
                        });
                        return next(err);
                    }

                    ctx.resolved = invoke(ctx.theModule.name, ctx.theModule.factory, dependencies);
                    ctx.registerSingleton = ctx.theModule.singleton;
                    ctx.isResolved = true;

                    logger.trace('dependencies resolved for: ' + ctx.name);
                    next(null, ctx);
                });
            }

            function resolveDependencies (ctx, next) {
                logger.trace('resolving dependencies for: ' + ctx.name);

                if (ctx.isResolved) {
                    // this was a singleton that has been resolved before
                    return next(null, ctx);
                } else if (is.array(ctx.theModule.dependencies) && ctx.theModule.dependencies.length > 0) {
                    logger.trace('resolving with dependencies array: ' + ctx.theModule.dependencies.join(', '));
                    return recursivelyResolveDependencies(ctx, next);
                } else if (is.function(ctx.theModule.factory) && ctx.theModule.factory.length === 0) {
                    logger.trace('the factory is a function and takes no arguments, returning the result of executing it: ' + ctx.name);
                    ctx.resolved = invoke(ctx.theModule.name, ctx.theModule.factory);
                } else {
                    // the module takes arguments and has no dependencies, this must be a factory
                    logger.trace('the factory takes arguments and has no dependencies, returning the function as-is: ' + ctx.name);
                    ctx.resolved = ctx.theModule.factory;
                }

                ctx.registerSingleton = ctx.theModule.singleton;
                ctx.isResolved = true;
                next(null, ctx);
            } // /resolveDependencies

            /*
            // reduces the members of the object that was registered
            // to only what the relying party asks for
            // i.e. scope.resolve('something { foo }');
            */
            function reduceMembers (ctx, next) {
                var reduced;

                if (!ctx.members.length) {
                    // this module is not being reduced to any members
                    return next(null, ctx);
                }

                if (ctx.members.length === 1) {
                    if (!ctx.resolved.hasOwnProperty(ctx.members[0].member)) {
                        logger.trace('the following dependency was NOT reduced to chosen members: ' + ctx.name);
                    }

                    logger.trace('the following dependency was reduced to chosen members: ' + ctx.name);
                    ctx.resolved = ctx.resolved[ctx.members[0].member];
                    return next(null, ctx);
                }

                reduced = {};
                ctx.members.forEach(function (item) {
                    reduced[item.alias] = ctx.resolved[item.member];
                });

                logger.trace('the following dependency was reduced to chosen members: ' + ctx.name);
                ctx.resolved = reduced;
                return next(null, ctx);
            } // /reduceMembers

            function optionallyRegisterSingleton (ctx, next) {
                if (ctx.registerSingleton) {
                    logger.trace('registering the resolved module as a singleton: ' + ctx.name);
                    context.singletonContainer.register({
                        name: ctx.name,
                        factory: ctx.resolved
                    });

                    logger.trace('removing the resolved module registration: ' + ctx.name);
                    context.container.dispose(ctx.name);
                }

                next(null, ctx);
            } // /optionallyRegisterSingleton

            function bindToOutput (ctx, next) {
                logger.trace('binding the module to the output: ' + ctx.name);
                next(null, ctx.resolved);
            } // /bindToOutput

            function makeNotFoundException (ctx) {
                var message = locale.api.MODULE_NOT_FOUND
                    .replace('{{module}}', ctx.name);

                if (ctx.name !== ctx.relyingName) {
                    message += locale.api.MODULE_NOT_FOUND_RELYING
                        .replace('{{startingModule}}', ctx.relyingName);
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

        }; // /Ctor

        function invoke (name, factory, args) {
            try {
                if (isConstructor(factory)) {
                    if (args) {
                        args = [null].concat(args);
                    } else {
                        args = [null];
                    }

                    return new (Function.prototype.bind.apply(factory, args))();
                } else {
                    return factory.apply(null, args);
                }
            } catch (e) {
                return new Exception({
                    type: locale.errorTypes.MODULE_NOT_RESOLVED,
                    messages: [locale.api.MODULE_THREW.replace(/{{module}}/, name), e.message],
                    error: e
                });
            }
        }

    } // /ResolveTasks

    // Check to see if the dependency reduces members
    // (i.e. `/\{([^}]+)\}/.exec('polyn { is }')`)
    function parseDependencyName (dependencyName) {
        var memberMatches = /\{([^}]+)\}/.exec(dependencyName),
            members = [];

        if (memberMatches) {
            // replace the
            dependencyName = dependencyName.split('{')[0].trim();
            members = memberMatches[1]
                .split(',')
                .map(function (item) {
                    var member = item.trim(),
                        withAlias = member.split(' ');

                    if (withAlias.length === 3 && withAlias[1].toLowerCase() === 'as') {
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

    function gracefullyDegrade (moduleName) {
        if (typeof module !== 'undefined' && module.exports && require) {
            // attempt to resolve from node's require
            try {
                if (require.main && typeof require.main.require === 'function') {
                    return require.main.require(moduleName);
                } else {
                    return require(moduleName);
                }
            } catch (e) {
                return null;
            }
        } else if (typeof window !== 'undefined') {
            // attempt to resolve from Window
            return window[moduleName];
        }
    }

    function isConstructor (func) {
        try {
            new func();
            return true;
        } catch (e) {
            if (e.message.indexOf('is not a constructor')) {
              return false;
            }
        }
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
