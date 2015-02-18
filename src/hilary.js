/*jslint plusplus: true, regexp: true*/
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
        Exceptions,
        utl,
        err;
    
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
            afterNewChild: 'hilary::after::new::child'
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
    
    utl = new Utils();
    
    Exceptions = function (utils) {
        var makeException = function (name, message, data) {
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
        
        this.makeException = makeException;
        
        this.argumentException = function (message, argument, data) {
            var msg = utils.notDefined(argument) ? message : message + ' (argument: ' + argument + ')';
            return makeException('ArgumentException', msg, data);
        };

        this.dependencyException = function (message, dependencyName, data) {
            var msg = utils.notDefined(dependencyName) ? message : message + ' (dependency: ' + dependencyName + '). If the module exists, does it return a value?';
            return makeException('DependencyException', msg, data);
        };

        this.notImplementedException = function (message, data) {
            return makeException('NotImplementedException', message, data);
        };
        
        // the default handler for modules that fail to resolve
        // @param moduleName (string): the name of the module that was not resolved
        this.notResolvableException = function (moduleName) {
            return this.dependencyException('The module cannot be resolved', moduleName);
        };
    };
    
    err = new Exceptions(utl);
    
    PipelineEvents = function () {
        this.beforeRegisterEvents = [];
        this.afterRegisterEvents = [];
        this.beforeResolveEvents = [];
        this.afterResolveEvents = [];
        this.beforeNewChildEvents = [];
        this.afterNewChildEvents = [];
    };
    
    Pipeline = function (scope, utils) {
        var registerEvent,
            executeEvent,
            pipelineEvents = new PipelineEvents(),
            beforeRegister,
            afterRegister,
            beforeResolveOne,
            beforeResolve,
            afterResolve,
            beforeNewChild,
            afterNewChild;
        
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

        beforeRegister = function (moduleName, moduleDefinition) {
            executeEvent(this.events.beforeRegisterEvents, [scope, moduleName, moduleDefinition]);
        };

        afterRegister = function (moduleName, moduleDefinition) {
            executeEvent(this.events.afterRegisterEvents, [scope, moduleName, moduleDefinition]);
        };

        beforeResolve = function (moduleName) {
            executeEvent(this.events.beforeResolveEvents, [scope, moduleName]);
        };

        afterResolve = function (moduleName, result) {
            executeEvent(this.events.afterResolveEvents, [scope, moduleName, result]);
        };

        beforeNewChild = function (options) {
            executeEvent(this.events.beforeNewChildEvents, [scope, options]);
        };
        
        afterNewChild = function (options, child) {
            executeEvent(this.events.afterNewChildEvents, [scope, options, child]);
        };
        
        // EVENTS
        this.events = pipelineEvents;
        this.registerEvent = registerEvent;
        
        // REGISTRATION and RESOLUTION
        this.beforeRegister = beforeRegister;
        this.afterRegister = afterRegister;
        
        this.beforeResolve = beforeResolve;
        this.afterResolve = afterResolve;
        
        // CONTAINERS
        this.beforeNewChild = beforeNewChild;
        this.afterNewChild = afterNewChild;
    };
    
    HilaryModule = function (dependencies, ctor) {
        this.dependencies = undefined;
        this.ctor = undefined;
        this.singleton = false;
        
        if (utl.isArray(dependencies)) {
            this.dependencies = dependencies;
        }
        
        if (utl.isFunction(dependencies)) {
            this.ctor = dependencies;
        } else if (utl.isObject(dependencies)) {
            this.ctor = function () {
                return dependencies;
            };
        } else if (utl.isFunction(ctor)) {
            this.ctor = ctor;
        } else {
            throw err.argumentException('A constructor of type function is required', 'ctor (or dependencies)', name);
        }
    };
    
    Hilary = function (options) {
        var $this = this,
            config = options || {},
            container = { },
            parent = config.parentContainer,
            utils = config.utils || new Utils(),
            exceptions = config.exceptions || new Exceptions(utils),
            pipeline = config.pipeline || new Pipeline($this, utils),
            createChildContainer,
            register,
            resolve,
            amdRegister,
            amdResolve,
            autoRegister,
            autoRegisterOne,
            dispose,
            make,
            makeHilaryModule,
            getReservedModule,
            getContainer,
            getParentContainer,
            extCount,
            extension,
            initCount,
            initializer;
        
        createChildContainer = function (options) {
            options = options || {};
            var opts, child;
            
            opts = {
                parentContainer: $this,
                utils: options.utils || utils,
                exceptions: options.exceptions || exceptions,
                lessMagic: options.lessMagic || config.lessMagic
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
        
        autoRegister = function (index) {
            var key,
                i;
            
            if (utils.isObject(index) && (index.name || index.dependencies || index.factory)) {
                autoRegisterOne(index);
            } else if (utils.isObject(index)) {

                for (key in index) {
                    if (index.hasOwnProperty(key)) {
                        autoRegisterOne(index[key]);
                    }
                }
                
            } else if (utils.isArray(index)) {

                for (i = 0; i < index.length; i += 1) {
                    autoRegisterOne(index[i]);
                }
                
            } else {
                throw exceptions.argumentException('A index must be defined and must be a typeof object or array', 'index');
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
        
        make = function (mdl) {
            if (mdl instanceof HilaryModule) {
                // resolve it's dependencies and execute the factory
                return makeHilaryModule(mdl);
            } else {
                // return the module
                return mdl;
            }
        };
        
        makeHilaryModule = function (mdl) {
            var i, dependencies = [];
            
            if (utils.isArray(mdl.dependencies) && mdl.dependencies.length > 0) {
                // the module has dependencies, let's get them
                for (i = 0; i < mdl.dependencies.length; i++) {
                    dependencies.push(resolve(mdl.dependencies[i]));
                }

                // and apply them
                return mdl.ctor.apply(null, dependencies);
            }

            if (mdl.ctor.length === 0) {
                // the module takes no arguments, return the result of executing it
                return mdl.ctor.call();
            } else {
                // the module takes arguments and has no dependencies, this must be a factory
                return mdl.ctor;
            }
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
            
            // otherwise, try to resolve the module by name
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
        $this.register = config.lessMagic ? register : amdRegister;
        
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
        $this.autoRegister = autoRegister;
        
        /*
        // attempt to resolve a dependency by name (supports parental hierarchy)
        // @param moduleName (string): the qualified name that the module can be located by in the container
        */
        $this.resolve = config.lessMagic ? resolve : amdResolve;
        
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
    exports.HilaryModule = HilaryModule;
    
}(
    (typeof module !== 'undefined' && module.exports) ? module.exports : window,    // node or browser
    (typeof module !== 'undefined' && module.exports) ? require : undefined         // node's require or undefined
));
