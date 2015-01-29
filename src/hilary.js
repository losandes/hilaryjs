/*jslint plusplus: true, regexp: true*/
/*globals module, console, Window*/

/*
// A simple Inversion of Control container
// It's named after Hilary Page, who designed building blocks that later became known as Legos.
*/
(function (exports) {
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
        var objProto = Object.prototype,
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

        this.type = function (obj) {
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

        this.notDefined = function (obj) {
            try {
                return this.type(obj) === 'undefined';
            } catch (e) {
                return true;
            }
        };

        this.isDefined = function (obj) {
            try {
                return this.type(obj) !== 'undefined';
            } catch (e) {
                return false;
            }
        };

        this.isFunction = function (obj) {
            return this.type(obj) === 'function';
        };

        this.notFunction = function (obj) {
            return this.type(obj) !== 'function';
        };

        this.isArray = function (obj) {
            return this.type(obj) === 'array';
        };

        this.notArray = function (obj) {
            return this.type(obj) !== 'array';
        };

        this.isString = function (obj) {
            return this.type(obj) === 'string';
        };

        this.notString = function (obj) {
            return this.type(obj) !== 'string';
        };

        this.isBoolean = function (obj) {
            return this.type(obj) === 'boolean';
        };

        this.notBoolean = function (obj) {
            return this.type(obj) !== 'boolean';
        };

        this.notNullOrWhitespace = function (str) {
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

        this.isNullOrWhitespace = function (str) {
            return this.notNullOrWhitespace(str) === false;
        };
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
            var msg = utils.notDefined(dependencyName) ? message : message + ' (dependency: ' + dependencyName + ')';
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
    
    Pipeline = function (container, utils) {
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
            executeEvent(this.events.beforeRegisterEvents, [container, moduleName, moduleDefinition]);
        };

        afterRegister = function (moduleName, moduleDefinition) {
            executeEvent(this.events.afterRegisterEvents, [container, moduleName, moduleDefinition]);
        };

        beforeResolve = function (moduleName) {
            executeEvent(this.events.beforeResolveEvents, [container, moduleName]);
        };

        afterResolve = function (moduleName) {
            executeEvent(this.events.afterResolveEvents, [container, moduleName]);
        };

        beforeNewChild = function (options) {
            executeEvent(this.events.beforeNewChildEvents, [container, options]);
        };
        
        afterNewChild = function (options, child) {
            executeEvent(this.events.afterNewChildEvents, [container, options, child]);
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
        
        if (utl.isArray(dependencies)) {
            this.dependencies = dependencies;
        }
        
        if (utl.isFunction(dependencies)) {
            this.ctor = dependencies;
        } else if (utl.isFunction(ctor)) {
            this.ctor = ctor;
        } else {
            throw err.argumentException('A constructor of type function is required', 'ctor (or dependencies)', name);
        }
    };
    
    Hilary = function (options) {
        var config = options || {},
            container = {},
            parent = config.parentContainer,
            utils = config.utils || new Utils(),
            exceptions = config.exceptions || new Exceptions(utils),
            pipeline = config.pipeline || new Pipeline(this, utils),
            createChildContainer,
            register,
            resolve,
            make,
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
                parentContainer: this,
                utils: options.utils || utils,
                exceptions: options.exceptions || exceptions
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
            }

            if (utils.notDefined(moduleDefinition)) {
                throw exceptions.argumentException('The second argument must be the module definition', 'moduleDefinition');
            }

            container[moduleName] = moduleDefinition;

            pipeline.afterRegister(moduleName, moduleDefinition);

            return this;
        };
        
        make = function (mdl) {
            if (mdl instanceof HilaryModule) {
                var i,
                    dependencies = [];
                
                if (utils.isArray(mdl.dependencies)) {
                    for (i = 0; i < mdl.dependencies.length; i++) {
                        dependencies.push(resolve(mdl.dependencies[i]));
                    }
                }
                
                return mdl.ctor.apply(null, dependencies);
                
            } else {
                return mdl;
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
            var mdl,
                output;
            
            pipeline.beforeResolve(moduleName);
            
            // If the module being requested is a reserved registration, get the internal object
            output = getReservedModule(moduleName);
            
            // otherwise, try to resolve the module by name
            if (!output) { //(output !== null) {
                mdl = container[moduleName];

                // if the module was found, resolve it's dependencies and return it
                if (mdl !== undefined) {
                    output = make(mdl);
                }
            }
            
            if (output !== undefined) {
                pipeline.afterResolve(moduleName);
                return output;
            }
            
            if (parent === undefined && utils.isFunction(container[constants.notResolvable])) {
                // if a notResolvableException override is registered, execute it
                container[constants.notResolvable](moduleName);
            } else if (parent === undefined) {
                // otherwise, throw the default notResolvableException
                throw exceptions.notResolvableException(moduleName);
            }
            
            // attempt to resolve from the parent container
            return parent.resolve(moduleName);
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
        this.createChildContainer = createChildContainer;
        
        /*
        // access to the container
        */
        this.getContainer = getContainer;

        /*
        // access to the parent container
        */
        this.getParentContainer = getParentContainer;
        
        /*
        // register a module by name
        // @param moduleName (string): the name of the module
        // @param moduleDefinition (object literal, function or HilaryModule): the module definition
        */
        this.register = register;
        
        /*
        // attempt to resolve a dependency by name (supports parental hierarchy)
        // @param moduleName (string): the qualified name that the module can be located by in the container
        */
        this.resolve = resolve;
        
        /*
        // attempt to resolve a dependency by name (supports parental hierarchy)
        // @param moduleName (string): the qualified name that the module can be located by in the container
        */
        this.tryResolve = function (moduleName) {
            try {
                return resolve(moduleName);
            } catch (e) {
                console.log(e);
            }
        };
        
        /*
        // Register an event in the pipeline (beforeRegister, afterRegister, beforeResolve, afterResolve, etc.)
        */
        this.registerEvent = function (eventName, callback) {
            return pipeline.registerEvent(eventName, callback);
        };
        
        /*
        // Provides access to the constants for things like reserved module names and pipeline events.
        */
        this.getConstants = function () {
            return constants;
        };
        
        /*
        // Provides access to the utils module, so extensions can take advantage
        */
        this.getUtils = function () {
            return utils;
        };
        
        /*
        // Provides access to the exceptions module, so extensions can take advantage
        */
        this.getExceptionHandlers = function () {
            return exceptions;
        };
        
        // add extensions to this
        for (extCount = 0; extCount < extensions.length; extCount++) {
            extension = extensions[extCount];
            
            if (utils.isFunction(extension.factory)) {
                this[extension.name] = extension.factory(this);
            } else if (utils.isDefined(extension.factory)) {
                this[extension.name] = extension.factory;
            }
        }
        
        for (initCount = 0; initCount < initializers.length; initCount++) {
            initializer = initializers[initCount];
            
            if (utils.isFunction(initializer)) {
                initializer(this, config);
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
    
}((typeof module !== 'undefined' && module.exports) ? module.exports : window));