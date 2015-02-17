/*jslint plusplus: true */
/*global require*/
require(['describe', 'beforeEach', 'Hilary', 'it', 'expect'], function (describe, beforeEach, Hilary, it, expect) {
    "use strict";
    
    describe("Hilary", function () {
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
            container = new Hilary();
        });

        describe('Global Hilary', function () {
            it('should exist in window', function () {
                expect(window.Hilary).toBeDefined();
            });
        });

        describe('Hilary, when executed', function () {
            it('should construct a new Hilary instance', function () {
                expect(container).toBeDefined();
                expect(container.register).toBeDefined();
                expect(container.resolve).toBeDefined();
            });

            describe('WITH the lessMagic argument', function () {
                it('should have simpler register and resolve functions on the main scope, as well as child scopes', function () {
                    // given
                    var scope = new Hilary({ lessMagic: true }),
                        child = scope.createChildContainer();

                    // then
                    expect(scope.register.length).toBe(2);
                    expect(child.register.length).toBe(2);
                    expect(scope.resolve.length).toBe(1);
                    expect(child.resolve.length).toBe(1);
                });
            });

            describe('WITHOUT the lessMagic argument', function () {
                it('should have AMD style register and resolve functions on the main scope, as well as child scopes', function () {
                    // given
                    var scope = new Hilary(),
                        child = scope.createChildContainer();

                    // then
                    expect(scope.register.length).toBe(3);
                    expect(child.register.length).toBe(3);
                    expect(scope.resolve.length).toBe(2);
                    expect(child.resolve.length).toBe(2);
                });
            });
        });

        describe('createChildContainer, when executed', function () {
            it('should construct child containers', function () {
                var child = container.createChildContainer(),
                    shouldThrow,
                    actual1,
                    actual2;

                // given
                container.register(testModuleDefinitions.empty.name, function () {
                    return testModuleDefinitions.empty.output;
                });

                child.register(testModuleDefinitions.emptyToo.name, function () {
                    return testModuleDefinitions.emptyToo.output;
                });

                shouldThrow = function () {
                    return container.resolve(testModuleDefinitions.emptyToo.name);
                };

                // when
                actual1 = container.resolve(testModuleDefinitions.empty.name);
                actual2 = child.resolve(testModuleDefinitions.emptyToo.name);

                // then
                expect(actual1).toBe(testModuleDefinitions.empty.output);
                expect(actual2).toBe(testModuleDefinitions.emptyToo.output);
                expect(shouldThrow).toThrow();
            });
        });
    });
});
