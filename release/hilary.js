/*! hilary-build 2015-07-23 */
(function(exports, nodeRequire) {
    "use strict";
    if (exports.Hilary) {
        return false;
    }
    var Hilary, HilarysPrivateParts, PipelineEvents, Pipeline, constants, extensions = [], scopes = {}, initializers = [], is, id, asyncHandler, Blueprint, Exceptions, async;
    constants = {
        containerRegistration: "hilary::container",
        parentContainerRegistration: "hilary::parent",
        blueprintRegistration: "hilary::Blueprint",
        singletons: "__singletons",
        notResolvable: "hilary::handler::not::resolvable",
        pipeline: {
            beforeRegister: "hilary::before::register",
            afterRegister: "hilary::after::register",
            beforeResolve: "hilary::before::resolve",
            afterResolve: "hilary::after::resolve",
            beforeNewChild: "hilary::before::new::child",
            afterNewChild: "hilary::after::new::child",
            onError: "hilary::error"
        }
    };
    is = function() {
        var self = {
            getType: undefined,
            defined: undefined,
            nullOrUndefined: undefined,
            "function": undefined,
            object: undefined,
            array: undefined,
            string: undefined,
            bool: undefined,
            "boolean": undefined,
            datetime: undefined,
            regexp: undefined,
            number: undefined,
            nullOrWhitespace: undefined,
            money: undefined,
            decimal: undefined,
            Window: undefined,
            not: {
                defined: undefined,
                "function": undefined,
                object: undefined,
                array: undefined,
                string: undefined,
                bool: undefined,
                "boolean": undefined,
                datetime: undefined,
                regexp: undefined,
                number: undefined,
                nullOrWhitespace: undefined,
                money: undefined,
                decimal: undefined,
                Window: undefined
            }
        }, class2Types = {}, class2ObjTypes = [ "Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object" ], i, name;
        for (i = 0; i < class2ObjTypes.length; i += 1) {
            name = class2ObjTypes[i];
            class2Types["[object " + name + "]"] = name.toLowerCase();
        }
        self.getType = function(obj) {
            if (typeof obj === "undefined") {
                return "undefined";
            }
            if (obj === null) {
                return String(obj);
            }
            return typeof obj === "object" || typeof obj === "function" ? class2Types[Object.prototype.toString.call(obj)] || "object" : typeof obj;
        };
        self.defined = function(obj) {
            try {
                return self.getType(obj) !== "undefined";
            } catch (e) {
                return false;
            }
        };
        self.not.defined = function(obj) {
            return self.defined(obj) === false;
        };
        self.nullOrUndefined = function(obj) {
            return self.not.defined(obj) || obj === null;
        };
        self.not.nullOrWhitespace = function(str) {
            if (typeof str === "undefined" || typeof str === null || self.not.string(str)) {
                return false;
            }
            return /([^\s])/.test(str);
        };
        self.nullOrWhitespace = function(str) {
            return self.not.nullOrWhitespace(str) === false;
        };
        self.function = function(obj) {
            return self.getType(obj) === "function";
        };
        self.not.function = function(obj) {
            return self.function(obj) === false;
        };
        self.object = function(obj) {
            return self.getType(obj) === "object";
        };
        self.not.object = function(obj) {
            return self.object(obj) === false;
        };
        self.array = function(obj) {
            return self.getType(obj) === "array";
        };
        self.not.array = function(obj) {
            return self.array(obj) === false;
        };
        self.string = function(obj) {
            return self.getType(obj) === "string";
        };
        self.not.string = function(obj) {
            return self.string(obj) === false;
        };
        self.bool = function(obj) {
            return self.getType(obj) === "boolean";
        };
        self.not.bool = function(obj) {
            return self.boolean(obj) === false;
        };
        self.boolean = function(obj) {
            return self.getType(obj) === "boolean";
        };
        self.not.boolean = function(obj) {
            return self.boolean(obj) === false;
        };
        self.datetime = function(obj) {
            return self.getType(obj) === "date";
        };
        self.not.datetime = function(obj) {
            return self.datetime(obj) === false;
        };
        self.regexp = function(obj) {
            return self.getType(obj) === "regexp";
        };
        self.not.regexp = function(obj) {
            return self.regexp(obj) === false;
        };
        self.number = function(obj) {
            return self.getType(obj) === "number";
        };
        self.not.number = function(obj) {
            return self.number(obj) === false;
        };
        self.money = function(val) {
            return self.defined(val) && /^(?:-)?[0-9]\d*(?:\.\d{0,2})?$/.test(val.toString());
        };
        self.not.money = function(val) {
            return self.money(val) === false;
        };
        self.decimal = function(num, places) {
            if (self.not.number(num)) {
                return false;
            }
            if (!places && self.number(num)) {
                return true;
            }
            if (!num || +(+num || 0).toFixed(places) !== +num) {
                return false;
            }
            return true;
        };
        self.not.decimal = function(val) {
            return self.decimal(val) === false;
        };
        self.Window = function(obj) {
            return self.is.defined(Window) && obj instanceof Window;
        };
        self.not.Window = function(obj) {
            return self.is.Window(obj) === false;
        };
        return self;
    }();
    id = function() {
        var self = {
            createUid: undefined,
            createGuid: undefined
        }, createRandomString;
        createRandomString = function(templateString) {
            return templateString.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
                return v.toString(16);
            });
        };
        self.createUid = function(length) {
            var template;
            length = length || 12;
            template = new Array(length + 1).join("x");
            return createRandomString(template);
        };
        self.createGuid = function() {
            return createRandomString("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx");
        };
        return self;
    }();
    asyncHandler = function(is) {
        var self = {
            runAsync: undefined
        };
        self.runAsync = function(func, highPriority) {
            if (highPriority === true && is.defined(process) && is.function(process.nextTick)) {
                process.nextTick(func);
            } else {
                setTimeout(func, 0);
            }
        };
        return self;
    }(is);
    Blueprint = function(utils, is, id) {
        var Blueprint, signatureMatches, syncSignatureMatches, validateSignature, syncValidateSignature, validateProperty, validatePropertyWithDetails, validatePropertyType, validateFunctionArguments, validateDecimalWithPlaces, validateBooleanArgument, locale = {
            errors: {
                blueprint: {
                    requiresImplementation: "An implementation is required to create a new instance of an interface",
                    requiresProperty: "The implementation is missing a required property ",
                    requiresArguments: "The implementation of this function requires arguments ",
                    missingConstructorArgument: "An object literal is required when constructing a Blueprint",
                    reservedPropertyName_singatureMatches: "signatureMatches is a reserved property name for Blueprints",
                    missingSignatureMatchesImplementationArgument: "A first argument of an object that should implement an interface is required",
                    missingSignatureMatchesCallbackArgument: "A callback function is required as the second argument to signatureMatches"
                }
            }
        };
        signatureMatches = function(implementation, blueprint, callback) {
            var newCallback;
            implementation.__interfaces = implementation.__interfaces || {};
            newCallback = function(err, result) {
                if (!err) {
                    implementation.__interfaces[blueprint.__blueprintId] = true;
                }
                if (typeof callback === "function") {
                    callback(err, result);
                }
            };
            validateSignature(implementation, blueprint, newCallback);
        };
        syncSignatureMatches = function(implementation, blueprint) {
            var validationResult;
            implementation.__interfaces = implementation.__interfaces || {};
            validationResult = syncValidateSignature(implementation, blueprint);
            if (validationResult.result) {
                implementation.__interfaces[blueprint.__blueprintId] = true;
            }
            return validationResult;
        };
        validateSignature = function(implementation, blueprint, callback) {
            var validationResult = syncValidateSignature(implementation, blueprint);
            if (validationResult.result) {
                callback(null, true);
            } else {
                callback(validationResult.errors, false);
            }
        };
        syncValidateSignature = function(implementation, blueprint) {
            var errors = [], prop;
            if (implementation.__interfaces[blueprint.__blueprintId]) {
                return {
                    errors: null,
                    result: true
                };
            }
            for (prop in blueprint.props) {
                if (blueprint.props.hasOwnProperty(prop)) {
                    validateProperty(implementation, prop, blueprint.props[prop], errors);
                }
            }
            if (errors.length > 0) {
                return {
                    errors: errors,
                    result: false
                };
            } else {
                return {
                    errors: null,
                    result: true
                };
            }
        };
        validateProperty = function(implementation, propertyName, propertyValue, errors) {
            if (is.string(propertyValue)) {
                validatePropertyType(implementation, propertyName, propertyValue, errors);
            } else if (is.object(propertyValue)) {
                validatePropertyWithDetails(implementation, propertyName, propertyValue, propertyValue.type, errors);
            }
        };
        validatePropertyWithDetails = function(implementation, propertyName, propertyValue, type, errors) {
            if (is.function(propertyValue.validate)) {
                propertyValue.validate(implementation[propertyName], errors);
            } else {
                switch (type) {
                  case "function":
                    validatePropertyType(implementation, propertyName, type, errors);
                    validateFunctionArguments(implementation, propertyName, propertyValue.args, errors);
                    break;

                  case "decimal":
                    validateDecimalWithPlaces(implementation, propertyName, propertyValue.places, errors);
                    break;

                  default:
                    validatePropertyType(implementation, propertyName, type, errors);
                    break;
                }
            }
        };
        validatePropertyType = function(implementation, propertyName, propertyType, errors) {
            if (is.function(is.not[propertyType]) && is.not[propertyType](implementation[propertyName])) {
                var message = locale.errors.blueprint.requiresProperty;
                message += "@property: " + propertyName;
                message += " (" + propertyType + ")";
                errors.push(message);
            }
        };
        validateFunctionArguments = function(implementation, propertyName, propertyArguments, errors) {
            var argumentsAreValid = is.array(propertyArguments);
            argumentsAreValid = argumentsAreValid && propertyArguments.length > 0;
            argumentsAreValid = argumentsAreValid && is.function(implementation[propertyName]);
            argumentsAreValid = argumentsAreValid && implementation[propertyName].length === propertyArguments.length;
            if (!argumentsAreValid) {
                errors.push(locale.errors.blueprint.requiresArguments + "(" + propertyArguments.join(", ") + ")");
            }
        };
        validateDecimalWithPlaces = function(implementation, propertyName, places, errors) {
            if (is.not.decimal(implementation[propertyName], places)) {
                var message = locale.errors.blueprint.requiresProperty;
                message += "@property: " + propertyName;
                message += " (decimal with " + places + " places)";
                errors.push(message);
            }
        };
        validateBooleanArgument = function(implementation, propertyName, errors) {
            if (is.function(is.not.boolean) && is.not.boolean(implementation[propertyName])) {
                var message = locale.errors.blueprint.requiresProperty;
                message += "@property: " + propertyName;
                message += " (boolean)";
                errors.push(message);
            }
        };
        Blueprint = function(blueprint) {
            var self = this, prop;
            blueprint = blueprint || {};
            self.props = {};
            for (prop in blueprint) {
                if (blueprint.hasOwnProperty(prop)) {
                    if (prop === "__blueprintId") {
                        self.__blueprintId = blueprint.__blueprintId;
                    } else {
                        self.props[prop] = blueprint[prop];
                    }
                }
            }
            if (is.not.string(self.__blueprintId)) {
                self.__blueprintId = id.createUid(8);
            }
            self.signatureMatches = function(implementation, callback) {
                if (is.not.defined(implementation)) {
                    callback([ locale.errors.blueprint.missingSignatureMatchesImplementationArgument ]);
                    return;
                }
                if (is.not.function(callback)) {
                    throw new Error(locale.errors.blueprint.missingSignatureMatchesCallbackArgument);
                }
                utils.runAsync(function() {
                    signatureMatches(implementation, self, callback);
                });
            };
            self.syncSignatureMatches = function(implementation) {
                if (is.not.defined(implementation)) {
                    return {
                        errors: [ locale.errors.blueprint.missingSignatureMatchesImplementationArgument ],
                        result: false
                    };
                }
                return syncSignatureMatches(implementation, self);
            };
            self.inherits = function(otherBlueprint) {
                for (prop in otherBlueprint.props) {
                    if (otherBlueprint.props.hasOwnProperty(prop)) {
                        self.props[prop] = otherBlueprint.props[prop];
                    }
                }
            };
        };
        return Blueprint;
    }(asyncHandler, is, id);
    Exceptions = function(is, pipeline) {
        var $this = {}, makeException;
        makeException = function(name, message, data) {
            var msg = is.string(message) ? message : name, err = new Error(msg);
            err.message = msg;
            if (name !== msg) {
                err.name = name;
            }
            if (data) {
                err.data = data;
            }
            pipeline.onError(err);
            return err;
        };
        $this.makeException = makeException;
        $this.argumentException = function(message, argument, data) {
            var msg = is.not.defined(argument) ? message : message + " (argument: " + argument + ")";
            return makeException("ArgumentException", msg, data);
        };
        $this.dependencyException = function(message, dependencyName, data) {
            var msg = is.not.defined(dependencyName) ? message : message + " (dependency: " + dependencyName + "). If the module exists, does it return a value?";
            return makeException("DependencyException", msg, data);
        };
        $this.notImplementedException = function(message, data) {
            return makeException("NotImplementedException", message, data);
        };
        $this.notResolvableException = function(moduleName) {
            return $this.dependencyException("The module cannot be resolved", moduleName);
        };
        return $this;
    };
    PipelineEvents = function() {
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
    Pipeline = function(scope, is) {
        var $this = {}, registerEvent, executeEvent, pipelineEvents = new PipelineEvents(), beforeRegister, afterRegister, beforeResolve, afterResolve, beforeNewChild, afterNewChild, onError;
        registerEvent = function(name, callback) {
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
                throw new Error("the pipeline event you are trying to register is not implemented (name: " + name + ")");
            }
        };
        executeEvent = function(eventArray, argumentArray) {
            var i, event;
            for (i = 0; i < eventArray.length; i += 1) {
                event = eventArray[i];
                if (event.once) {
                    eventArray.splice(i, 1);
                }
                if (is.function(event)) {
                    event.apply(null, argumentArray);
                }
            }
        };
        beforeRegister = function(moduleInfo) {
            executeEvent($this.events.beforeRegisterEvents, [ scope, moduleInfo ]);
        };
        afterRegister = function(moduleInfo) {
            executeEvent($this.events.afterRegisterEvents, [ scope, moduleInfo ]);
        };
        beforeResolve = function(moduleName) {
            executeEvent($this.events.beforeResolveEvents, [ scope, moduleName ]);
        };
        afterResolve = function(moduleInfo) {
            executeEvent($this.events.afterResolveEvents, [ scope, moduleInfo ]);
        };
        beforeNewChild = function(options) {
            executeEvent($this.events.beforeNewChildEvents, [ scope, options ]);
        };
        afterNewChild = function(options, child) {
            executeEvent($this.events.afterNewChildEvents, [ scope, options, child ]);
        };
        onError = function(err) {
            executeEvent($this.events.onError, [ err ]);
        };
        $this.events = pipelineEvents;
        $this.registerEvent = registerEvent;
        $this.onError = onError;
        $this.beforeRegister = beforeRegister;
        $this.afterRegister = afterRegister;
        $this.beforeResolve = beforeResolve;
        $this.afterResolve = afterResolve;
        $this.beforeNewChild = beforeNewChild;
        $this.afterNewChild = afterNewChild;
        return $this;
    };
    HilarysPrivateParts = function(is, asyncHandler) {
        return function(scope, container, singletons, pipeline, parent, err) {
            var $this = {}, blueprintMatchPairs = [], autowire, makeBlueprintValidator, registerBlueprintMatchPair, getParameterNames, makeSingleton, STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm, ARGUMENT_NAMES = /([^\s,]+)/g;
            $this.HilaryModule = function(definition) {
                var $this = {};
                if (is.not.string(definition.name)) {
                    throw err.argumentException("The module name is required", "name");
                }
                if (is.not.defined(definition.factory)) {
                    throw err.argumentException("The module factory is required", "factory");
                }
                $this.name = definition.name;
                $this.dependencies = definition.dependencies || undefined;
                $this.factory = definition.factory;
                $this.blueprint = definition.blueprint;
                $this.singleton = definition.singleton;
                return $this;
            };
            $this.asyncHandler = function(action, next) {
                var _action = function() {
                    var result;
                    try {
                        result = action();
                    } catch (err) {
                        if (is.function(next)) {
                            next(err);
                        }
                        return;
                    }
                    if (is.function(next)) {
                        next(null, result);
                    }
                };
                if (async) {
                    async.nextTick(_action);
                } else {
                    asyncHandler.runAsync(_action);
                }
            };
            $this.createChildContainer = function(scope, options) {
                options = options || {};
                var child;
                options.parentContainer = scope;
                pipeline.beforeNewChild(options);
                child = new Hilary(options);
                if (scope.registerAsync) {
                    child.useAsync(async);
                }
                pipeline.afterNewChild(options, child);
                return child;
            };
            autowire = function(hilaryModule) {
                if (hilaryModule.dependencies || typeof hilaryModule.factory !== "function") {
                    return hilaryModule;
                }
                hilaryModule.dependencies = getParameterNames(hilaryModule.factory);
                return hilaryModule;
            };
            getParameterNames = function(func) {
                if (!func) {
                    return [];
                }
                var functionTxt = func.toString().replace(STRIP_COMMENTS, ""), result = functionTxt.slice(functionTxt.indexOf("(") + 1, functionTxt.indexOf(")")).match(ARGUMENT_NAMES);
                if (result === null) {
                    result = [];
                }
                return result;
            };
            makeBlueprintValidator = function(blueprintName, moduleName) {
                return function() {
                    var blueprint = scope.resolve(blueprintName), implementation = scope.resolve(moduleName), blueprintNotBlueprint = is.not.function(blueprint.signatureMatches), errorMessage = "Blueprints must have a signatureMatches function";
                    if (blueprintNotBlueprint) {
                        return {
                            errors: [ errorMessage ],
                            result: false
                        };
                    }
                    return blueprint.syncSignatureMatches(implementation);
                };
            };
            registerBlueprintMatchPair = function(hilaryModule) {
                if (is.string(hilaryModule.blueprint)) {
                    blueprintMatchPairs.push({
                        blueprintName: hilaryModule.blueprint,
                        moduleName: hilaryModule.name
                    });
                } else if (is.array(hilaryModule.blueprint)) {
                    var i;
                    for (i = 0; i < hilaryModule.blueprint.length; i += 1) {
                        blueprintMatchPairs.push({
                            blueprintName: hilaryModule.blueprint[i],
                            moduleName: hilaryModule.name
                        });
                    }
                }
            };
            makeSingleton = function(hilaryModule, singletonInstance) {
                var makeIt = function(name, factory) {
                    singletons[name] = factory;
                    container[name].originalDependencies = container[name].dependencies;
                    container[name].dependencies = undefined;
                    container[name].originalFactory = container[name].factory;
                    container[name].factory = function() {
                        return singletons[name];
                    };
                };
                if (singletonInstance) {
                    makeIt(hilaryModule.name, singletonInstance);
                } else if (is.object(hilaryModule.factory) || is.function(hilaryModule.factory) && hilaryModule.factory.length > 0 && (is.not.defined(hilaryModule.dependencies) || hilaryModule.dependencies.length < 1)) {
                    makeIt(hilaryModule.name, hilaryModule.factory);
                }
            };
            $this.register = function(hilaryModule) {
                pipeline.beforeRegister(hilaryModule);
                if (hilaryModule.name === constants.containerRegistration || hilaryModule.name === constants.parentContainerRegistration) {
                    throw err.argumentException("The name you are trying to register is reserved", "moduleName", hilaryModule.name);
                }
                hilaryModule = autowire(hilaryModule);
                container[hilaryModule.name] = hilaryModule;
                makeSingleton(hilaryModule);
                if (is.defined(hilaryModule.blueprint)) {
                    registerBlueprintMatchPair(hilaryModule);
                }
                $this.asyncHandler(function() {
                    pipeline.afterRegister(hilaryModule);
                });
                return hilaryModule;
            };
            $this.resolve = function(moduleName) {
                var output;
                if (is.not.string(moduleName)) {
                    throw err.argumentException("The moduleName must be a string. If you are trying to resolve an array, use resolveMany.", "moduleName");
                }
                pipeline.beforeResolve(moduleName);
                if (container[moduleName] !== undefined) {
                    output = $this.invoke(container[moduleName]);
                    if (container[moduleName].singleton === true) {
                        makeSingleton(container[moduleName], output);
                    }
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
                    throw err.notResolvableException(moduleName);
                }
            };
            $this.resolveMany = function(moduleNameArray, next) {
                var modules = [], i, current;
                if (is.not.array(moduleNameArray)) {
                    throw err.argumentException("The moduleNameArray is required and must be an Array", "moduleNameArray");
                }
                if (is.not.function(next)) {
                    throw err.argumentException("The next argument is required and must be a Function", "next");
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
            $this.resolveManyAsync = function(moduleNameArray, next) {
                var moduleTasks = [], modules = {}, i, makeTask = function(moduleName) {
                    return function(callback) {
                        try {
                            modules[moduleName] = scope.resolve(moduleName);
                            callback(null, null);
                        } catch (e) {
                            callback(e);
                        }
                    };
                };
                if (is.not.array(moduleNameArray)) {
                    throw err.argumentException("The moduleNameArray is required and must be an Array", "moduleNameArray");
                }
                if (is.not.function(next)) {
                    throw err.argumentException("The next argument is required and must be a Function", "next");
                }
                for (i = 0; i < moduleNameArray.length; i += 1) {
                    moduleTasks.push(makeTask(moduleNameArray[i]));
                }
                async.parallel(moduleTasks, function(err) {
                    next(err, modules);
                });
            };
            $this.resolveAsync = function(moduleName, next) {
                var validateTask, beforeResolveTask, findAndInvokeResultTask, findResultTask, afterResultTask;
                validateTask = function(_next) {
                    if (is.not.string(moduleName)) {
                        _next(err.argumentException("The moduleName must be a string. If you are trying to resolve an array, use resolveManyAsync.", "moduleName"));
                    } else {
                        _next(null, null);
                    }
                };
                beforeResolveTask = function(previousTaskResult, _next) {
                    _next(null, pipeline.beforeResolve(moduleName));
                };
                findAndInvokeResultTask = function(previousTaskResult, _next) {
                    if (container[moduleName] !== undefined) {
                        $this.invokeAsync(container[moduleName], _next);
                    } else {
                        _next(null, null);
                    }
                };
                findResultTask = function(previousTaskResult, _next) {
                    if (previousTaskResult) {
                        _next(null, previousTaskResult);
                    } else {
                        _next(null, $this.findResult(moduleName));
                    }
                };
                afterResultTask = function(previousTaskResult, _next) {
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
                async.waterfall([ validateTask, beforeResolveTask, findAndInvokeResultTask, findResultTask, afterResultTask ], next);
            };
            $this.findResult = function(moduleName) {
                if (moduleName === constants.containerRegistration) {
                    return container;
                } else if (moduleName === constants.parentContainerRegistration) {
                    return parent.getContext().container;
                } else if (moduleName === constants.blueprintRegistration) {
                    return Hilary.Blueprint;
                } else if (parent !== undefined) {
                    return parent.resolve(moduleName);
                } else if (nodeRequire) {
                    try {
                        return nodeRequire(moduleName);
                    } catch (e) {
                        return null;
                    }
                } else if (window) {
                    return exports[moduleName];
                }
            };
            $this.returnResult = function(result) {
                $this.asyncHandler(function() {
                    pipeline.afterResolve(result);
                });
                return result.result;
            };
            $this.invoke = function(theModule) {
                if (is.array(theModule.dependencies) && theModule.dependencies.length > 0) {
                    return $this.applyDependencies(theModule);
                }
                if (is.function(theModule.factory) && theModule.factory.length === 0) {
                    return theModule.factory.call();
                } else {
                    return theModule.factory;
                }
            };
            $this.invokeAsync = function(theModule, next) {
                var output;
                if (is.array(theModule.dependencies) && theModule.dependencies.length > 0) {
                    $this.applyDependenciesAsync(theModule, next);
                    return;
                }
                if (is.function(theModule.factory) && theModule.factory.length === 0) {
                    output = theModule.factory.call();
                } else {
                    output = theModule.factory;
                }
                if (theModule.singleton === true) {
                    makeSingleton(theModule, output);
                }
                next(null, output);
            };
            $this.applyDependencies = function(theModule) {
                var i, dependencies = [], resolveModule = function(moduleName) {
                    return $this.resolve(moduleName);
                };
                for (i = 0; i < theModule.dependencies.length; i += 1) {
                    dependencies.push(resolveModule(theModule.dependencies[i]));
                }
                return theModule.factory.apply(null, dependencies);
            };
            $this.applyDependenciesAsync = function(theModule, next) {
                var i, dependencyTasks = [], makeTask = function(moduleName) {
                    return function(callback) {
                        $this.resolveAsync(moduleName, callback);
                    };
                };
                for (i = 0; i < theModule.dependencies.length; i += 1) {
                    dependencyTasks.push(makeTask(theModule.dependencies[i]));
                }
                async.parallel(dependencyTasks, function(err, dependencies) {
                    var output = theModule.factory.apply(null, dependencies);
                    if (theModule.singleton === true) {
                        makeSingleton(theModule, output);
                    }
                    next(null, output);
                });
            };
            $this.makeAutoRegistrationTasks = function(index, makeTask) {
                var key, i, tasks = [];
                if (is.object(index) && (index.name || index.dependencies || index.factory)) {
                    tasks.push(function() {
                        makeTask(index).call();
                    });
                } else if (is.object(index)) {
                    for (key in index) {
                        if (index.hasOwnProperty(key)) {
                            tasks.push(makeTask(index[key]));
                        }
                    }
                } else if (is.array(index)) {
                    for (i = 0; i < index.length; i += 1) {
                        tasks.push(makeTask(index[i]));
                    }
                } else {
                    throw err.argumentException("A index must be defined and must be a typeof object or array", "index");
                }
                return tasks;
            };
            $this.autoRegister = function(index, next) {
                var makeTask, tasks, i;
                makeTask = function(item) {
                    return function() {
                        $this.register(item);
                    };
                };
                try {
                    tasks = $this.makeAutoRegistrationTasks(index, makeTask);
                    for (i = 0; i < tasks.length; i += 1) {
                        tasks[i]();
                    }
                    if (is.function(next)) {
                        next(null);
                    }
                } catch (e) {
                    next(e);
                }
            };
            $this.autoResolve = function(index, next) {
                var makeTask, tasks, i;
                makeTask = function(item) {
                    return function() {
                        if (is.array(item.dependencies) && is.function(item.factory)) {
                            scope.resolveMany(item.dependencies, item.factory);
                        } else if (is.function(item.factory) && item.factory.length === 0) {
                            item.factory();
                        }
                    };
                };
                try {
                    tasks = $this.makeAutoRegistrationTasks(index, makeTask);
                    for (i = 0; i < tasks.length; i += 1) {
                        tasks[i]();
                    }
                    if (is.function(next)) {
                        next(null, null);
                    }
                } catch (e) {
                    next(e);
                }
            };
            $this.autoResolveAsync = function(index, next) {
                var makeTask;
                makeTask = function(item) {
                    return function(callback) {
                        if (is.array(item.dependencies) && is.function(item.factory)) {
                            scope.resolveManyAsync(item.dependencies, item.factory);
                            callback(null, null);
                        } else if (is.function(item.factory) && item.factory.length === 0) {
                            item.factory();
                            callback(null, null);
                        } else {
                            callback(err.argumentException("One or more of the items in this index do not meet the requirements for resolution.", "index", item));
                        }
                    };
                };
                async.parallel($this.makeAutoRegistrationTasks(index, makeTask), next);
            };
            $this.dispose = function(moduleName) {
                var key, i, result;
                if (is.string(moduleName)) {
                    return $this.disposeOne(moduleName);
                } else if (is.array(moduleName)) {
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
            $this.disposeOne = function(moduleName) {
                if (container[moduleName]) {
                    delete container[moduleName];
                    return true;
                } else {
                    return false;
                }
            };
            $this.validateBlueprints = function() {
                var currentResult, blueprintValidators = [], errors = [], result = true, i;
                for (i = 0; i < blueprintMatchPairs.length; i += 1) {
                    blueprintValidators.push(makeBlueprintValidator(blueprintMatchPairs[i].blueprintName, blueprintMatchPairs[i].moduleName));
                }
                for (i = 0; i < blueprintValidators.length; i += 1) {
                    currentResult = blueprintValidators[i]();
                    if (currentResult.result === false) {
                        errors.concat(currentResult.errors);
                        result = false;
                    }
                }
                if (result) {
                    return {
                        errors: null,
                        result: true
                    };
                } else {
                    return {
                        errors: errors,
                        result: false
                    };
                }
            };
            $this.validateBlueprintsAsync = function(next) {
                var makeTask, tasks = [], i;
                makeTask = function(i) {
                    return function(callback) {
                        var valResult = makeBlueprintValidator(blueprintMatchPairs[i].blueprintName, blueprintMatchPairs[i].moduleName)();
                        callback(valResult.errors, valResult.result);
                    };
                };
                for (i = 0; i < blueprintMatchPairs.length; i += 1) {
                    tasks.push(makeTask(i));
                }
                async.parallel(tasks, next);
            };
            $this.useAsync = function(_async) {
                if (!_async || !_async.nextTick || !_async.waterfall || !_async.parallel) {
                    throw err.argumentException("The async library is required (https://www.npmjs.com/package/async)", "async");
                }
                if (!async) {
                    async = _async;
                }
                scope.registerAsync = function(definition, next) {
                    $this.asyncHandler(function() {
                        return scope.register(definition);
                    }, next);
                    return scope;
                };
                scope.autoRegisterAsync = function(index, next) {
                    var makeTask;
                    makeTask = function(item) {
                        return function(callback) {
                            scope.registerAsync(item, callback);
                        };
                    };
                    async.parallel($this.makeAutoRegistrationTasks(index, makeTask), next);
                    return scope;
                };
                scope.resolveAsync = function(moduleName, next) {
                    $this.resolveAsync(moduleName, next);
                    return scope;
                };
                scope.resolveManyAsync = function(moduleNameArray, next) {
                    $this.resolveManyAsync(moduleNameArray, next);
                    return scope;
                };
                scope.autoResolveAsync = function(index, next) {
                    $this.autoResolveAsync(index, next);
                    return scope;
                };
                scope.disposeAsync = function(moduleName, next) {
                    var _next = next, _moduleName = moduleName;
                    if (is.function(moduleName)) {
                        _next = moduleName;
                        _moduleName = null;
                    }
                    $this.asyncHandler(function() {
                        return scope.dispose(_moduleName);
                    }, _next);
                    return scope;
                };
                scope.validateBlueprintsAsync = function(next) {
                    $this.validateBlueprintsAsync(next);
                    return scope;
                };
                scope.registerEventAsync = function(eventName, eventHandler, next) {
                    $this.asyncHandler(function() {
                        return scope.registerEvent(eventName, eventHandler);
                    }, next);
                    return scope;
                };
                return scope;
            };
            return $this;
        };
    }(is, asyncHandler);
    Hilary = function(options) {
        var $this = this, config = options || {}, container = {}, singletons = {}, parent = config.parentContainer, pipeline = config.pipeline || new Pipeline($this, is), err = new Exceptions(is, pipeline), ext = {}, init = {}, prive = new HilarysPrivateParts($this, container, singletons, pipeline, parent, err);
        $this.createChildContainer = function(options) {
            var opts;
            if (is.string(options)) {
                opts = {
                    name: options
                };
            } else if (is.object(options)) {
                opts = options;
            } else {
                opts = {};
            }
            return prive.createChildContainer($this, opts);
        };
        $this.setParentContainer = function(scope) {
            if (typeof scope.register === "function" && typeof scope.resolve === "function") {
                parent = scope;
                prive = new HilarysPrivateParts($this, container, singletons, pipeline, parent, err);
            }
        };
        $this.register = function(definition) {
            prive.register(new prive.HilaryModule(definition));
            return $this;
        };
        $this.autoRegister = function(index, next) {
            prive.autoRegister(index, next);
            return $this;
        };
        $this.resolve = function(moduleName) {
            return prive.resolve(moduleName);
        };
        $this.resolveMany = function(moduleNameArray, next) {
            return prive.resolveMany(moduleNameArray, next);
        };
        $this.autoResolve = function(index, next) {
            prive.autoResolve(index, next);
            return $this;
        };
        $this.dispose = function(moduleName) {
            return prive.dispose(moduleName);
        };
        $this.registerEvent = function(eventName, eventHandler) {
            pipeline.registerEvent(eventName, eventHandler);
            return $this;
        };
        $this.validateBlueprints = function() {
            return prive.validateBlueprints();
        };
        $this.useAsync = function(async) {
            prive.useAsync(async);
            return $this;
        };
        $this.getContext = function() {
            return {
                container: container,
                singletons: singletons,
                parent: parent,
                pipeline: pipeline,
                HilaryModule: prive.HilaryModule,
                register: prive.register,
                constants: constants,
                is: is,
                id: id,
                exceptionHandlers: err
            };
        };
        for (ext.count = 0; ext.count < extensions.length; ext.count += 1) {
            ext.current = extensions[ext.count];
            if (is.function(ext.current.factory)) {
                $this[ext.current.name] = ext.current.factory($this);
            } else if (is.defined(ext.current.factory)) {
                $this[ext.current.name] = ext.current.factory;
            }
        }
        for (init.count = 0; init.count < initializers.length; init.count += 1) {
            init.current = initializers[init.count];
            if (is.function(init.current)) {
                init.current($this, config);
            }
        }
        if (config.name) {
            scopes[config.name] = $this;
        }
    };
    Hilary.extend = function(name, factory) {
        extensions.push({
            name: name,
            factory: factory
        });
        return true;
    };
    Hilary.onInit = function(factory) {
        initializers.push(factory);
        return true;
    };
    Hilary.scope = function(name, options) {
        if (scopes[name]) {
            return scopes[name];
        } else {
            scopes[name] = new Hilary(options);
            return scopes[name];
        }
    };
    Hilary.Blueprint = Blueprint;
    exports.Hilary = Hilary;
})(typeof module !== "undefined" && module.exports ? module.exports : window, typeof module !== "undefined" && module.exports ? require : undefined);