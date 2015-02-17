/*jslint plusplus: true */
/*global require*/
require(['describe', 'beforeEach', 'Hilary', 'HilaryModule', 'it', 'expect'], function (describe, beforeEach, Hilary, HilaryModule, it, expect) {
    "use strict";

    describe("Hilary Less Magic Dependency Injection", function () {
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

        describe('hilary.ioc.register, when registering single modules by name', function () {
            it('should be able to resolve the expected module with that name', function () {
                // given
                container.register(testModuleDefinitions.empty.name, function () {
                    return testModuleDefinitions.empty.output;
                });

                // when
                var actual = container.resolve(testModuleDefinitions.empty.name)();

                // then
                expect(actual).toBe(testModuleDefinitions.empty.output);
            });
        });

        describe('hilary.ioc.register, when registering functions (i.e. factories/constructors)', function () {
            it('should be able to execute those functions, upon resolving them', function () {
                // given
                container.register(testModuleDefinitions.empty.name, function () {
                    return testModuleDefinitions.empty.output;
                });

                container.register('factoryTest', function (foo, saySomething) {
                    return foo() + saySomething;
                });

                container.register('factory', function (saySomething) {
                    var test = container.resolve('factoryTest'),
                        foo = container.resolve(testModuleDefinitions.empty.name);
                    return test(foo, saySomething);
                });

                // when
                var actual = container.resolve('factory')(' hello world!');

                // then
                expect(actual).toBe(testModuleDefinitions.empty.output + ' hello world!');
            });
        });

        describe('hilary.ioc.register, when registering HilaryModules', function () {
            it('should be able to register factories', function () {
                var expected = 'test',
                    actual;

                // given
                container.register(testModuleDefinitions.empty.name, new HilaryModule(function (message) {
                    return message;
                }));

                // when
                actual = container.resolve(testModuleDefinitions.empty.name)(expected);

                // then
                expect(actual).toBe(expected);
            });

            it('should be able to register objects', function () {
                var expected = 'test',
                    actual;

                // given
                container.register(testModuleDefinitions.empty.name, new HilaryModule({
                    message: expected
                }));

                // when
                actual = container.resolve(testModuleDefinitions.empty.name).message;

                // then
                expect(actual).toBe(expected);
            });

            it('should be able to resolve the expected module with that name', function () {
                // given
                container.register(testModuleDefinitions.empty.name, new HilaryModule(function () {
                    return testModuleDefinitions.empty.output;
                }));

                // when
                var actual = container.resolve(testModuleDefinitions.empty.name);

                // then
                expect(actual).toBe(testModuleDefinitions.empty.output);
            });

            it('should be able to auto-resolve the module\'s dependencies, if they exist', function () {
                // given
                container.register('dep1', {
                    test: 'success1'
                });

                container.register('dep2', {
                    test: 'success2'
                });

                container.register(testModuleDefinitions.empty.name, new HilaryModule(['dep1', 'dep2'], function (dep1, dep2) {
                    return {
                        dep1: dep1,
                        dep2: dep2
                    };
                }));

                // when
                var result = container.resolve(testModuleDefinitions.empty.name);

                // then
                expect(result.dep1.test).toBe('success1');
                expect(result.dep2.test).toBe('success2');
            });
        });

        describe('hilary.ioc.resolve, when resolving reserved module: "hilary::container"', function () {
            it('should resolve the container, if it exists', function () {
                // when
                var ctnr = container.resolve(container.getConstants().containerRegistration);

                // then
                // the ctnr should be resolved
                expect(ctnr).not.toBe(null);
                // and have the Hilary signature
                expect(ctnr.getContainer).not.toBe(null);
            });
        });

        describe('hilary.ioc.resolve, when resolving reserved module: "hilary::parent"', function () {
            it('should resolve the parent container, if it exists', function () {
                // when
                var child = container.createChildContainer(),
                    parent = child.resolve(container.getConstants().parentContainerRegistration);

                // then
                // the parent container should be resolved
                expect(parent).not.toBe(null);
                // and have the Hilary signature
                expect(parent.getContainer).not.toBe(null);
            });
        });

        describe('hilary.ioc.resolve, when resolving modules that are registered in ancestor containers (parent, grandparent, etc.)', function () {
            it('should resolve modules that exist in the container ancestry', function () {
                var child = container.createChildContainer(),
                    grandChild = child.createChildContainer(),
                    actual1,
                    actual2;

                // given
                container.register(testModuleDefinitions.empty.name, function () {
                    return testModuleDefinitions.empty.output;
                });

                child.register(testModuleDefinitions.emptyToo.name, function () {
                    return testModuleDefinitions.emptyToo.output;
                });

                // when
                actual1 = grandChild.resolve(testModuleDefinitions.empty.name)();
                actual2 = grandChild.resolve(testModuleDefinitions.emptyToo.name)();

                // then
                expect(actual1).toBe(testModuleDefinitions.empty.output);
                expect(actual2).toBe(testModuleDefinitions.emptyToo.output);
            });
        });

        describe('hilary.tryResolve, when attempting to resolve a missing module', function () {
            it('should not throw an error', function () {
                // when
                var actual = function () {
                    return container.tryResolve('doesntexist');
                };

                // then
                expect(actual).not.toThrow();
            });
        });

    });
    
});
