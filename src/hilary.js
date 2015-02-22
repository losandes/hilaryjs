/*jslint regexp: true, nomen: true, bitwise: true*/
/*globals module, console, Window, Error, require*/

/*
// A simple Inversion of Control container
// It's named after Hilary Page, who designed building blocks that later became known as Legos.
*/
(function (exports, nodeRequire) {
    "use strict";
    
    var Hilary, HilarysPrivateParts, PipelineEvents, Pipeline, constants, extensions = [], initializers = [], Utils, utils, Exceptions, async;
    
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

        for (i = 0; i < class2ObjTypes.length; i += 1) {
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
        
        $this.createGuid = function () {
            return "zxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
                return v.toString(16);
            });
        };
        
        return $this;
    };
    
    utils = new Utils();
    
    Exceptions = function (utils, pipeline) {
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
            
            // pass the error to the pipeline
            pipeline.onError(err);
            
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
    
    //err = new Exceptions(utils);
    
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
                return scope;
            case constants.pipeline.afterRegister:
                pipelineEvents.afterRegisterEvents.push(callback);
                return scope;
            case constants.pipeline.beforeResolve:
                pipelineEvents.beforeResolveEvents.push(callback);
                return scope;
            case constants.pipeline.afterResolve:
                pipelineEvents.afterResolveEvents.push(callback);
                return scope;
            case constants.pipeline.beforeNewChild:
                pipelineEvents.beforeNewChildEvents.push(callback);
                return scope;
            case constants.pipeline.afterNewChild:
                pipelineEvents.afterNewChildEvents.push(callback);
                return scope;
            case constants.pipeline.onError:
                pipelineEvents.onError.push(callback);
                return scope;
            default:
                throw new Error('the pipeline event you are trying to register is not implemented (name: ' + name + ')');
            }
        };
        
        executeEvent = function (eventArray, argumentArray) {
            var i,
                event;
            
            for (i = 0; i < eventArray.length; i += 1) {
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
    
    HilarysPrivateParts = function (scope, container, pipeline, parent, err) {
        var $this = {};

        $this.HilaryModule = function (definition) {
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

        $this.asyncHandler = function (action, next) {
            var _action = function () {
                var result;

                try {
                    result = action();
                } catch (err) {
                    if (utils.isFunction(next)) {
                        next(err);
                    }
                    return;
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

        $this.createChildContainer = function (scope, options, config) {
            options = options || {};
            var opts, child;

            opts = {
                parentContainer: scope
            };

            pipeline.beforeNewChild(opts);
            child = new Hilary(opts);

            if (scope.registerAsync) {
                child.useAsync(async);
            }

            pipeline.afterNewChild(opts, child);

            return child;
        };

        $this.register = function (hilaryModule) {
            pipeline.beforeRegister(hilaryModule);

            if (hilaryModule.name === constants.containerRegistration || hilaryModule.name === constants.parentContainerRegistration) {
                throw err.argumentException('The name you are trying to register is reserved', 'moduleName', hilaryModule.name);
            }

            container[hilaryModule.name] = hilaryModule;

            $this.asyncHandler(function () {
                pipeline.afterRegister(hilaryModule);
            });

            return hilaryModule;
        };

        $this.resolve = function (moduleName) {
            var theModule,
                output;

            if (utils.notString(moduleName)) {
                throw err.argumentException('The moduleName must be a string. If you are trying to resolve an array, use resolveMany.', 'moduleName');
            }

            pipeline.beforeResolve(moduleName);

            theModule = container[moduleName];

            if (theModule !== undefined) {
                output = $this.invoke(theModule);

                return $this.returnResult({
                    name: moduleName,
                    result: output
                }, pipeline);
            }

            output = $this.findResult(moduleName);

            if (output) {
                return $this.returnResult({
                    name: moduleName,
                    result: output
                }, pipeline);
            } else {
                // otherwise, throw notResolvableException
                throw err.notResolvableException(moduleName);
            }
        };
        
        $this.resolveMany = function (moduleNameArray, next) {
            var modules = [],
                i,
                current;
            
            if (utils.notArray(moduleNameArray)) {
                throw err.argumentException('The moduleNameArray is required and must be an Array', 'moduleNameArray');
            }
            
            if (utils.notFunction(next)) {
                throw err.argumentException('The next argument is required and must be a Function', 'next');
            }
            
            for (i = 0; i < moduleNameArray.length; i += 1) {
                try {
                    current = scope.resolve(moduleNameArray[i]);
                    modules.push(current);
                } catch (e) {
                    modules.push(e);
                }
            }

            return next.apply(null, modules);
        };
        
        $this.resolveManyAsync = function (moduleNameArray, next) {
            var moduleTasks = [],
                modules = {},
                i,
                makeTask = function (moduleName) {
                    return function (callback) {
                        try {
                            //scope.resolveAsync(moduleName, container, pipeline, parent, callback);
                            modules[moduleName] = scope.resolve(moduleName);
                            callback(null, null);
                        } catch (e) {
                            callback(e);
                        }
                    };
                };

            if (utils.notArray(moduleNameArray)) {
                throw err.argumentException('The moduleNameArray is required and must be an Array', 'moduleNameArray');
            }

            if (utils.notFunction(next)) {
                throw err.argumentException('The next argument is required and must be a Function', 'next');
            }

            for (i = 0; i < moduleNameArray.length; i += 1) {
                moduleTasks.push(makeTask(moduleNameArray[i]));
            }

            async.parallel(moduleTasks, function (err, moduleResults) {
                next(err, modules);
            });
        };

        $this.resolveAsync = function (moduleName, next) {
            var validateTask,
                beforeResolveTask,
                findAndInvokeResultTask,
                findResultTask,
                afterResultTask;

            validateTask = function (_next) {
                if (utils.notString(moduleName)) {
                    _next(err.argumentException('The moduleName must be a string. If you are trying to resolve an array, use resolveManyAsync.', 'moduleName'));
                } else {
                    _next(null, null);
                }
            };

            beforeResolveTask = function (previousTaskResult, _next) {
                _next(null, pipeline.beforeResolve(moduleName));
            };

            findAndInvokeResultTask = function (previousTaskResult, _next) {
                var theModule,
                    output;

                theModule = container[moduleName];

                if (theModule !== undefined) {
                    $this.invokeAsync(theModule, _next);
                } else {
                    _next(null, null);
                }
            };

            findResultTask = function (previousTaskResult, _next) {
                if (previousTaskResult) {
                    _next(null, previousTaskResult);
                } else {
                    _next(null, $this.findResult(moduleName));
                }
            };

            afterResultTask = function (previousTaskResult, _next) {
                if (previousTaskResult) {
                    pipeline.afterResolve({
                        name: moduleName,
                        result: previousTaskResult
                    });
                    _next(null, previousTaskResult);
                } else {
                    _next(err.notResolvableException(moduleName));
                }
            };

            async.waterfall([validateTask, beforeResolveTask, findAndInvokeResultTask, findResultTask, afterResultTask], next);
        };

        $this.findResult = function (moduleName) {
            if (moduleName === constants.containerRegistration) {
                return container;
            } else if (moduleName === constants.parentContainerRegistration) {
                return parent.context.getContainer();
            } else if (parent !== undefined) {
                // attempt to resolve from the parent container
                return parent.resolve(moduleName);
            } else if (nodeRequire) {
                // attempt to resolve from node's require
                try {
                    return nodeRequire(moduleName);
                } catch (e) {
                    return null;
                }
            } else if (window) {
                // attempt to resolve from Window
                return exports[moduleName];
            }
        };

        $this.returnResult = function (result) {
            $this.asyncHandler(function () {
                pipeline.afterResolve(result);
            });

            return result.result;
        };

        $this.invoke = function (theModule) {
            if (utils.isArray(theModule.dependencies) && theModule.dependencies.length > 0) {
                // the module has dependencies, let's get them
                return $this.applyDependencies(theModule);
            }

            if (utils.isFunction(theModule.factory) && theModule.factory.length === 0) {
                // the module is a function and takes no arguments, return the result of executing it
                return theModule.factory.call();
            } else {
                // the module takes arguments and has no dependencies, this must be a factory
                return theModule.factory;
            }
        };

        $this.invokeAsync = function (theModule, next) {
            if (utils.isArray(theModule.dependencies) && theModule.dependencies.length > 0) {
                // the module has dependencies, let's get them
                $this.applyDependenciesAsync(theModule, next);
                return;
            }

            if (utils.isFunction(theModule.factory) && theModule.factory.length === 0) {
                // the module is a function and takes no arguments, return the result of executing it
                next(null, theModule.factory.call());
            } else {
                // the module takes arguments and has no dependencies, this must be a factory
                next(null, theModule.factory);
            }
        };

        $this.applyDependencies = function (theModule) {
            var i,
                dependencies = [],
                resolveModule = function (moduleName) {
                    return $this.resolve(moduleName);
                };

            for (i = 0; i < theModule.dependencies.length; i += 1) {
                dependencies.push(resolveModule(theModule.dependencies[i]));
            }

            // and apply them
            return theModule.factory.apply(null, dependencies);
        };

        $this.applyDependenciesAsync = function (theModule, next) {
            var i,
                dependencyTasks = [],
                makeTask = function (moduleName) {
                    return function (callback) {
                        $this.resolveAsync(moduleName, callback);
                    };
                };

            for (i = 0; i < theModule.dependencies.length; i += 1) {
                dependencyTasks.push(makeTask(theModule.dependencies[i]));
            }

            async.parallel(dependencyTasks, function (err, dependencies) {
                next(null, theModule.factory.apply(null, dependencies));
            });
        };

        $this.makeAutoRegistrationTasks = function (index, makeTask) {
            var key,
                i,
                tasks = [];

            if (utils.isObject(index) && (index.name || index.dependencies || index.factory)) {
                tasks.push(function () { makeTask(index).call(); });
            } else if (utils.isObject(index)) {

                for (key in index) {
                    if (index.hasOwnProperty(key)) {
                        tasks.push(makeTask(index[key]));
                    }
                }

            } else if (utils.isArray(index)) {

                for (i = 0; i < index.length; i += 1) {
                    tasks.push(makeTask(index[i]));
                }

            } else {
                throw err.argumentException('A index must be defined and must be a typeof object or array', 'index');
            }

            return tasks;
        };
        
        $this.autoRegister = function (index, next) {
            var makeTask,
                tasks,
                i;
            
            makeTask = function (item) {
                return function () {
                    $this.register(item);
                };
            };
            
            try {
                tasks = $this.makeAutoRegistrationTasks(index, makeTask);

                for (i = 0; i < tasks.length; i += 1) {
                    tasks[i]();
                }

                if (utils.isFunction(next)) {
                    next(null);
                }
            } catch (e) {
                next(e);
            }
        };
        
        $this.autoResolve = function (index, next) {
            var makeTask,
                tasks,
                i;
            
            makeTask = function (item) {
                return function () {
                    if (utils.isArray(item.dependencies) && utils.isFunction(item.factory)) {
                        scope.resolveMany(item.dependencies, item.factory);
                    } else if (utils.isFunction(item.factory) && item.factory.length === 0) {
                        item.factory();
                    }
                };
            };
            
            try {
                tasks = $this.makeAutoRegistrationTasks(index, makeTask);

                for (i = 0; i < tasks.length; i += 1) {
                    tasks[i]();
                }

                if (utils.isFunction(next)) {
                    next(null, null);
                }
            } catch (e) {
                next(e);
            }
        };
        
        $this.autoResolveAsync = function (index, next) {
            var makeTask,
                tasks,
                i;

            makeTask = function (item) {
                return function (callback) {
                    if (utils.isArray(item.dependencies) && utils.isFunction(item.factory)) {
                        scope.resolveManyAsync(item.dependencies, item.factory);
                        callback(null, null);
                    } else if (utils.isFunction(item.factory) && item.factory.length === 0) {
                        item.factory();
                        callback(null, null);
                    } else {
                        callback(err.argumentException('One or more of the items in this index do not meet the requirements for resolution.', 'index', item));
                    }
                };
            };

            async.parallel($this.makeAutoRegistrationTasks(index, makeTask), next);
        };

        $this.dispose = function (moduleName) {
            var key, i, result;
            
            if (utils.isString(moduleName)) {
                return $this.disposeOne(moduleName);
            } else if (utils.isArray(moduleName)) {
                result = true;
                
                for (i = 0; i < moduleName.length; i += 1) {
                    result = result && $this.disposeOne(moduleName[i]);
                }

                return result;
            } else if (!moduleName) {
                result = true;
                
                for (key in container) {
                    if (container.hasOwnProperty(key)) {
                        result = result && $this.disposeOne(key);
                    }
                }
                
                return result;
            } else {
                return false;
            }
        };
        
        $this.disposeOne = function (moduleName) {
            if (container[moduleName]) {
                delete container[moduleName];
                return true;
            } else {
                return false;
            }
        };

        $this.useAsync = function (_async) {
            if (!_async || !_async.nextTick || !_async.waterfall || !_async.parallel) {
                throw err.argumentException('The async library is required (https://www.npmjs.com/package/async)', 'async');
            }

            // we only need a single instance of async for a given runtime
            if (!async) {
                async = _async;
            }

            /*
            // register a module by name (ASYNC)
            // @param definition (object): the module defintion: at least a name and factory are required
            // @param next (function): the callback function to be executed after the registration is complete
            */
            scope.registerAsync = function (definition, next) {
                $this.asyncHandler(function () {
                    return scope.register(definition);
                }, next);
                return scope;
            };

            /*
            // auto-register an index of objects (ASYNC)
            // @param index (object or array): the index of objects to be registered
            //      NOTE: this is designed for registering node indexes, but doesn't have to be used that way.
            */
            scope.autoRegisterAsync = function (index, next) {
                var makeTask,
                    tasks,
                    i;

                makeTask = function (item) {
                    return function (callback) {
                        scope.registerAsync(item, callback);
                    };
                };

                async.parallel($this.makeAutoRegistrationTasks(index, makeTask), next);
                return scope;
            };

            /*
            // attempt to resolve a dependency by name (supports parental hierarchy) (ASYNC)
            // @param moduleName (string): the qualified name that the module can be located by in the container
            */
            scope.resolveAsync = function (moduleName, next) {
                $this.resolveAsync(moduleName, next);
                return scope;
            };

            /*
            // attempt to resolve multiple dependencies by name (supports parental hierarchy) (ASYNC)
            // @param moduleNameArray (array): a list of qualified names that the modules can be located by in the container
            // @param next (function): the function that will accept all of the dependency results as arguments (in order)
            */
            scope.resolveManyAsync = function (moduleNameArray, next) {
                $this.resolveManyAsync(moduleNameArray, next);
                return scope;
            };

            /*
            // auto-resolve an index of objects (ASYNC)
            // @param index (object or array): the index of objects to be resolved.
            //      NOTE: this is designed for registering node indexes, but doesn't have to be used that way.
            // @param next (function): the callback that will be executed upon completion
            // @returns: undefined
            // @next (err): next recieves a single argument: err, which will be null when the process succeeded
            */
            scope.autoResolveAsync = function (index, next) {
                $this.autoResolveAsync(index, next);
                return scope;
            };

            scope.disposeAsync = function (moduleName, next) {
                var _next = next,
                    _moduleName = moduleName;

                if (utils.isFunction(moduleName)) {
                    _next = moduleName;
                    _moduleName = null;
                }

                $this.asyncHandler(function () {
                    return scope.dispose(_moduleName);
                }, _next);
                
                return scope;
            };

            /*
            // Register an event in the pipeline (beforeRegister, afterRegister, beforeResolve, afterResolve, etc.) (ASYNC)
            // @param eventName (string): the name of the event to register the handler for
            // @param eventHandler (function): the callback function that will be called when the event is triggered
            // @param next (function): the callback function to be executed after the event registration is complete
            */
            scope.registerEventAsync = function (eventName, eventHandler, next) {
                $this.asyncHandler(function () {
                    return scope.registerEvent(eventName, eventHandler);
                }, next);
                
                return scope;
            };

            return scope;
        };

        return $this;
    };
    
    Hilary = function (options) {
        var $this = this,
            config = options || {},
            container = {},
            parent = config.parentContainer,
            pipeline = config.pipeline || new Pipeline($this, utils),
            err = new Exceptions(utils, pipeline),
            ext = {},
            init = {},
            prive = new HilarysPrivateParts($this, container, pipeline, parent, err);
        
        
        // PUBLIC
        
        /*
        // exposes the constructor for hilary so you can create child contexts
        // @param options.utils (object): utilities to use for validation (i.e. isFunction)
        // @param options.exceptions (object): exception handling
        //
        // @returns new Hilary scope with parent set to this (the current Hilary scope)
        */
        $this.createChildContainer = function (options) {
            return prive.createChildContainer($this, options, config);
        };
        
        /*
        // register a module by name
        // @param definition (object): the module defintion: at least the name and factory properties are required
        // @returns this (the Hilary scope)
        */
        $this.register = function (definition) {
            prive.register(new prive.HilaryModule(definition));
            return $this;
        };
        
        /*
        // auto-register an index of objects
        // @param index (object or array): the index of objects to be registered.
        //      NOTE: each object on the index must meet the requirements of Hilary's register function
        //      NOTE: this is designed for registering node indexes, but doesn't have to be used that way.
        // @param next (function): the callback that will be executed upon completion
        // @returns this (the Hilary scope)
        // @next (err): next recieves a single argument: err, which will be null when the process succeeded
        //
        // i.e.
        //      hilary.autoRegister({
        //          myModule: { name: 'myModule', dependencies: ['foo'], factory: function (foo) { console.log(foo); } },
        //          myOtherModule: ...
        //      });
        */
        $this.autoRegister = function (index, next) {
            prive.autoRegister(index, next);
            return $this;
        };
        
        /*
        // attempt to resolve a dependency by name (supports parental hierarchy)
        // @param moduleName (string): the qualified name that the module can be located by in the container
        // @returns the module that is being resolved
        */
        $this.resolve = function (moduleName) {
            return prive.resolve(moduleName);
        };
        
        /*
        // attempt to resolve multiple dependencies by name (supports parental hierarchy)
        // @param moduleNameArray (array): a list of qualified names that the modules can be located by in the container
        // @param next (function): the function that will accept all of the dependency results as arguments (in order)
        // @returns the result of passing the dependencies as arguments to the next function
        */
        $this.resolveMany = function (moduleNameArray, next) {
            return prive.resolveMany(moduleNameArray, next);
        };
        
        /*
        // auto-resolve an index of objects
        // @param index (object or array): the index of objects to be resolved.
        //      NOTE: this is designed for registering node indexes, but doesn't have to be used that way.
        // @param next (function): the callback that will be executed upon completion
        // @returns this (the Hilary scope)
        // @next (err): next recieves a single argument: err, which will be null when the process succeeded
        */
        $this.autoResolve = function (index, next) {
            prive.autoResolve(index, next);
            return $this;
        };
        
        /*
        // Disposes a module, or all modules. When a moduleName is not passed
        // as an argument, the entire container is disposed.
        // @param moduleName (string): The name of the module to dispose
        // @returns boolean: true if the object(s) were disposed, otherwise false
        */
        $this.dispose = function (moduleName) {
            return prive.dispose(moduleName);
        };
        
        /*
        // Register an event in the pipeline (beforeRegister, afterRegister, beforeResolve, afterResolve, etc.)
        // @param eventName (string): the name of the event to register the handler for
        // @param eventHandler (function): the callback function that will be called when the event is triggered
        // @returns this (the Hilary scope)
        */
        $this.registerEvent = function (eventName, eventHandler) {
            pipeline.registerEvent(eventName, eventHandler);
            return $this;
        };
        
        /*
        // Hilary has a built in extension for asynchronous operations. Unlike the sync operations,
        // Hilary depends on a third-party library for async operations: async.js (https://github.com/caolan/async).
        // So, to turn on async operations, you need to call useAsync(async), where the async argument is async.js
        // @param async (object): async.js
        // @returns this (the Hilary scope)
        */
        $this.useAsync = function (async) {
            prive.useAsync(async);
            return $this;
        };
        
        /*
        // Exposes read access to private context for extensibility and debugging. this is not meant
        // to be used in production application code, aside from Hilary extensions.
        */
        $this.getContext = function () {
            return {
                container: container,
                parent: parent,
                HilaryModule: prive.HilaryModule,
                register: prive.register,
                constants: constants,
                utils: utils,
                exceptionHandlers: err
            };
        };
        
        // /PUBLIC
        
        // EXTENSIONS
        
        // add extensions to this
        for (ext.count = 0; ext.count < extensions.length; ext.count += 1) {
            ext.current = extensions[ext.count];
            
            if (utils.isFunction(ext.current.factory)) {
                $this[ext.current.name] = ext.current.factory($this);
            } else if (utils.isDefined(ext.current.factory)) {
                $this[ext.current.name] = ext.current.factory;
            }
        }
        
        for (init.count = 0; init.count < initializers.length; init.count += 1) {
            init.current = initializers[init.count];
            
            if (utils.isFunction(init.current)) {
                init.current($this, config);
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
