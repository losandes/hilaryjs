/*jslint node: true*/
module.exports.test = function (Hilary, spec, generateId, makeMockData) {
    "use strict";
    
    // SETUP
    
    var scope = new Hilary(),
        should = spec.should,
        expect = spec.expect,
        it = spec.it,
        testModules = makeMockData(scope, generateId);
    
    // /SETUP
    
    // SPEC
    spec.describe('Hilary Dependency Injection', function () {
        
        spec.describe('when registering modules', function () {
            
            it('should be able to define the module by name WITHOUT dependencies', function () {
                // given
                var moduleName = generateId(),
                    expected = generateId(),
                    factory;
                
                factory = function () {
                    return expected;
                };
                
                // when
                scope.register({
                    name: moduleName,
                    factory: factory
                });
                
                // then
                scope.getContext().container[moduleName].should.not.equal(undefined);
            });
            
            it('should be able to define the module by name WITH dependencies', function () {
                // given
                var moduleName = generateId(),
                    dependencyName = generateId(),
                    expected = generateId(),
                    factory;
                
                factory = function (dep) {
                    return {
                        depOut: dep,
                        thisOut: expected
                    };
                };
                
                // when
                scope.register({
                    name: moduleName,
                    dependencies: [dependencyName],
                    factory: factory
                });
                
                // then
                scope.getContext().container[moduleName].should.not.equal(undefined);
            });
            
            it('should be able to define as an object literal, by name', function () {
                var moduleName = generateId(),
                    expected = 'anonymous literal',
                    container;
                
                // given
                scope.register({
                    name: moduleName,
                    factory: {
                        val: expected
                    }
                });
                
                // then
                container = scope.getContext().container;
                container[moduleName].should.not.equal(undefined);
                container[moduleName].factory.val.should.equal(expected);
            });
            
        }); // /registering
        
        spec.describe('when resolving modules', function () {
            
            it('should be able to resolve single modules that have a function factory by name', function () {
                // when
                var result = scope.resolve(testModules.module1.name);
                
                // then
                result.should.equal(testModules.module1.expected);
            });
            
            it('should be able to resolve single modules that have an object factory by name', function () {
                // when
                var result = scope.resolve(testModules.module4.name);
                
                // then
                result.val.should.equal(testModules.module4.expected);
            });
            
            it('should be able to resolve single modules that have a function factory and dependencies by name', function () {
                // when
                var result = scope.resolve(testModules.module3.name);
                
                // then
                result.dep1Out.should.equal(testModules.module1.expected);
                result.dep2Out.dep1Out.should.equal(testModules.module1.expected);
                result.dep2Out.thisOut.should.equal(testModules.module2.expected);
                result.thisOut.should.equal(testModules.module3.expected);
            });
            
            it('should be able to resolve multiple modules at the same time', function (done) {
                // when
                scope.resolveMany([testModules.module1.name, testModules.module2.name], function (dep1, dep2) {
                    // then
                    dep1.should.equal(testModules.module1.expected);
                    dep2.dep1Out.should.equal(testModules.module1.expected);
                    dep2.thisOut.should.equal(testModules.module2.expected);
                    done();
                });
            });
            
        }); // /resolving
        
        spec.describe('when auto-registering modules', function () {
            
            it('should be able to register an array of definitions', function (done) {
                var mock1 = testModules.module1.moduleDefinition,
                    mock2 = testModules.module2.moduleDefinition,
                    mock3 = testModules.module3.moduleDefinition,
                    mock4 = testModules.module4.moduleDefinition,
                    index = [mock1, mock2, mock3, mock4],
                    newScope = new Hilary();
                
                newScope.autoRegister(index, function () {
                    // when
                    var result1 = scope.resolve(testModules.module1.name),
                        result4 = scope.resolve(testModules.module4.name);
                    // then
                    result1.should.equal(testModules.module1.expected);
                    result4.val.should.equal(testModules.module4.expected);
                    
                    done();
                });
                
            });
            
            it('should be able to register an object of definitions', function (done) {
                var index = {
                        mock1: testModules.module1.moduleDefinition,
                        mock2: testModules.module2.moduleDefinition,
                        mock3: testModules.module3.moduleDefinition,
                        mock4: testModules.module4.moduleDefinition
                    },
                    newScope = new Hilary();
                
                newScope.autoRegister(index, function () {
                    // when
                    var result1 = scope.resolve(testModules.module1.name),
                        result4 = scope.resolve(testModules.module4.name);
                    // then
                    result1.should.equal(testModules.module1.expected);
                    result4.val.should.equal(testModules.module4.expected);
                    
                    done();
                });
                
            });
            
        }); // /autoRegister
        
    }); // /Hilary DI
    
    spec.describe('Hilary Dispose', function () {
        spec.describe('when a single moduleName is passed as an argument', function () {
            it('should delete that module from the container', function () {
                var sut = new Hilary(),
                    sutModules = makeMockData(sut, generateId),
                    actual1,
                    actual2;

                actual1 = sut.resolve(sutModules.module1.name);
                sut.dispose(sutModules.module1.name);
                actual2 = function () { sut.resolve(sutModules.module1.name); };

                expect(actual1).to.equal(sutModules.module1.expected);
                expect(sut.getContext().container[sutModules.module1.name]).to.equal(undefined);
                expect(actual2).to.throw();
            });
        });

        spec.describe('when an array of moduleNames is passed as an argument', function () {
            it('should delete those modules from the container', function () {
                var sut = new Hilary(),
                    sutModules = makeMockData(sut, generateId),
                    actual1,
                    actual2,
                    actual3,
                    actual4;

                actual1 = sut.resolve(sutModules.module1.name);
                actual2 = sut.resolve(sutModules.module2.name);
                sut.dispose([sutModules.module1.name, sutModules.module2.name]);
                actual3 = function () { sut.resolve(sutModules.module1.name); };
                actual4 = function () { sut.resolve(sutModules.module2.name); };

                expect(actual1).to.equal(sutModules.module1.expected);
                expect(actual2.thisOut).to.equal(sutModules.module2.expected);
                expect(sut.getContext().container[sutModules.module1.name]).to.equal(undefined);
                expect(actual3).to.throw();
                expect(actual4).to.throw();
            });
        });

        spec.describe('when no argument is passed', function () {
            it('should delete all modules from the container', function () {
                var sut = new Hilary(),
                    sutModules = makeMockData(sut, generateId),
                    actual1,
                    actual2,
                    actual3,
                    actual4;

                actual1 = sut.resolve(sutModules.module1.name);
                actual2 = sut.resolve(sutModules.module2.name);
                sut.dispose();
                actual3 = function () { sut.resolve(sutModules.module1.name); };
                actual4 = function () { sut.resolve(sutModules.module2.name); };

                expect(actual1).to.equal(sutModules.module1.expected);
                expect(actual2.thisOut).to.equal(sutModules.module2.expected);
                expect(sut.getContext().container[sutModules.module1.name]).to.equal(undefined);
                expect(actual3).to.throw();
                expect(actual4).to.throw();
            });
        });

    }); // /Dispose
    
    // /SPEC
};
