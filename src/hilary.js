// A simple Inversion of Control container
// It's named after Hilary Page, who designed building blocks that later became known as Legos.
var hilary = (function () {
    "use strict";

    var $utils,
        $exceptions,
        $hilary,
        defaultNotResolvableHandler;

    // utitlities based on jQuery
    $utils = (function () {
        var $this = {},
            _objProto = Object.prototype,
            _objProtoToStringFunc = _objProto.toString,
            _objProtoHasOwnFunc = _objProto.hasOwnProperty,
            _class2Types = {},
            _class2ObjTypes = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error"];

        for (var i in _class2ObjTypes) {
            var name = _class2ObjTypes[i];
            _class2Types["[object " + name + "]"] = name.toLowerCase();
        }

        $this.isWindow = function(obj) {
            return obj != null && obj == obj.window;
        };

        $this.type = function (obj) {
            if (typeof (obj) === "undefined")
                return "undefined";
            if (obj === null)
                return String(obj);

            return typeof obj === "object" || typeof obj === "function" ?
                _class2Types[_objProtoToStringFunc.call(obj)] || "object" :
                typeof obj;
        };

        $this.notDefined = function (obj) {
            try {
                return $this.type(obj) === 'undefined';
            }
            catch (e) {
                return true;
            }
        };

        $this.isDefined = function (obj) {
            try {
                return $this.type(obj) !== 'undefined';
            }
            catch (e) {
                return false;
            }
        };

        $this.isFunction = function (obj) {
            return $this.type(obj) === 'function';
        };

        $this.notFunction = function (obj) {
            return $this.type(obj) !== 'function';
        };

        $this.isArray = function (obj) {
            return $this.type(obj) === 'array';
        };

        $this.notArray = function (obj) {
            return $this.type(obj) !== 'array';
        };

        $this.isObject = function (obj) {
            // from jQuery
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that DOM nodes and window objects don't pass through, as well
            if (!obj || $this.type(obj) !== "object" || obj.nodeType || $this.isWindow(obj)) {
                return false;
            }

            try {
                // Not own constructor property must be Object
                if (obj.constructor &&
                    !_objProtoHasOwnFunc.call(obj, "constructor") &&
                    !_objProtoHasOwnFunc.call(obj.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects #9897
                return false;
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.

            var key;
            for (key in obj) { }

            return key === undefined || _objProtoHasOwnFunc.call(obj, key);
        };

        $this.isPlainObject = $this.isObject;

        $this.notObject = function (obj) {
            return $this.isObject(obj) === false;
        };

        $this.isEmptyObject = function(obj) {
            var name;
            for ( name in obj ) {
                return false;
            }
            return true;
        };

        $this.isString = function (obj) {
            return $this.type(obj) === 'string';
        };

        $this.notString = function (obj) {
            return $this.type(obj) !== 'string';
        };

        $this.isBoolean = function (obj) {
            return $this.type(obj) === 'boolean';
        };

        $this.notBoolean = function (obj) {
            return $this.type(obj) !== 'boolean';
        };

        $this.notNullOrWhitespace = function (str) {
            if(!str)
                return false;

            if($this.notString(str))
                throw new Error('Unable to check if a non-string is whitespace.');
            
            // ([^\s]*) = is not whitespace
            // /^$|\s+/ = is empty or whitespace

            return /([^\s])/.test(str);
        };

        $this.isNullOrWhitespace = function (str) {
            return $this.notNullOrWhitespace(str) == false;
        };

        return $this;
    })();

    // simplified error handling
    $exceptions = (function (utils) {
        var $this = {};

        $this.exception = function (name, message, data) {
            var _message = utils.isString(message) ? message : name;

            var _err = new Error(_message);
            _err.message = _message;

            if (name != _message)
                _err.name = name;

            if (data)
                _err.data = data;
            return _err;
        };

        $this.argumentException = function (message, argument, data) {
            var _message = utils.notDefined(argument) ? message : message + ' (argument: ' + argument + ')';
            return $this.exception('ArgumentException', _message, data);
        };

        $this.dependencyException = function (message, dependencyName, data) {
            var _message = utils.notDefined(dependencyName) ? message : message + ' (dependency: ' + dependencyName + ')';
            return $this.exception('DependencyException', _message, data);
        };

        $this.notImplementedException = function (message, data) {
            return $this.exception('NotImplementedException', message, data);
        };

        return $this;
    })($utils);

    // the default handler for modules that fail to resolve
    // throws a dependency exception
    // @param moduleName (string): the name of the module that was not resolved
    // @param hilaryContext (hilary instance): the top most container, where the error was thrown
    defaultNotResolvableHandler = function (moduleName, hilaryContext) {
        throw $exceptions.dependencyException('The module cannot be resolved', moduleName);
    };
    
    // A simple Inversion of Control container
    // @param options.utils (object): utilities to use for validation (i.e. isFunction)
    // @param options.exceptions (object): exception handling
    // @param options.notResolvableHandler (function): handler for modules that fail to resolve
    //      // accepts 2 arguments, the moduleName and the hilary instance
    //      // this handler can be used to throw errors, or asynchronously load JavaScript
    // @param options.parentContainer (hilary instance): the parent container
    $hilary = function (options) {
        var $this = {},
            opts = options || {},
            utils = opts.utils || $utils,
            exceptions = opts.exceptions || $exceptions,
            parent = opts.parentContainer,
            container = {},
            beforeRegisterEvents = [],
            afterRegisterEvents = [],
            beforeResolveOneEvents = [],
            beforeResolveEvents = [],
            afterResolveEvents = [],
            beforeNewChildEvents = [],
            afterNewChildEvents = [],
            beforeRegister,
            afterRegister,
            beforeResolveOne,
            beforeResolve,
            afterResolve,
            beforeNewChild,
            afterNewChild,
            executeEvent,
            constants = {
                containerRegistration: 'hilary::container',
                parentContainerRegistration: 'hilary::parent',
                notResolvable: 'hilary::handler::not::resolvable'
            },
            pipeline = {
                beforeRegister: 'hilary::before::register',
                afterRegister: 'hilary::after::register',
                beforeResolveOne: 'hilary::before::resolve::one',
                beforeResolve: 'hilary::before::resolve',
                afterResolve: 'hilary::after::resolve',
                beforeNewChild: 'hilary::before::new::child',
                afterNewChild: 'hilary::after::new::child'
            };

        // validates that a dependency is registered in this container
        // @param name (string): a friendly name for the dependency, which is used if the dependency is missing
        // @param dependency (object literal or function): the expected dependency (i.e. container.foo)
        $this.confirm = function (name, dependency) {
            if (utils.isNullOrWhitespace(name))
                throw exceptions.argumentException('The name cannot be null when confirming a dependency', 'name');

            if (utils.notDefined(dependency)) {
                throw exceptions.argumentException('A dependency is missing, are you missing a reference?', name);
                // TODO: Async Module Loading Here
            }

            return dependency;
        };

        // exposes the constructor for hilary so you can create new top level containers
        // @param options.utils (object): utilities to use for validation (i.e. isFunction)
        // @param options.exceptions (object): exception handling
        // @param options.parentContainer (hilary instance): the parent container
        $this.createContainer = function (options) {
            return $hilary(options);
        };

        // exposes the constructor for hilary so you can create child contexts
        // @param options.utils (object): utilities to use for validation (i.e. isFunction)
        // @param options.exceptions (object): exception handling
        $this.createChildContainer = function (options) {
            options = options || {};
            var _opts = {
                parentContainer: $this,
                utils: options.utils || utils,
                exceptions: options.exceptions || exceptions
            };

            beforeNewChild(_opts);
            var _new = $hilary(_opts);
            afterNewChild(_opts, _new);

            return _new;
        };

        // access to the container
        $this.getContainer = function () { return container; };

        // access to the parent container
        $this.getParentContainer = function () { return parent.getContainer(); };

        // Obsolete: use getContainer instead
        $this.getContext = $this.getContainer;

        // provides access to the container, and allows dependencies to be declared 
        // as the first argument, so as not to separate parameters from dependencies 
        // as we do in typical modules.
        // @param dependencies (function or array): an array of dependencies
        //      or the callback (see @param callback)
        // @param callback (function): a function that accepts a single argument: the container
        $this.use = function (dependencies, callback) {
            if (utils.isFunction(opts.beforeUse))
                opts.beforeUse(dependencies, callback);

            if (utils.isFunction(dependencies))
                dependencies(container);            // execute the callback, passing only the container
            else if (utils.isArray(dependencies) && utils.isFunction(callback)) {
                dependencies.unshift(container);    // add the container to the dependencies array at the beginning
                callback.apply(null, dependencies); // execute the callback with the dependencies
            }
            else if (utils.isFunction(callback))
                callback(container);                // execute the callback, passing only the container

            if (utils.isFunction(opts.afterUse))
                opts.afterUse(dependencies, callback);

            return $this; // make hilary chainable
        };

        // provides acces to the container, without allowing dependencies
        // @param callback: (function): a function that accepts a single argument: the container
        //
        // TODO: define this so that it doesn't accept dependencies (first we have to remove all instances that use it that way)
        $this.run = $this.use; //function (callback) {
        //    if (utils.notFunction(callback))
        //        exceptions.argumentException('The first argument must be a function that accepts on parameter: container', 'callback');
        //    else callback(container);
        //};

        // register a module by name
        // @param moduleName (string or function): the name of the module or a function that accepts a single parameter: container
        // @param moduleDefinition (object literal or function): the module definition
        $this.register = function (moduleNameOrFunc, moduleDefinition) {
            beforeRegister(moduleNameOrFunc, moduleDefinition);

            if (utils.isFunction(moduleNameOrFunc)) {
                moduleNameOrFunc(container);
                return $this;
            }

            if (utils.notString(moduleNameOrFunc))
                exceptions.argumentException('The first argument must be the name of the module', 'moduleNameOrFunc');

            if (utils.notDefined(moduleDefinition))
                exceptions.argumentException('The second argument must be the module definition', 'moduleDefinition');

            container[moduleNameOrFunc] = moduleDefinition;

            afterRegister(moduleNameOrFunc, moduleDefinition);

            return $this;
        };

        // check to see if a module is resolvable, by name (supports parental hierarchy)
        // @param moduleName (string): the qualified name that the module can be located by in the container
        $this.moduleExists = function (moduleName) {
            var _module = container[moduleName];

            if (_module !== undefined)
                return true;

            if (parent === undefined)
                return false;

            return parent.moduleExists(moduleName);
        };

        // attempt to resolve a dependency by name (supports parental hierarchy)
        // @param moduleName (string): the qualified name that the module can be located by in the container
        $this.resolveOne = function (moduleName) {
            beforeResolveOne(moduleName);

            var _module = container[moduleName];

            if (_module !== undefined)
                return _module;

            if (parent === undefined && utils.isFunction(container[constants.notResolvable])) {
                container[constants.notResolvable](moduleName, $this);
            }
            else if (parent === undefined) {
                defaultNotResolvableHandler(moduleName, $this);
            }

            return parent.resolveOne(moduleName);
        };

        // resolve one or more dependencies; find modules by name through the container hierarchy
        // @param moduleNameOrDependencies (string or array of string): the qualified name that the module can be located by in the container
        //      or an array of qualified names that the modules can be located by in the container
        // @param callback (function): if the first argument is an array, then the resolved dependencies 
        //      will be passed into the callback function in the order that they exist in the array
        $this.resolve = function (moduleNameOrDependencies, callback) {
            beforeResolve(moduleNameOrDependencies, callback);

            if (utils.isString(moduleNameOrDependencies)) {
                var _result = $this.resolveOne(moduleNameOrDependencies);

                afterResolve(moduleNameOrDependencies, callback);

                return _result;
            }
            else if (utils.isArray(moduleNameOrDependencies) && utils.isFunction(callback)) {
                var _depends = [];

                for (var i in moduleNameOrDependencies) {
                    var _moduleName = moduleNameOrDependencies[i];

                    if (_moduleName === constants.containerRegistration)
                        _depends.push(container);
                    else if (_moduleName === constants.parentContainerRegistration && parent !== undefined)
                        _depends.push($this.getParentContainer());
                    else if (_moduleName === constants.parentContainerRegistration)
                        _depends.push(null);
                    else
                        _depends.push($this.resolveOne(_moduleName));
                }
                callback.apply(null, _depends);
            }
            else {
                throw exceptions.argumentException('one or more of the arguments passed are invalid',
                    'module name, dependencies or callback');
            }

            afterResolve(moduleNameOrDependencies, callback);

            return $this;
        };

        //#region events

        $this.registerEvent = function(name, callback) {
            switch(name) {
                case pipeline.beforeRegister:
                    beforeRegisterEvents.push(callback);
                    break;
                case pipeline.afterRegister:
                    afterRegisterEvents.push(callback);
                    break;
                case pipeline.beforeResolveOne:
                    beforeResolveOneEvents.push(callback);
                    break;
                case pipeline.beforeResolve:
                    beforeResolveEvents.push(callback);
                    break;
                case pipeline.afterResolve:
                    afterResolveEvents.push(callback);
                    break;
                case pipeline.beforeNewChild:
                    beforeNewChildEvents.push(callback);
                    break;
                case pipeline.afterNewChild:
                    afterNewChildEvents.push(callback);
                    break;
                default:
                    throw exceptions.notImplementedException('the pipeline event you are trying to register is not implemented (name: ' + name + ')');
            };
        };

        executeEvent = function(eventArray, argumentArray) {
            for (var i in eventArray) {
                var _event = eventArray[i];

                if(utils.isFunction(_event))
                    _event.apply(null, argumentArray);
            }
        };

        beforeRegister = function(moduleNameOrFunc, moduleDefinition) {
            executeEvent(beforeRegisterEvents, [container, moduleNameOrFunc, moduleDefinition]);
        };

        afterRegister = function(moduleNameOrFunc, moduleDefinition) {
            executeEvent(afterRegisterEvents, [container, moduleNameOrFunc, moduleDefinition]);
        };

        beforeResolveOne = function (moduleName) {
            executeEvent(beforeResolveOneEvents, [container, moduleName]);
        };

        beforeResolve = function (moduleNameOrDependencies, callback) {
            executeEvent(beforeResolveEvents, [container, moduleNameOrDependencies, callback]);
        };

        afterResolve = function (moduleNameOrDependencies, callback) {
            executeEvent(afterResolveEvents, [container, moduleNameOrDependencies, callback]);
        };

        beforeNewChild = function(options) {
            executeEvent(beforeNewChildEvents, [container, options]);
        };
        
        afterNewChild = function(options, child) {
            executeEvent(afterNewChildEvents, [container, options, child]);
        };

        //#endregion events

        // return the public members
        return $this;

    }; // / $hilary

    // put a ready-to-use hilary instance on window
    return $hilary({
        utils: $utils,
        exceptions: $exceptions
    });
})();