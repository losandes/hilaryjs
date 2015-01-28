/*jslint plusplus: true */
/*global describe,beforeEach,Hilary,it,expect*/

describe("Hilary", function () {
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
        };

    beforeEach(function () {
        container = new Hilary();
    });

    describe('Hilary', function () {
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
    });
    
    describe('createChildContainer, when executed', function () {
        it('should construct child containers', function () {
            var child = container.createChildContainer(),
                shouldThrow;

            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            child.register(testModuleDefinitions.emptyToo.name, function () {
                return testModuleDefinitions.emptyToo.output;
            });

            shouldThrow = function () {
                return container.resolve(testModuleDefinitions.emptyToo.name);
            };

            expect(container.resolve(testModuleDefinitions.empty.name)()).toBe(testModuleDefinitions.empty.output);
            expect(child.resolve(testModuleDefinitions.emptyToo.name)()).toBe(testModuleDefinitions.emptyToo.output);
            expect(shouldThrow).toThrow();
        });
    });
});
