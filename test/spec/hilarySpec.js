/*jslint plusplus: true, nomen: true */
/*global describe,beforeEach,hilary,it,expect*/
describe("hilary", function () {
    "use strict";
    
    var container,
        testModuleDefinitions = {
            empty: {
                name: 'foo',
                output: 'registered foo!'
            },
            emptyToo: {
                name: 'bar',
                output: 'registered bar!'
            }
        },
        constants = {
            container: 'hilary::container',
            parentContainer: 'hilary::parent',
            beforeRegister: 'hilary::before::register',
            afterRegister: 'hilary::after::register',
            beforeResolve: 'hilary::before::resolve',
            afterResolve: 'hilary::after::resolve',
            beforeNewChild: 'hilary::before::new::child',
            afterNewChild: 'hilary::after::new::child'
        };

    window.externalWindowComponent1 = function () { return 'externalWindowComponent1'; };
    window.externalWindowComponent2 = function () { return 'externalWindowComponent2'; };

    beforeEach(function () {
        container = hilary.createContainer();
    });

    describe('hilary', function () {
        it('should exist in window', function () {
            expect(window.hilary).toBeDefined();
        });
    });
    
    describe('hilary.createContainer, when executed', function () {
        it('should construct new parent containers', function () {
            expect(container).toBeDefined();
        });
    });
    
    describe('hilary.createChildContainer, when executed', function () {
        it('should construct child containers', function () {
            var _child = container.createChildContainer(),
                shouldThrow;

            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            _child.register(testModuleDefinitions.emptyToo.name, function () {
                return testModuleDefinitions.emptyToo.output;
            });

            shouldThrow = function () {
                return container.resolve(testModuleDefinitions.emptyToo.name);
            };

            expect(container.resolve(testModuleDefinitions.empty.name)()).toBe(testModuleDefinitions.empty.output);
            expect(_child.resolve(testModuleDefinitions.emptyToo.name)()).toBe(testModuleDefinitions.emptyToo.output);
            expect(shouldThrow).toThrow();
        });
    });
    
    describe('hilary.register, when registering single modules by name', function () {
        it('should be able to resolve the expected module with that name', function () {
            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            expect(container.resolve(testModuleDefinitions.empty.name)()).toBe(testModuleDefinitions.empty.output);
        });
    });
    
    describe('hilary.register, when registering modules directly on the container', function () {
        it('should be able to resolve the expected modules with the string version of the module names', function () {
            container.register(function (cntr) {
                cntr.hello = function () { return 'world'; };
                cntr.ola = function () { return 'el mundo'; };
            });

            expect(container.resolve('hello')()).toBe('world');
            expect(container.resolve('ola')()).toBe('el mundo');
        });
    });
    
    describe('hilary.register, when registering functions (i.e. factories/constructors)', function () {
        it('should be able to execute those functions, upon resolving them', function () {
            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            container.register('factoryTest', function (foo, saySomething) {
                return foo() + saySomething;
            });

            container.register('factory', function (saySomething) {
                var _test = container.resolve('factoryTest'),
                    _foo = container.resolve(testModuleDefinitions.empty.name);
                return _test(_foo, saySomething);
            });

            expect(container.resolve('factory')(' hello world!')).toBe(testModuleDefinitions.empty.output + ' hello world!');
        });
    });
    
    describe('hilary.resolve, when resolving an array of modules', function () {
        it('should pass the resolved modules into the callback function in the order that they appear in the array', function () {
            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            container.register(testModuleDefinitions.emptyToo.name, function () {
                return testModuleDefinitions.emptyToo.output;
            });

            container.resolve([testModuleDefinitions.empty.name, testModuleDefinitions.emptyToo.name], function (foo, bar) {
                expect(foo()).toBe(testModuleDefinitions.empty.output);
                expect(bar()).toBe(testModuleDefinitions.emptyToo.output);
            });
        });
    });
    
    describe('hilary.resolve, when resolving reserved modules: "hilary::container" and "hilary::parent"', function () {
        it('should resolve the container and also the parent container, if it exists', function () {
            container.createChildContainer().resolve([constants.container, constants.parentContainer], function (ctnr, parent) {
                expect(ctnr).not.toBe(null);
                expect(ctnr.getContainer).not.toBe(null);
                expect(parent).not.toBe(null);
                expect(parent.getContainer).not.toBe(null);
            });
        });
    });
    
    describe('hilary.resolve, when resolving modules that are registered in ancestor containers (parent, grandparent, etc.)', function () {
        it('should resolve modules that exist in the container ancestry', function () {
            var _child = container.createChildContainer(),
                _grandChild = _child.createChildContainer();

            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            _child.register(testModuleDefinitions.emptyToo.name, function () {
                return testModuleDefinitions.emptyToo.output;
            });

            expect(_grandChild.resolve(testModuleDefinitions.empty.name)()).toBe(testModuleDefinitions.empty.output);
            expect(_grandChild.resolve(testModuleDefinitions.emptyToo.name)()).toBe(testModuleDefinitions.emptyToo.output);
        });
    });
    
    describe('hilary.tryResolve, when attempting to resolve a missing module', function () {
        it('should not throw an error', function () {
            var actual = function () {
                return container.tryResolve('doesntexist');
            };

            expect(actual).not.toThrow();
        });
    });

    describe('hilary.pipeline, when a "hilary::before::register" module is registered', function () {
        it('should execute that module BEFORE new modules are registered', function () {
            container.registerEvent(constants.beforeRegister, function (cntr, moduleNameOrFunc, moduleDefinition) {
                cntr.fooB4Register = function () { return { name: moduleNameOrFunc, definition: moduleDefinition }; };
            });

            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            expect(container.resolve('fooB4Register')().name).toBe(testModuleDefinitions.empty.name);
        });
    });
    
    describe('hilary.pipeline, when a "hilary::after::register" module is registered', function () {
        it('should execute that module AFTER new modules are registered', function () {
            container.registerEvent(constants.afterRegister, function (cntr, moduleNameOrFunc, moduleDefinition) {
                cntr.fooAfterRegister = function () { return { name: moduleNameOrFunc, definition: moduleDefinition }; };
            });

            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            expect(container.resolve('fooAfterRegister')().name).toBe(testModuleDefinitions.empty.name);
        });
    });
    
    describe('hilary.pipeline, when a "hilary::before::resolve" module is registered', function () {
        it('should execute that module BEFORE modules are resolved', function () {
            container.registerEvent(constants.beforeResolve, function (cntr, moduleNameOrDependencies, callback) {
                cntr.fooB4Resolve = function () { return 'resolving!'; };
            });

            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            container.resolve([constants.container, testModuleDefinitions.empty.name], function (cntr, foo) {
                expect(cntr.fooB4Resolve()).toBe('resolving!');
            });
        });
    });
    
    describe('hilary.pipeline, when a "hilary::before::resolve" module is registered', function () {
        it('should execute that module AFTER modules are resolved', function () {
            container.registerEvent(constants.afterResolve, function (cntr, moduleNameOrDependencies, callback) {
                cntr.fooB4Resolve = function () { return moduleNameOrDependencies; };
            });

            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            expect(container.resolve(testModuleDefinitions.empty.name)()).toBe(testModuleDefinitions.empty.output);

            container.resolve([constants.container], function (cntr) {
                expect(cntr.fooB4Resolve()).toBe(testModuleDefinitions.empty.name);
            });
        });
    });
    
    describe('hilary.pipeline, when a "hilary::before::new::child" module is registered', function () {
        it('should execute that module BEFORE child containers are created', function () {
            container.registerEvent(constants.beforeNewChild, function (cntr, options) {
                cntr.fooB4NewChild = function () { return 'hello world!'; };
            });

            container.createChildContainer();

            expect(container.resolve('fooB4NewChild')()).toBe('hello world!');
        });
    });
    
    describe('hilary.pipeline, when a "hilary::after::new::child" module is registered', function () {
        it('should execute that module AFTER child containers are created', function () {
            container.registerEvent(constants.afterNewChild, function (cntr, options) {
                cntr.fooAfterNewChild = function () { return 'hello world!'; };
            });

            container.createChildContainer();

            expect(container.resolve('fooAfterNewChild')()).toBe('hello world!');
        });
    });
    
    describe('hilary.pipeline, when a pipeline event has multiple registered handlers (i.e. an array of before register handlers)', function () {
        it('should execute each one of them', function () {
            container.registerEvent(constants.beforeRegister, function (cntr, moduleNameOrFunc, moduleDefinition) {
                cntr.fooB4Register = function () { return { name: moduleNameOrFunc, definition: moduleDefinition }; };
            });

            container.registerEvent(constants.beforeRegister, function (cntr, moduleNameOrFunc, moduleDefinition) {
                cntr.fooB4Register2 = function () { return { name: moduleNameOrFunc, definition: moduleDefinition }; };
            });

            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            expect(container.resolve('fooB4Register')().name).toBe(testModuleDefinitions.empty.name);
            expect(container.resolve('fooB4Register2')().name).toBe(testModuleDefinitions.empty.name);
        });
    });

});
