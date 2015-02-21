/*jslint plusplus: true */
/*global require*/
require(['describe', 'beforeEach', 'Hilary', 'it', 'expect'], function (describe, beforeEach, Hilary, it, expect) {
    "use strict";

    describe("The Hilary Pipeline", function () {
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
            };

        beforeEach(function () {
            container = new Hilary({ lessMagic: true });
        });

        describe('when a "before::register" module is registered', function () {
            it('should execute that module BEFORE new modules are registered', function () {
                var shouldThrow,
                    sutModuleName = 'beforeRegisterEvent';

                container.registerEvent(container.getConstants().pipeline.beforeRegister, function (cntr, moduleName, moduleDefinition) {
                    if (moduleName === testModuleDefinitions.empty.name) {
                        cntr.register(sutModuleName, {
                            name: moduleName,
                            definition: moduleDefinition
                        });
                    }
                });

                shouldThrow = function () {
                    return container.resolve(sutModuleName);
                };

                expect(shouldThrow).toThrow();

                container.register(testModuleDefinitions.empty.name, function () {
                    return testModuleDefinitions.empty.output;
                });

                expect(container.resolve(sutModuleName).name).toBe(testModuleDefinitions.empty.name);
            });
        });

        describe('when a "after::register" module is registered', function () {
            it('should execute that module AFTER new modules are registered', function () {
                var shouldThrow,
                    sutModuleName = 'afterRegisterEvent';

                container.registerEvent(container.getConstants().pipeline.afterRegister, function (cntr, moduleName, moduleDefinition) {
                    if (moduleName === testModuleDefinitions.empty.name) {
                        cntr.register(sutModuleName, {
                            name: moduleName,
                            definition: moduleDefinition
                        });
                    }
                });

                shouldThrow = function () {
                    return container.resolve(sutModuleName);
                };

                expect(shouldThrow).toThrow();

                container.register(testModuleDefinitions.empty.name, function () {
                    return testModuleDefinitions.empty.output;
                });

                expect(container.resolve(sutModuleName).name).toBe(testModuleDefinitions.empty.name);
            });
        });

        describe('when a "before::resolve" module is registered', function () {
            it('should execute that module BEFORE modules are resolved', function () {
                var shouldThrow,
                    sutModuleName = 'b4ResolveEvent',
                    output = 'resolving!';

                container.registerEvent(container.getConstants().pipeline.beforeResolve, function (cntr, moduleName, callback) {
                    if (moduleName === testModuleDefinitions.empty.name) {
                        cntr.register(sutModuleName, function () { return output; });
                    }
                });

                shouldThrow = function () {
                    return container.resolve(sutModuleName);
                };

                expect(shouldThrow).toThrow();

                container.register(testModuleDefinitions.empty.name, function () {
                    return testModuleDefinitions.empty.output;
                });

                container.resolve(testModuleDefinitions.empty.name);
                expect(container.resolve(sutModuleName)()).toBe(output);
            });
        });

        describe('when a "after::resolve" module is registered', function () {
            it('should execute that module AFTER modules are resolved', function () {
                var shouldThrow,
                    sutModuleName = 'afterResolveEvent',
                    output = 'resolved!';

                container.registerEvent(container.getConstants().pipeline.afterResolve, function (cntr, moduleName, callback) {
                    if (moduleName === testModuleDefinitions.empty.name) {
                        cntr.register(sutModuleName, function () { return output; });
                    }
                });

                container.register(testModuleDefinitions.empty.name, function () {
                    return testModuleDefinitions.empty.output;
                });

                shouldThrow = function () {
                    return container.resolve(sutModuleName);
                };

                expect(shouldThrow).toThrow();
                container.resolve(testModuleDefinitions.empty.name);
                expect(container.resolve(sutModuleName)()).toBe(output);
            });
        });

        describe('when a "before::new::child" module is registered', function () {
            it('should execute that module BEFORE child containers are created', function () {
                var shouldThrow,
                    sutModuleName = 'b4NewChildEvent',
                    output = 'b4NewChildEvent!';

                container.registerEvent(container.getConstants().pipeline.beforeNewChild, function (cntr, options) {
                    cntr.register(sutModuleName, function () { return output; });
                });

                shouldThrow = function () {
                    return container.resolve(sutModuleName);
                };

                expect(shouldThrow).toThrow();
                container.createChildContainer();
                expect(container.resolve(sutModuleName)()).toBe(output);
            });
        });

        describe('when a "after::new::child" module is registered', function () {
            it('should execute that module AFTER child containers are created', function () {
                var shouldThrow,
                    sutModuleName = 'afterNewChildEvent',
                    output = 'afterNewChildEvent!';

                container.registerEvent(container.getConstants().pipeline.afterNewChild, function (cntr, options) {
                    cntr.register(sutModuleName, function () { return output; });
                });

                shouldThrow = function () {
                    return container.resolve(sutModuleName);
                };

                expect(shouldThrow).toThrow();
                container.createChildContainer();
                expect(container.resolve(sutModuleName)()).toBe(output);
            });
        });
        
        describe('when a "hilary::error" module is registered', function () {
            xit('should execute that module when an error occurs', function () {
                // TODO
            });
        });

        describe('when a pipeline event has multiple registered handlers (i.e. an array of before register handlers)', function () {
            it('should execute each one of them', function () {
                var shouldThrow1,
                    shouldThrow2,
                    sutModuleName1 = 'event1',
                    sutModuleName2 = 'event2';

                container.registerEvent(container.getConstants().pipeline.beforeRegister, function (cntr, moduleName, moduleDefinition) {
                    if (moduleName === testModuleDefinitions.empty.name) {
                        cntr.register(sutModuleName1, {
                            name: moduleName,
                            definition: moduleDefinition
                        });
                    }
                });

                container.registerEvent(container.getConstants().pipeline.beforeRegister, function (cntr, moduleName, moduleDefinition) {
                    if (moduleName === testModuleDefinitions.empty.name) {
                        cntr.register(sutModuleName2, {
                            name: moduleName,
                            definition: moduleDefinition
                        });
                    }
                });

                shouldThrow1 = function () {
                    return container.resolve(sutModuleName1);
                };

                shouldThrow2 = function () {
                    return container.resolve(sutModuleName2);
                };

                expect(shouldThrow1).toThrow();
                expect(shouldThrow2).toThrow();

                container.register(testModuleDefinitions.empty.name, function () {
                    return testModuleDefinitions.empty.output;
                });

                expect(container.resolve(sutModuleName1).name).toBe(testModuleDefinitions.empty.name);
                expect(container.resolve(sutModuleName2).name).toBe(testModuleDefinitions.empty.name);
            });
        });

        describe('when a pipeline event has the once property', function () {
            it('should only execute one time', function () {
                var eventHandler,
                    sutModuleName = 'one_event',
                    count = 0;

                eventHandler = function () {
                    count++;
                };
                eventHandler.once = true;

                container.registerEvent(container.getConstants().pipeline.beforeRegister, eventHandler);

                container.register(testModuleDefinitions.empty.name, function () {
                    return testModuleDefinitions.empty.output;
                });

                container.register(testModuleDefinitions.emptyToo.name, function () {
                    return testModuleDefinitions.emptyToo.output;
                });

                expect(count).toBe(1);
            });
        });
        
    });
    
});
