/*jshint unused: false */
(function (exports) {
    'use strict';

    exports['hilary.di.fixture'] = function (Hilary, spec, generateId, makeMockData) {
        // SETUP

        var scope = new Hilary(),
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

                it('should trigger an error when attempting to register a module that doesn\'t meet the definition requirements', function (done) {
                    var count = 0;

                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.on.error(function (err) {
                                // then
                                expect(err.name).to.equal('ArgumentException');
                                count += 1;

                                // this should get fired twice
                                if (count === 2) {
                                    done();
                                }
                            });
                        },
                        composeModules: function (err, scope) {
                            // when
                            scope.register({});
                        }
                    });
                });

                it('``exists`` should return true when asked about that module', function () {
                    // given
                    var moduleName = generateId(),
                        actual;


                    scope.register({
                        name: moduleName,
                        factory: {
                            val: moduleName
                        }
                    });

                    // when
                    actual = scope.exists(moduleName);

                    // then
                    expect(actual).to.equal(true);
                });

                it('``exists`` should return false when asked about a module that isn\'t registered', function () {
                    // given
                    var moduleName = generateId(),
                        actual;

                    // when
                    actual = scope.exists(moduleName);

                    // then
                    expect(actual).to.equal(false);
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

                it('should trigger an error when attempting to resolve a module that doesn\'t exist', function (done) {
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.on.error(function (err) {
                                // then
                                expect(err.name).to.equal('DependencyException');
                                done();
                            });
                        },
                        onComposed: function (err, scope) {
                            // when
                            scope.resolve('icanhascheeseburger');
                        }
                    });
                });

                it('should throw when attempting to resolve a module with an unacceptable argument', function (done) {
                    var count = 0;
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.on.error(function (err) {
                                // then
                                expect(err).to.not.equal(undefined);
                                count += 1;

                                // this should fire twice
                                if (count === 2) {
                                    done();
                                }
                            });
                        },
                        onComposed: function (err, scope) {
                            // when
                            scope.resolve(function () {});
                        }
                    });
                });

                it('should trigger an error when attempting to resolve a module that depends on modules that don\'t exist', function (done) {
                    var count = 0;

                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.on.error(function (err) {
                                // then
                                expect(err.name).to.equal('DependencyException');
                                count += 1;

                                // should trigger two errors
                                if (count === 2) {
                                    done();
                                }
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register({
                                name: 'missingDependencySut',
                                dependencies: ['missingDependency'],
                                factory: function (dep) {

                                }
                            });
                        },
                        onComposed: function (err, scope) {
                            // when
                            scope.resolve('missingDependencySut');
                        }
                    });
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

                it('should trigger an error when resolving multiple modules and any or all of the dependencies are not met', function (done) {
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.on.error(function (err) {
                                // then
                                expect(err.name).to.equal('DependencyException');
                                done();
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register(testModules.module1.moduleDefinition);
                        },
                        onComposed: function (err, scope) {
                            // when
                            scope.resolveMany([testModules.module1.name, generateId()], function () {});
                        }
                    });
                });

                it('should maintain appropriate argument order when a dependency is not resolved', function () {
                    // given
                    new Hilary().Bootstrapper({
                        composeModules: function (err, scope) {
                            scope.register(testModules.module1.moduleDefinition);
                            scope.register(testModules.module2.moduleDefinition);
                        },
                        onComposed: function (err, scope) {
                            // when
                            scope.resolveMany([testModules.module1.name, generateId(), testModules.module2.name], function (dep1, dep2, dep3) {
                                expect(dep1).to.equal(testModules.module1.expected);
                                expect(dep2).to.equal(undefined);
                                expect(dep3.thisOut).to.equal(testModules.module2.expected);
                            });
                        }
                    });
                });

                it('should be able to resolve the container by name', function () {
                    // given
                    var container,
                        moduleName = generateId();

                    scope.register({
                        name: moduleName,
                        factory: function () {}
                    });

                    // when
                    container = scope.resolve('hilary::container');

                    // then
                    expect(container[moduleName]).to.not.equal(undefined);
                });

                it('should be able to resolve the parent container by name', function () {
                    // given
                    var sutScope = new Hilary(),
                        sutChildScope = sutScope.createChildContainer(),
                        container,
                        moduleName = generateId();

                    sutScope.register({
                        name: moduleName,
                        factory: function () {}
                    });

                    // when
                    container = sutChildScope.resolve('hilary::parent');

                    // then
                    expect(container[moduleName]).to.not.equal(undefined);
                });

                it('should be able to resolve Blueprint by name', function () {
                    // given
                    var Bp,
                        sutBp,
                        sutBpId = generateId();

                    // when
                    Bp = scope.resolve('hilary::Blueprint');
                    sutBp = new Bp({ __blueprintId: sutBpId, name: 'string' });

                    // then
                    expect(sutBp.__blueprintId).to.equal(sutBpId);
                });

            }); // /resolving

            spec.describe('when auto-registering modules', function () {

                var assert = function (newScope, index, done) {
                    newScope.autoRegister(index, function () {
                        // when
                        var result1 = scope.resolve(testModules.module1.name),
                            result4 = scope.resolve(testModules.module4.name);
                        // then
                        result1.should.equal(testModules.module1.expected);
                        result4.val.should.equal(testModules.module4.expected);

                        done();
                    });
                };

                it('should be able to register an array of definitions', function (done) {
                    var mock1 = testModules.module1.moduleDefinition,
                        mock2 = testModules.module2.moduleDefinition,
                        mock3 = testModules.module3.moduleDefinition,
                        mock4 = testModules.module4.moduleDefinition,
                        index = [mock1, mock2, mock3, mock4];

                    assert(new Hilary(), index, done);
                });

                it('should be able to register an object of definitions', function (done) {
                    var index = {
                            mock1: testModules.module1.moduleDefinition,
                            mock2: testModules.module2.moduleDefinition,
                            mock3: testModules.module3.moduleDefinition,
                            mock4: testModules.module4.moduleDefinition
                        };

                    assert(new Hilary(), index, done);
                });

                it('should return an error when any or all registrations failed', function (done) {
                    var mock1 = testModules.module1.moduleDefinition,
                        mock2 = {},
                        index = [mock1, mock2],
                        newScope = new Hilary();

                    newScope.autoRegister(index, function (err) {
                        expect(err).to.be.a('object');

                        done();
                    });
                });

            }); // /autoRegister

            spec.describe('when auto-resolving modules', function () {

                var mockIndex,
                    assert;

                mockIndex = function (mockRegistrationName) {
                    var mock1,
                        mock2,
                        mock3,
                        index;

                    mock1 = {
                        dependencies: [testModules.module2.name, testModules.module3.name],
                        factory: function (mod2, mod3) {
                            scope.register({
                                name: mockRegistrationName,
                                factory: function () {
                                    return {
                                        mod2: mod2,
                                        mod3: mod3
                                    };
                                }
                            });
                        }
                    };

                    mock2 = testModules.module2.moduleDefinition;
                    delete mock2.name;
                    mock3 = testModules.module3.moduleDefinition;
                    delete mock3.name;

                    return {
                        mock1: mock1,
                        mock2: mock2,
                        mock3: mock3
                    };
                };

                assert = function (index, mockRegistrationName, done) {
                    scope.autoResolve(index, function (err) {
                        // when
                        var result = scope.resolve(mockRegistrationName);

                        // then
                        expect(err).to.equal(null);

                        expect(result.mod2).to.not.equal(undefined);
                        expect(result.mod2.thisOut).to.equal(testModules.module2.expected);

                        expect(result.mod3).to.not.equal(undefined);
                        expect(result.mod3.thisOut).to.equal(testModules.module3.expected);

                        done();
                    });
                };

                it('should be able to resolve an array of definitions', function (done) {
                    var mockRegistrationName = generateId(),
                        idx = mockIndex(mockRegistrationName),
                        index = [idx.mock3, idx.mock2, idx.mock1];

                    assert(index, mockRegistrationName, done);
                });

                it('should be able to resolve an object of definitions', function (done) {
                    var mockRegistrationName = generateId();

                    assert(mockIndex(mockRegistrationName), mockRegistrationName, done);
                });

                it('should return an error if some or all dependencies were not met', function (done) {
                    var mockRegistrationName = generateId(),
                        idx = mockIndex(mockRegistrationName),
                        index;

                    delete idx.mock2.factory;
                    index = [idx.mock3, idx.mock2, idx.mock1];

                    scope.autoResolve(index, function (err) {
                        expect(err).to.be.a('object');

                        done();
                    });
                });

            }); // /autoResolve

        }); // /Hilary DI

        spec.describe('Hilary Dispose', function () {
            spec.describe('when a single moduleName is passed as an argument', function () {
                it('should delete that module from the container, if it exists', function () {
                    var sut = new Hilary(),
                        sutModules = makeMockData(sut, generateId),
                        actual1,
                        actual2;

                    actual1 = sut.resolve(sutModules.module1.name);
                    sut.dispose(sutModules.module1.name);
                    actual2 = sut.exists(sutModules.module1.name);

                    expect(actual1).to.equal(sutModules.module1.expected);
                    expect(sut.getContext().container[sutModules.module1.name]).to.equal(undefined);
                    expect(actual2).to.equal(false);
                });

                it('should return false, if it does not exist', function () {
                    var sut = new Hilary(),
                        sutModules = makeMockData(sut, generateId),
                        actual = sut.dispose(generateId());

                    expect(actual).to.equal(false);
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
                    actual3 = sut.exists(sutModules.module1.name);
                    actual4 = sut.exists(sutModules.module2.name);

                    expect(actual1).to.equal(sutModules.module1.expected);
                    expect(actual2.thisOut).to.equal(sutModules.module2.expected);
                    expect(sut.getContext().container[sutModules.module1.name]).to.equal(undefined);
                    expect(actual3).to.equal(false);
                    expect(actual4).to.equal(false);
                });

                it('should return false, if any do not exist', function () {
                    // given
                    var sut = new Hilary(),
                        sutModules = makeMockData(sut, generateId),
                        actual;

                    actual = sut.dispose([sutModules.module1.name, generateId()]);
                    expect(actual).to.equal(false);
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
                    actual3 = sut.exists(sutModules.module1.name);
                    actual4 = sut.exists(sutModules.module2.name);

                    expect(actual1).to.equal(sutModules.module1.expected);
                    expect(actual2.thisOut).to.equal(sutModules.module2.expected);
                    expect(sut.getContext().container[sutModules.module1.name]).to.equal(undefined);
                    expect(actual3).to.equal(false);
                    expect(actual4).to.equal(false);
                });
            });

            spec.describe('when an argument that isn\'t supported is passed', function () {
                it('should return false', function () {
                    var actual = scope.dispose(function () {});
                    expect(actual).to.equal(false);
                });
            });

        }); // /Dispose

        // /SPEC
    };

}((typeof module !== 'undefined' && module.exports) ? module.exports : window));
