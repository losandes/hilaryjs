/*jslint plusplus: true */
/*global describe,beforeEach,Hilary, HilaryModule,it,expect*/

describe("Hilary Dependency Injection", function () {
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
    
    describe('hilary.register, when registering single modules by name', function () {
        it('should be able to resolve the expected module with that name', function () {
            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            expect(container.resolve(testModuleDefinitions.empty.name)()).toBe(testModuleDefinitions.empty.output);
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
                var test = container.resolve('factoryTest'),
                    foo = container.resolve(testModuleDefinitions.empty.name);
                return test(foo, saySomething);
            });

            expect(container.resolve('factory')(' hello world!')).toBe(testModuleDefinitions.empty.output + ' hello world!');
        });
    });
    
    describe('hilary.register, when registering HilaryModules', function () {
        it('should be able to resolve the expected module with that name', function () {
            container.register(testModuleDefinitions.empty.name, new HilaryModule([], function () {
                return testModuleDefinitions.empty.output;
            }));

            expect(container.resolve(testModuleDefinitions.empty.name)).toBe(testModuleDefinitions.empty.output);
        });
        
        it('should be able to auto-resolve the modules dependencies, if they exist', function () {
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
            
            var result = container.resolve(testModuleDefinitions.empty.name);
            expect(result.dep1.test).toBe('success1');
            expect(result.dep2.test).toBe('success2');
        });
    });
    
    describe('hilary.resolve, when resolving reserved module: "hilary::container"', function () {
        it('should resolve the container, if it exists', function () {
            var ctnr = container.resolve(container.getConstants().containerRegistration);
            
            // the ctnr should be resolved
            expect(ctnr).not.toBe(null);
            // and have the Hilary signature
            expect(ctnr.getContainer).not.toBe(null);
        });
    });
    
    describe('hilary.resolve, when resolving reserved module: "hilary::parent"', function () {
        it('should resolve the parent container, if it exists', function () {
            var child = container.createChildContainer(),
                parent = child.resolve(container.getConstants().parentContainerRegistration);
            
            // the parent container should be resolved
            expect(parent).not.toBe(null);
            // and have the Hilary signature
            expect(parent.getContainer).not.toBe(null);
        });
    });
    
    describe('hilary.resolve, when resolving modules that are registered in ancestor containers (parent, grandparent, etc.)', function () {
        it('should resolve modules that exist in the container ancestry', function () {
            var child = container.createChildContainer(),
                grandChild = child.createChildContainer();

            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            child.register(testModuleDefinitions.emptyToo.name, function () {
                return testModuleDefinitions.emptyToo.output;
            });

            expect(grandChild.resolve(testModuleDefinitions.empty.name)()).toBe(testModuleDefinitions.empty.output);
            expect(grandChild.resolve(testModuleDefinitions.emptyToo.name)()).toBe(testModuleDefinitions.emptyToo.output);
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

});
