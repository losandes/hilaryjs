/*jslint plusplus: true, regexp: true, nomen: true*/
/*globals module, console, Window, require*/

/*
// A simple Inversion of Control container
// It's named after Hilary Page, who designed building blocks that later became known as Legos.
*/
(function (exports, nodeRequire) {
    "use strict";
    
    var Hilary,
        HilaryModule,
        PipelineEvents,
        Pipeline,
        constants,
        extensions = [],
        initializers = [],
        Utils,
        utils,
        Exceptions,
        err,
        asyncHandler,
        createChildContainer,
        register,
        resolve,
        findResult,
        returnResult,
        invoke,
        applyDependencies,
        OldHilary,
        async;
    
    constants = {
        containerRegistration: 'hilary::container',
        parentContainerRegistration: 'hilary::parent',
        singletons: '__singletons',
        notResolvable: 'hilary::handler::not::resolvable',
        pipeline: {
            beforeRegister: 'hilary::before::register',
            afterRegister: 'hilary::after::register',
            beforeResolve: 'hilary::before::resolve',
            afterResolve: 'hilary::after::resolve',
            beforeNewChild: 'hilary::before::new::child',
            afterNewChild: 'hilary::after::new::child',
            onError: 'hilary::error'
        }
    };
    
    Utils = function () {
        var $this = {},
            objProto = Object.prototype,
            objProtoToStringFunc = objProto.toString,
            objProtoHasOwnFunc = objProto.hasOwnProperty,
            class2Types = {},
            class2ObjTypes = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error"],
            i,
            name;

        for (i = 0; i < class2ObjTypes.length; i++) {
            name = class2ObjTypes[i];
            class2Types["[object " + name + "]"] = name.toLowerCase();
        }

        $this.type = function (obj) {
            if (typeof obj === "undefined") {
                return "undefined";
            }
            
            if (obj === null) {
                return String(obj);
            }

            return typeof obj === "object" || typeof obj === "function" ?
                    class2Types[objProtoToStringFunc.call(obj)] || "object" :
                    typeof obj;
        };

        $this.notDefined = function (obj) {
            try {
                return this.type(obj) === 'undefined';
            } catch (e) {
                return true;
            }
        };

        $this.isDefined = function (obj) {
            try {
                return this.type(obj) !== 'undefined';
            } catch (e) {
                return false;
            }
        };

        $this.isFunction = function (obj) {
            return this.type(obj) === 'function';
        };

        $this.notFunction = function (obj) {
            return this.type(obj) !== 'function';
        };
        
        $this.isObject = function (obj) {
            return this.type(obj) === 'object';
        };
        
        $this.notObject = function (obj) {
            return this.type(obj) !== 'object';
        };

        $this.isArray = function (obj) {
            return this.type(obj) === 'array';
        };

        $this.notArray = function (obj) {
            return this.type(obj) !== 'array';
        };

        $this.isString = function (obj) {
            return this.type(obj) === 'string';
        };

        $this.notString = function (obj) {
            return this.type(obj) !== 'string';
        };

        $this.isBoolean = function (obj) {
            return this.type(obj) === 'boolean';
        };

        $this.notBoolean = function (obj) {
            return this.type(obj) !== 'boolean';
        };

        $this.notNullOrWhitespace = function (str) {
            if (!str) {
                return false;
            }

            if (this.notString(str)) {
                throw new Error('Unable to check if a non-string is whitespace.');
            }
            
            // ([^\s]*) = is not whitespace
            // /^$|\s+/ = is empty or whitespace

            return (/([^\s])/).test(str);
        };

        $this.isNullOrWhitespace = function (str) {
            return this.notNullOrWhitespace(str) === false;
        };
        
        return $this;
    };
    
    utils = new Utils();
    
    Exceptions = function (utils) {
        var $this = {},
            makeException;
        
        makeException = function (name, message, data) {
            var msg = utils.isString(message) ? message : name,
                err = new Error(msg);
            
            err.message = msg;

            if (name !== msg) {
                err.name = name;
            }

            if (data) {
                err.data = data;
            }
            
            return err;
        };
        
        $this.makeException = makeException;
        
        $this.argumentException = function (message, argument, data) {
            var msg = utils.notDefined(argument) ? message : message + ' (argument: ' + argument + ')';
            return makeException('ArgumentException', msg, data);
        };

        $this.dependencyException = function (message, dependencyName, data) {
            var msg = utils.notDefined(dependencyName) ? message : message + ' (dependency: ' + dependencyName + '). If the module exists, does it return a value?';
            return makeException('DependencyException', msg, data);
        };

        $this.notImplementedException = function (message, data) {
            return makeException('NotImplementedException', message, data);
        };
        
        // the default handler for modules that fail to resolve
        // @param moduleName (string): the name of the module that was not resolved
        $this.notResolvableException = function (moduleName) {
            return $this.dependencyException('The module cannot be resolved', moduleName);
        };
        
        return $this;
    };
    
    err = new Exceptions(utils);
    
    PipelineEvents = function () {
        var $this = {};
        
        $this.beforeRegisterEvents = [];
        $this.afterRegisterEvents = [];
        $this.beforeResolveEvents = [];
        $this.afterResolveEvents = [];
        $this.beforeNewChildEvents = [];
        $this.afterNewChildEvents = [];
        $this.onError = [];
        
        return $this;
    };
    
    Pipeline = function (scope, utils) {
        var $this = {},
            registerEvent,
            executeEvent,
            pipelineEvents = new PipelineEvents(),
            beforeRegister,
            afterRegister,
            beforeResolveOne,
            beforeResolve,
            afterResolve,
            beforeNewChild,
            afterNewChild,
            onError;
        
        registerEvent = function (name, callback) {
            switch (name) {
            case constants.pipeline.beforeRegister:
                pipelineEvents.beforeRegisterEvents.push(callback);
                break;
            case constants.pipeline.afterRegister:
                pipelineEvents.afterRegisterEvents.push(callback);
                break;
            case constants.pipeline.beforeResolve:
                pipelineEvents.beforeResolveEvents.push(callback);
                break;
            case constants.pipeline.afterResolve:
                pipelineEvents.afterResolveEvents.push(callback);
                break;
            case constants.pipeline.beforeNewChild:
                pipelineEvents.beforeNewChildEvents.push(callback);
                break;
            case constants.pipeline.afterNewChild:
                pipelineEvents.afterNewChildEvents.push(callback);
                break;
            case constants.pipeline.onError:
                pipelineEvents.onError.push(callback);
                break;
            default:
                throw err.notImplementedException('the pipeline event you are trying to register is not implemented (name: ' + name + ')');
            }
        };
        
        executeEvent = function (eventArray, argumentArray) {
            var i,
                event;
            
            for (i = 0; i < eventArray.length; i++) {
                event = eventArray[i];
                
                if (event.once) {
                    eventArray.splice(i, 1);
                }
                
                if (utils.isFunction(event)) {
                    event.apply(null, argumentArray);
                }
            }
        };

        beforeRegister = function (moduleInfo) {
            executeEvent($this.events.beforeRegisterEvents, [scope, moduleInfo]);
        };

        afterRegister = function (moduleInfo) {
            executeEvent($this.events.afterRegisterEvents, [scope, moduleInfo]);
        };

        beforeResolve = function (moduleName) {
            executeEvent($this.events.beforeResolveEvents, [scope, moduleName]);
        };

        afterResolve = function (moduleInfo) {
            executeEvent($this.events.afterResolveEvents, [scope, moduleInfo]);
        };

        beforeNewChild = function (options) {
            executeEvent($this.events.beforeNewChildEvents, [scope, options]);
        };
        
        afterNewChild = function (options, child) {
            executeEvent($this.events.afterNewChildEvents, [scope, options, child]);
        };
        
        onError = function (err) {
            executeEvent($this.events.onError, [err]);
        };
        
        // EVENTS
        $this.events = pipelineEvents;
        $this.registerEvent = registerEvent;
        $this.onError = onError;
        
        // REGISTRATION and RESOLUTION
        $this.beforeRegister = beforeRegister;
        $this.afterRegister = afterRegister;
        
        $this.beforeResolve = beforeResolve;
        $this.afterResolve = afterResolve;
        
        // CONTAINERS
        $this.beforeNewChild = beforeNewChild;
        $this.afterNewChild = afterNewChild;
        
        return $this;
    };
    
    HilaryModule = function (definition) {
        var $this = {};
        
        if (utils.notString(definition.name)) {
            throw err.argumentException('The module name is required', 'name');
        }
        
        if (utils.notDefined(definition.factory)) {
            throw err.argumentException('The module factory is required', 'factory');
        }
        
        $this.name = definition.name;
        $this.dependencies = definition.dependencies || undefined;
        $this.factory = definition.factory;
        
        return $this;
    };
    
    asyncHandler = function (action, next) {
        var _action = function () {
            var result;

            try {
                result = action();
            } catch (err) {
                if (utils.isFunction(next)) {
                    next(err);
                }
            }

            if (utils.isFunction(next)) {
                next(null, result);
            }
        };
        
        if (async) {
            async.nextTick(_action);
        } else if (setTimeout) {
            setTimeout(_action, 0);
        }
    };
    
    createChildContainer = function ($this, options, config, pipeline) {
        options = options || {};
        var opts, child;

        opts = {
            parentContainer: $this,
            async: options.async || config.async
        };

        pipeline.beforeNewChild(opts);
        child = new Hilary(opts);
        pipeline.afterNewChild(opts, child);

        return child;
    };
    
    register = function (hilaryModule, container, pipeline) {
        pipeline.beforeRegister(hilaryModule);

        if (hilaryModule.name === constants.containerRegistration || hilaryModule.name === constants.parentContainerRegistration) {
            throw err.argumentException('The name you are trying to register is reserved', 'moduleName', hilaryModule.name);
        }

        container[hilaryModule.name] = hilaryModule;

        asyncHandler(function () {
            pipeline.afterRegister(hilaryModule);
        });
        
        return hilaryModule;
    };
    
    resolve = function (moduleName, container, pipeline, parent) {
        var output;
        
        pipeline.beforeResolve(moduleName);

        output = findResult(moduleName, container, parent);
        
        if (output) {
            return returnResult(output);
        } else {
            // otherwise, throw notResolvableException
            throw err.notResolvableException(moduleName);
        }
    };
    
    resolveAsync = function (moduleName, container, pipeline, parent, next) {
        var beforeResolveTask,
            findResultTask,
            returnResultTask;
        
        beforeResolveTask = function (callback) {
            callback(null, pipeline.beforeResolve(moduleName));
        };
        
        findResultTask = function (stepOneResult, callback) {
            var output = findResult(moduleName, container, parent);
            callback(null, output);
        };
        
        returnResultTask = function (output, callback) {
            if (output) {
                var result = returnResult(output);
                callback(null, result);
            } else {
                // otherwise, pass notResolvableException error to callback
                callback(err.notResolvableException(moduleName));
            }
        };
        
        async.waterfall([beforeResolveTask, findResultTask, returnResultTask], next);
    };
    
    findResult = function (moduleName, container, parent) {
        var theModule,
            output;
        
        theModule = container[moduleName];
        
        if (theModule !== undefined) {
            return invoke(theModule, applyDependencies);
        } else if (moduleName === constants.containerRegistration) {
            return container;
        } else if (moduleName === constants.parentContainerRegistration) {
            return parent.context.getContainer();
        } else if (parent !== undefined) {
            // attempt to resolve from the parent container
            return parent.resolve(moduleName);
        } else if (nodeRequire) {
            // attempt to resolve from node's require
            return nodeRequire(moduleName);
        } else if (window) {
            // attempt to resolve from Window
            return exports[moduleName];
        }
    };
    
    returnResult = function (result, pipeline) {
        asyncHandler(function () {
            pipeline.afterResolve(result);
        });
        
        return result;
    };
    
    invoke = function (theModule, applyDependencies) {
        if (utils.isArray(theModule.dependencies) && theModule.dependencies.length > 0) {
            // the module has dependencies, let's get them
            return applyDependencies(theModule);
        }

        if (utils.isFunction(theModule.factory) && theModule.factory.length === 0) {
            // the module is a function and takes no arguments, return the result of executing it
            return theModule.factory.call();
        } else {
            // the module takes arguments and has no dependencies, this must be a factory
            return theModule.factory;
        }
    };
    
    applyDependencies = function (theModule) {
        var i, dependencies = [];

        for (i = 0; i < theModule.dependencies.length; i++) {
            dependencies.push(resolve(theModule.dependencies[i]));
        }

        // and apply them
        return theModule.ctor.apply(null, dependencies);
    };
    
    
    Hilary = function (options) {
        var $this = this,
            config = options || {},
            container = {},
            parent = config.parentContainer,
            pipeline = config.pipeline || new Pipeline($this, utils);
        
        // we only need a single instance of async for a given runtime
        if (config.async && !async) {
            async = config.async;
        }
        
        // PUBLIC
        
        /*
        // exposes the constructor for hilary so you can create child contexts
        // @param options.utils (object): utilities to use for validation (i.e. isFunction)
        // @param options.exceptions (object): exception handling
        */
        $this.createChildContainer = function (options) {
            createChildContainer($this, options, config, pipeline);
        };
        
        /*
        // register a module by name
        // @param definition (object): the module defintion: at least a name and factory are required
        */
        $this.register = function (definition) {
            register(new HilaryModule(definition), container, pipeline);
            return $this;
        };
        
        /*
        // register a module by name, asynchronously
        // @param definition (object): the module defintion: at least a name and factory are required
        // @param next (function): the callback function to be executed after the registration is complete
        */
        $this.registerAsync = function (definition, next) {
            asyncHandler(function () {
                return $this.register(definition);
            }, next);
        };
        
        /*
        // auto-register or resolve an index of objects
        // @param index (object or array): the index of objects to be registered or resolved.
        //      NOTE: if a name is not provided for the object, it is resolved, otherwise it is registered.
        //      NOTE: this is designed for registering node indexes, but doesn't have to be used that way.
        //            Using it in the browser would likely result in your objects being on a global, which is not desireable.
        //
        // i.e.
        //      hilary.autoRegister({
        //          myModule: { name: 'myModule', dependencies: ['foo'], factory: function (foo) { console.log(foo); } },
        //          myOtherModule: ...
        //      });
        */
        $this.autoRegister = undefined;
        
        $this.autoRegisterAsync = undefined;
        
        /*
        // attempt to resolve a dependency by name (supports parental hierarchy)
        // @param moduleName (string): the qualified name that the module can be located by in the container
        */
        $this.resolve = function (moduleName) {
            return resolve(moduleName, container, pipeline, parent);
        };
        
        $this.resolveAsync = function (moduleName, next) {
            return resolveAsync(moduleName, container, pipeline, parent, next);
        };
        
        /*
        // Disposes a module, or all modules. When a moduleName is not passed
        // as an argument, the entire container is disposed.
        // @param moduleName (string): The name of the module to dispose
        */
        $this.dispose = undefined;
        
        $this.disposeAsync = undefined;
        
        /*
        // Register an event in the pipeline (beforeRegister, afterRegister, beforeResolve, afterResolve, etc.)
        // @param eventName (string): the name of the event to register the handler for
        // @param eventHandler (function): the callback function that will be called when the event is triggered
        */
        $this.registerEvent = function (eventName, eventHandler) {
            return pipeline.registerEvent(eventName, eventHandler);
        };
        
        /*
        // Register an event in the pipeline (beforeRegister, afterRegister, beforeResolve, afterResolve, etc.), asynchronously
        // @param eventName (string): the name of the event to register the handler for
        // @param eventHandler (function): the callback function that will be called when the event is triggered
        // @param next (function): the callback function to be executed after the event registration is complete
        */
        $this.registerEventAsync = function (eventName, eventHandler, next) {
            asyncHandler(function () {
                return $this.registerEvent(eventName, eventHandler);
            }, next);
        };
        
        $this.context = {
            /*
            // access to the container
            */
            getContainer: function () {
                return container;
            },

            /*
            // access to the parent container
            */
            getParentContainer: function () {
                if (parent !== undefined) {
                    return parent.getContainer();
                } else {
                    return null;
                }
            },
            
            /*
            // Provides access to the constants for things like reserved module names and pipeline events.
            */
            getConstants: function () {
                return constants;
            },
            
            /*
            // Provides access to the utils module, so extensions can take advantage
            */
            getUtils: function () {
                return utils;
            },
            
            /*
            // Provides access to the exceptions module, so extensions can take advantage
            */
            getExceptionHandlers: function () {
                return err;
            }
        };
        
        // /PUBLIC
    };
    
    
    OldHilary = function (options) {
        var $this = this,
            config = options || {},
            container = { },
            parent = config.parentContainer,
            utils = config.utils || new Utils(),
            exceptions = config.exceptions || new Exceptions(utils),
            pipeline = config.pipeline || new Pipeline($this, utils),
            createChildContainer,
            resolveBase,
            register,
            resolve,
            configuredRegister,
            configuredResolve,
            configuredSyncRegister,
            configuredSyncResolve,
            asyncRegister,
            asyncResolve,
            amdRegister,
            amdResolve,
            autoRegister,
            autoRegisterOne,
            asyncAutoRegister,
            dispose,
            make,
            asyncMake,
            makeHilaryModule,
            applyDependencies,
            asyncApplyDependencies,
            makeAutoRegistrationTasks,
            getReservedModule,
            getContainer,
            getParentContainer,
            extCount,
            extension,
            initCount,
            initializer;
        
        // PRIVATE
        
        createChildContainer = function (options) {
            options = options || {};
            var opts, child;
            
            opts = {
                parentContainer: $this,
                utils: options.utils || utils,
                exceptions: options.exceptions || exceptions,
                lessMagic: options.lessMagic || config.lessMagic,
                async: options.async || config.async
            };

            pipeline.beforeNewChild(opts);
            child = new Hilary(opts);
            pipeline.afterNewChild(opts, child);

            return child;
        };
        
        register = function (moduleName, moduleDefinition) {
            pipeline.beforeRegister(moduleName, moduleDefinition);

            if (utils.notString(moduleName)) {
                throw exceptions.argumentException('The first argument must be the name of the module', 'moduleNameOrFunc', moduleName);
            } else if (moduleName === constants.containerRegistration) {
                throw exceptions.argumentException('The name you are trying to register is reserved', 'moduleName', moduleName);
            } else if (moduleName === constants.parentContainerRegistration) {
                throw exceptions.argumentException('The name you are trying to register is reserved', 'moduleName', moduleName);
            } else if (moduleName === constants.singletons) {
                throw exceptions.argumentException('The name you are trying to register is reserved', 'moduleName', moduleName);
            }

            if (utils.notDefined(moduleDefinition)) {
                throw exceptions.argumentException('The second argument must be the module definition', 'moduleDefinition');
            }

            container[moduleName] = moduleDefinition;

            pipeline.afterRegister(moduleName, moduleDefinition);

            return $this;
        };
        
        //asyncRegister:
        //string, array, func, func (name, dependencies, factory, callback)
        //string, func, func (name, factory, callback)
        //string, object, func (name, defn, callback)
        asyncRegister = function (moduleName, dependencies, factory, next) {
            config.async.nextTick(function () {
                var _next,
                    validationMessage;
                
                if (utils.isString(moduleName) && utils.isArray(dependencies) && utils.isFunction(factory)) {
                    // all 3 definition arguments are present (string, array, func, func)
                    _next = next;
                    register(moduleName, new HilaryModule(dependencies, factory));
                } else if (utils.isString(moduleName) && utils.isFunction(dependencies)) {
                    // the factory was passed in as the second argument - no dependencies exist
                    // moduleName == moduleName and dependencies == factory (string, func, func)
                    _next = factory;
                    register(moduleName, new HilaryModule(dependencies));
                } else if (utils.isString(moduleName) && utils.isObject(dependencies)) {
                    // the factory in an object literal and was passed in as the second argument - no dependencies exist
                    // moduleName == moduleName and dependencies == object literal (string, object, func)
                    _next = factory;
                    register(moduleName, new HilaryModule(function () { return dependencies; }));
                } else {
                    validationMessage = 'The module definition is invalid. ';
                    
                    if (utils.isString(moduleName)) {
                        validationMessage += 'moduleName: ' + moduleName + '. ';
                    } else {
                        validationMessage += 'A moduleName is required. ';
                    }
                    
                    if (utils.isArray(dependencies) && utils.notFunction(factory)) {
                        validationMessage += 'A factory function (2nd or 3rd argument) is required. ';
                    } else if (utils.notFunction(dependencies)) {
                        validationMessage += 'A factory function (2nd or 3rd argument) is required. ';
                    }
                    
                    throw exceptions.argumentException(validationMessage);
                }
                
                if (utils.isFunction(_next)) {
                    _next();
                }
            });
        };
        
        amdRegister = function (moduleName, dependencies, factory) {
            if (utils.isFunction(factory)) {
                // all 3 arguments are present
                return register(moduleName, new HilaryModule(dependencies, factory));
            } else if (utils.isString(moduleName) && utils.isFunction(dependencies)) {
                // the factory was passed in as the second argument - no dependencies exist
                // moduleName == moduleName and dependencies == factory
                return register(moduleName, new HilaryModule(dependencies));
            } else if (utils.isArray(moduleName) && utils.isFunction(dependencies)) {
                // anonymous definition: the factory was passed in as the second argument - dependencies exist
                // moduleName == dependencies and dependencies == factory
                return amdResolve(moduleName, dependencies);
            } else if (utils.isFunction(moduleName)) {
                // anonymous definition: the factory was passed in as the first argument
                return amdResolve(moduleName);
            } else if (utils.isObject(moduleName)) {
                // anonymous definition: an object literal was passed in as the first argument
                return amdResolve(function (require, exports, module) {
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
                return amdResolve(function (require, exports, module) {
                    exports[moduleName] = dependencies;
                });
            } else {
                throw exceptions.argumentException('A factory function was not found to define ' + moduleName, 'factory');
            }
        };
        
        makeAutoRegistrationTasks = function (index) {
            var key,
                i,
                tasks;

            if (utils.isObject(index) && (index.name || index.dependencies || index.factory)) {
                tasks.push(function () { autoRegisterOne(index); });
            } else if (utils.isObject(index)) {

                for (key in index) {
                    if (index.hasOwnProperty(key)) {
                        tasks.push(function () { autoRegisterOne(index[key]); });
                    }
                }

            } else if (utils.isArray(index)) {

                for (i = 0; i < index.length; i += 1) {
                    tasks.push(function () { autoRegisterOne(index[i]); });
                }

            } else {
                throw exceptions.argumentException('A index must be defined and must be a typeof object or array', 'index');
            }
            
            return tasks;
        };
        
        asyncAutoRegister = function (index, next) {
            config.async.nextTick(function () {
                var tasks = makeAutoRegistrationTasks(index);
                
                config.async.parallel(tasks, next);
            });
        };
        
        autoRegister = function (index, next) {
            var tasks = makeAutoRegistrationTasks(index),
                i;
            
            for (i = 0; i < tasks.length; i += 1) {
                tasks[i]();
            }
            
            if (utils.isFunction(next)) {
                next();
            }
        };
        
        autoRegisterOne = function (registration) {
            if (registration.name && registration.dependencies && registration.factory) {
                $this.register(registration.name, registration.dependencies, registration.factory);
            } else if (registration.name && registration.factory) {
                $this.register(registration.name, registration.factory);
            } else if (registration.dependencies && registration.factory) {
                $this.resolve(registration.dependencies, registration.factory);
            } else if (registration.factory) {
                $this.register(registration.factory);
            }
        };
        
        asyncMake = function (mdl, next) {
            if (mdl instanceof HilaryModule) {
                // resolve it's dependencies and execute the factory
                return makeHilaryModule(mdl, function (mdl) {
                    asyncApplyDependencies(mdl, next);
                });
            } else {
                // return the module
                return mdl;
            }
        };
        
        make = function (mdl) {
            if (mdl instanceof HilaryModule) {
                // resolve it's dependencies and execute the factory
                return makeHilaryModule(mdl, applyDependencies);
            } else {
                // return the module
                return mdl;
            }
        };
        
        makeHilaryModule = function (mdl, applyDependencies) {
            if (utils.isArray(mdl.dependencies) && mdl.dependencies.length > 0) {
                // the module has dependencies, let's get them
                return applyDependencies(mdl);
            }

            if (mdl.ctor.length === 0) {
                // the module takes no arguments, return the result of executing it
                return mdl.ctor.call();
            } else {
                // the module takes arguments and has no dependencies, this must be a factory
                return mdl.ctor;
            }
        };
        
        applyDependencies = function (mdl) {
            var i, dependencies = [];
            
            for (i = 0; i < mdl.dependencies.length; i++) {
                dependencies.push(resolve(mdl.dependencies[i]));
            }

            // and apply them
            return mdl.ctor.apply(null, dependencies);
        };
        
        asyncApplyDependencies = function (mdl, next) {
            var i, tasks = [];

            for (i = 0; i < mdl.dependencies.length; i++) {
                tasks.push(function (callback) {
                    callback(null, resolve(mdl.dependencies[i]));
                    //asyncResolve(mdl.dependencies[i]);
                });

                config.async.parallel(tasks, function (err, dependencies) {
                    var result = {};
                    dependencies.unshift(null);
                    result = mdl.ctor.apply(null, dependencies);
                    
                    next(null, { moduleName: mdl.name, result: result });
                });
            }
            return;
        };
        
        getReservedModule = function (moduleName) {
//            if (typeof config.getReservedModule === 'function') {
//                var output = config.getReservedModule(moduleName);
//
//                if (output) {
//                    return output;
//                }
//            }
            
            if (moduleName === constants.containerRegistration) {
                return getContainer();
            } else if (moduleName === constants.parentContainerRegistration) {
                return getParentContainer();
            }
        };
        
        resolve = function (moduleName) {
            var mdul,
                output;
            
            pipeline.beforeResolve(moduleName);
            
            // try to resolve the module by name
            mdul = container[moduleName];

            // if the module was found, resolve it's dependencies and return it
            if (mdul !== undefined) {
                output = make(mdul);
                pipeline.afterResolve(moduleName, output);
                return output;
            }
            
            // Check to see if the module being requested is a reserved module
            output = getReservedModule(moduleName);
            
            // If the module being requested is a reserved registration, return it
            if (output !== undefined) {
                pipeline.afterResolve(moduleName, output);
                return output;
            } else if (parent !== undefined) {
                // attempt to resolve from the parent container
                return parent.resolve(moduleName);
            } else if (nodeRequire) {
                // attempt to resolve from node's require
                output = nodeRequire(moduleName);
            } else if (window) {
                // attempt to resolve from Window
                output = exports[moduleName];
            }
            
            if (output !== undefined) {
                pipeline.afterResolve(moduleName, output);
                return output;
            } else if (utils.isFunction(container[constants.notResolvable])) {
                // if we got this far, we're going to throw
                // if a notResolvableException override is registered, execute it
                container[constants.notResolvable](moduleName);
            } else {
                // otherwise, throw the default notResolvableException
                throw exceptions.notResolvableException(moduleName);
            }
        };
        
        //resolve
        //string, func (dependency, callback)
        //array, func (dependencies, callback)
        asyncResolve = function (moduleName, next) {
            config.async.nextTick(function () {
                var mdul,
                    output,
                    newNext = function (err, result) {
                        if (err) {
                            pipeline.onError(err);
                        }
                        
                        pipeline.afterResolve(result.moduleName, result.result);
                        
                        if (utils.isFunction(next)) {
                            next(err, result);
                        }
                    };
            
                pipeline.beforeResolve(moduleName);
            
                // try to resolve the module by name
                mdul = container[moduleName];

                // if the module was found, resolve it's dependencies and return it
                if (mdul !== undefined) {
                    return asyncMake(mdul, newNext);
                }
            
                // Check to see if the module being requested is a reserved module
                output = getReservedModule(moduleName);
            
                // If the module being requested is a reserved registration, return it
                if (output !== undefined) {
                    return newNext(null, { moduleName: moduleName, result: output });
                } else if (parent !== undefined) {
                    // attempt to resolve from the parent container
                    return parent.asyncResolve(moduleName, next);
                } else if (nodeRequire) {
                    // attempt to resolve from node's require
                    output = nodeRequire(moduleName);
                } else if (window) {
                    // attempt to resolve from Window
                    output = exports[moduleName];
                }

                if (output !== undefined) {
                    return newNext(null, { moduleName: moduleName, result: output });
                } else if (utils.isFunction(container[constants.notResolvable])) {
                    // if we got this far, we're going to throw
                    // if a notResolvableException override is registered, execute it
                    container[constants.notResolvable](moduleName);
                } else {
                    // otherwise, throw the default notResolvableException
                    newNext(exceptions.notResolvableException(moduleName));
                }
                
            });
        };
        
        amdResolve = function (dependencies, factory) {
            if (typeof dependencies === 'function') {
                // The first argument is the factory
                return dependencies(resolve, getContainer(), typeof module !== 'undefined' ? module : exports);
            } else if (typeof dependencies === 'string') {
                // A single module is being required
                return resolve(dependencies);
            } else {
                // An array of dependencies are being required for the factory
                var i,
                    resolved = [];

                for (i = 0; i < dependencies.length; i++) {
                    resolved.push(resolve(dependencies[i]));
                }

                return factory.apply(null, resolved);
            }
        };
        
        dispose = function (moduleName) {
            var key, i;
            
            if (utils.isString(moduleName)) {
                delete container[moduleName];
            } else if (utils.isArray(moduleName)) {
                for (i = 0; i < moduleName.length; i += 1) {
                    delete container[moduleName[i]];
                }
            } else {
                for (key in container) {
                    if (container.hasOwnProperty(key)) {
                        delete container[key];
                    }
                }
            }
        };
        
        getContainer = function () {
            return container;
        };
        
        getParentContainer = function () {
            if (parent !== undefined) {
                return parent.getContainer();
            } else {
                return null;
            }
        };
        
        if (config.lessMagic) {
            configuredRegister = register;
            configuredResolve = resolve;
        } else if (config.async) {
            // TODO: validate the async API
            configuredRegister = asyncRegister;
            configuredResolve = asyncResolve;
        } else {
            configuredRegister = amdRegister;
            configuredResolve = amdResolve;
        }
        
        // /PRIVATE
        
        // PUBLIC
        
        /*
        // exposes the constructor for hilary so you can create child contexts
        // @param options.utils (object): utilities to use for validation (i.e. isFunction)
        // @param options.exceptions (object): exception handling
        */
        $this.createChildContainer = createChildContainer;
        
        /*
        // access to the container
        */
        $this.getContainer = getContainer;

        /*
        // access to the parent container
        */
        $this.getParentContainer = getParentContainer;
        
        /*
        // register a module by name
        // @param moduleName (string): the name of the module
        // @param moduleDefinition (object literal, function or HilaryModule): the module definition
        */
        $this.register = configuredRegister;
        
        /*
        // auto-register or resolve an index of objects
        // @param index (object or array): the index of objects to be registered or resolved.
        //      NOTE: if a name is not provided for the object, it is resolved, otherwise it is registered.
        //      NOTE: this is designed for registering node indexes, but doesn't have to be used that way.
        //            Using it in the browser would likely result in your objects being on a global, which is not desireable.
        //
        // i.e.
        //      hilary.autoRegister({
        //          myModule: { name: 'myModule', dependencies: ['foo'], factory: function (foo) { console.log(foo); } },
        //          myOtherModule: ...
        //      });
        */
        $this.autoRegister = config.async ? asyncAutoRegister : autoRegister;
        
        /*
        // attempt to resolve a dependency by name (supports parental hierarchy)
        // @param moduleName (string): the qualified name that the module can be located by in the container
        */
        $this.resolve = configuredResolve;
        
        /*
        // AMD style functions for registering and resolving modules. Note that you need to include
        // hilary.amd to get the AMD syntax (define and require).
        */
        $this.amd = {
            register: amdRegister,
            resolve: amdResolve
        };
        
        /*
        // IoC style functions for registering and resolving modules.
        */
        $this.ioc = {
            register: register,
            resolve: resolve
        };
        
        /*
        // attempt to resolve a dependency by name (supports parental hierarchy)
        // @param moduleName (string): the qualified name that the module can be located by in the container
        */
        $this.tryResolve = function (moduleName) {
            try {
                return $this.resolve(moduleName);
            } catch (e) {
                console.log(e);
            }
        };
        
        /*
        // Disposes a module, or all modules. When a moduleName is not passed
        // as an argument, the entire container is disposed.
        // @param moduleName (string): The name of the module to dispose
        */
        $this.dispose = dispose;
        
        /*
        // Register an event in the pipeline (beforeRegister, afterRegister, beforeResolve, afterResolve, etc.)
        */
        $this.registerEvent = function (eventName, callback) {
            return pipeline.registerEvent(eventName, callback);
        };
        
        /*
        // Provides access to the constants for things like reserved module names and pipeline events.
        */
        $this.getConstants = function () {
            return constants;
        };
        
        /*
        // Provides access to the utils module, so extensions can take advantage
        */
        $this.getUtils = function () {
            return utils;
        };
        
        /*
        // Provides access to the exceptions module, so extensions can take advantage
        */
        $this.getExceptionHandlers = function () {
            return exceptions;
        };
        
        // /PUBLIC
        
        // EXTENSIONS
        
        // add extensions to this
        for (extCount = 0; extCount < extensions.length; extCount++) {
            extension = extensions[extCount];
            
            if (utils.isFunction(extension.factory)) {
                $this[extension.name] = extension.factory($this);
            } else if (utils.isDefined(extension.factory)) {
                $this[extension.name] = extension.factory;
            }
        }
        
        for (initCount = 0; initCount < initializers.length; initCount++) {
            initializer = initializers[initCount];
            
            if (utils.isFunction(initializer)) {
                initializer($this, config);
            }
        }
        
        // /EXTENSIONS
    };
    
    /*
    // a function for extending Hilary. The scope (this) is passed to the factory;
    */
    Hilary.extend = function (name, factory) {
        extensions.push({
            name: name,
            factory: factory
        });
        
        return true;
    };
    
    /*
    // a function for extending Hilary. The scope (this), and constructor options are passed to the factory;
    */
    Hilary.onInit = function (factory) {
        initializers.push(factory);
        
        return true;
    };
    
    exports.Hilary = Hilary;
    
}(
    (typeof module !== 'undefined' && module.exports) ? module.exports : window,    // node or browser
    (typeof module !== 'undefined' && module.exports) ? require : undefined         // node's require or undefined
));
