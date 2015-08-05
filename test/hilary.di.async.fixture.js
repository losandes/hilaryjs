/*jshint unused: false*/
(function (exports) {
    'use strict';

    exports['hilary.di.async.fixture'] = function (Hilary, spec, generateId, makeMockData, async) {
        // SETUP

        var scope = new Hilary().useAsync(async),
            expect = spec.expect,
            it = spec.it,
            testModules = makeMockData(scope, generateId);

        // /SETUP

        // SPEC
        spec.describe('Hilary Async Dependency Injection', function () {

            spec.describe('when registering modules', function () {

                it('should be able to define the module by name WITHOUT dependencies', function (done) {
                    // given
                    var moduleName = generateId(),
                        expected = generateId(),
                        factory,
                        next;

                    factory = function () {
                        return expected;
                    };

                    next = function (err, result) {
                        // then
                        expect(err).to.equal(null);
                        scope.getContext().container[moduleName].should.not.equal(undefined);
                        done();
                    };

                    // when
                    scope.registerAsync({
                        name: moduleName,
                        factory: factory
                    }, next);
                });

                it('should be able to define the module by name WITH dependencies', function (done) {
                    // given
                    var moduleName = generateId(),
                        dependencyName = generateId(),
                        expected = generateId(),
                        factory,
                        next;

                    factory = function (dep) {
                        return {
                            depOut: dep,
                            thisOut: expected
                        };
                    };

                    next = function (err, result) {
                        // then
                        expect(err).to.equal(null);
                        scope.getContext().container[moduleName].should.not.equal(undefined);
                        done();
                    };

                    // when
                    scope.registerAsync({
                        name: moduleName,
                        dependencies: [dependencyName],
                        factory: factory
                    }, next);
                });

                it('should be able to define as an object literal, by name', function (done) {
                    var moduleName = generateId(),
                        expected = 'anonymous literal',
                        next;

                    next = function (err, result) {
                        // then
                        var container = scope.getContext().container;
                        expect(err).to.equal(null);
                        container[moduleName].should.not.equal(undefined);
                        container[moduleName].factory.val.should.equal(expected);
                        done();
                    };

                    // given
                    scope.registerAsync({
                        name: moduleName,
                        factory: {
                            val: expected
                        }
                    }, next);
                });

                it('should trigger an error when attempting to register a module that doesn\'t meet the definition requirements', function (done) {
                    // given
                    var sutScope = new Hilary().useAsync(async),
                        count = 0;

                    sutScope.Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.on.error(function (err) {
                                // then
                                expect(err.name).to.equal('ArgumentException');
                                count += 1;

                                // should fire twice
                                if (count === 2) {
                                    done();
                                }
                            });
                        },
                        composeModules: function (err, scope) {
                            // when
                            scope.registerAsync({});
                        }
                    });
                });

                it('should pass an error back to the callback when attempting to register a module that doesn\'t meet the definition requirements', function (done) {
                    // given
                    var sutScope = new Hilary().useAsync(async);

                    sutScope.Bootstrapper({
                        composeModules: function (err, scope) {
                            // when
                            scope.registerAsync({}, function (err, result) {
                                // then
                                expect(err.name).to.equal('ArgumentException');
                                done();
                            });
                        }
                    });
                });

                it('should trigger an error when attempting to resolve a module that depends on modules that don\'t exist', function (done) {
                    // given
                    var sutScope = new Hilary().useAsync(async),
                        sutName = generateId();

                    sutScope.Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.on.error(function (err) {
                                // then
                                expect(err.name).to.equal('DependencyException');
                                done();
                            });
                        },
                        composeModules: function (err, scope) {
                            // given
                            scope.register({
                                name: sutName,
                                dependencies: [generateId()],
                                factory: function (dep) {

                                }
                            });
                        },
                        onComposed: function (err, scope) {
                            // when
                            scope.resolveAsync(sutName, function (err, dep1) {
                                // expect(err).to.be.a('object');
                                // done();
                            });
                        }
                    });
                });

                it('should pass an error to the callback when attempting to resolve a module that depends on modules that don\'t exist', function (done) {
                    // given
                    var sutScope = new Hilary().useAsync(async),
                        sutName = generateId();

                    sutScope.Bootstrapper({
                        composeModules: function (err, scope) {
                            // given
                            scope.register({
                                name: sutName,
                                dependencies: [generateId()],
                                factory: function (dep) {

                                }
                            });
                        },
                        onComposed: function (err, scope) {
                            // when
                            scope.resolveAsync(sutName, function (err) {
                                expect(err).to.be.a('object');
                                done();
                            });
                        }
                    });
                });

            }); // /registering

            spec.describe('when resolving modules', function () {

                it('should be able to resolve single modules by name', function (done) {
                    // when
                    scope.resolveAsync(testModules.module3.name, function (err, result) {
                        // then
                        expect(err).to.equal(null);
                        result.dep1Out.should.equal(testModules.module1.expected);
                        result.dep2Out.dep1Out.should.equal(testModules.module1.expected);
                        result.dep2Out.thisOut.should.equal(testModules.module2.expected);
                        result.thisOut.should.equal(testModules.module3.expected);
                        done();
                    });
                });

                it('should pass an error when attempting to resolve a module that doesn\'t exist', function (done) {
                    scope.resolveAsync(function () {}, function (err) {
                        expect(err).to.be.a('object');

                        scope.resolveAsync('icanhascheeseburger', function (err) {
                            expect(err).to.be.a('object');
                            done();
                        });
                    });
                });

                it('should be able to resolve multiple modules at the same time', function (done) {
                    // when
                    scope.resolveManyAsync([testModules.module1.name, testModules.module2.name], function (err, results) {
                        // then
                        var mod1 = results[testModules.module1.name],
                            mod2 = results[testModules.module2.name];

                        mod1.should.equal(testModules.module1.expected);
                        mod2.dep1Out.should.equal(testModules.module1.expected);
                        mod2.thisOut.should.equal(testModules.module2.expected);
                        done();
                    });
                });

                it('should pass an error when resolving multiple modules and any or all of the dependencies are not met', function (done) {
                    var sutName1 = generateId();

                    scope.resolveManyAsync([testModules.module1.name, sutName1], function (err, results) {
                        expect(err).to.be.a('object');
                        done();
                    });
                });

            }); // /resolving

            spec.describe('when auto-registering modules', function () {

                var assert = function (newScope, index, done) {
                    newScope.autoRegisterAsync(index, function () {
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

                    assert(new Hilary().useAsync(async), index, done);
                });

                it('should be able to register an object of definitions', function (done) {
                    var index = {
                            mock1: testModules.module1.moduleDefinition,
                            mock2: testModules.module2.moduleDefinition,
                            mock3: testModules.module3.moduleDefinition,
                            mock4: testModules.module4.moduleDefinition
                        };

                    assert(new Hilary().useAsync(async), index, done);
                });

                it('should return an error when any or all registrations failed', function (done) {
                    var mock1 = testModules.module1.moduleDefinition,
                        mock2 = {},
                        index = [mock1, mock2],
                        newScope = new Hilary().useAsync(async);

                    newScope.autoRegisterAsync(index, function (err) {
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

                it('should pass an error if some or all dependencies were not met', function (done) {
                    var mockRegistrationName = generateId(),
                        idx = mockIndex(mockRegistrationName),
                        index;

                    delete idx.mock2.factory;
                    index = [idx.mock3, idx.mock2, idx.mock1];

                    scope.autoResolveAsync(index, function (err) {
                        expect(err).to.be.a('object');

                        done();
                    });
                });

                it('should pass an error if some or all dependencies of an item in the index were not met', function (done) {
                    var mockRegistrationName = generateId(),
                        missingName = generateId(),
                        idx = mockIndex(mockRegistrationName),
                        index;

                    idx.mock2.dependencies.push(missingName);
                    index = [idx.mock3, idx.mock2, idx.mock1];

                    scope.autoResolveAsync(index, function (err) {
                        expect(err).to.be.a('object');

                        done();
                    });
                });

            }); // /autoResolve

        }); // /Hilary DI

        spec.describe('Hilary Async Dispose', function () {
            spec.describe('when a single moduleName is passed as an argument', function () {
                it('should delete that module from the container', function (done) {
                    var sut = new Hilary().useAsync(async),
                        sutModules = makeMockData(sut, generateId),
                        actual1,
                        actual2;

                    actual1 = sut.resolve(sutModules.module1.name);
                    sut.disposeAsync(sutModules.module1.name, function () {
                        actual2 = sut.exists(sutModules.module1.name);

                        expect(actual1).to.equal(sutModules.module1.expected);
                        expect(sut.getContext().container[sutModules.module1.name]).to.equal(undefined);
                        expect(actual2).to.equal(false);
                        done();
                    });
                });

                it('should return false, if it does not exist', function (done) {
                    var sut = new Hilary().useAsync(async),
                        sutModules = makeMockData(sut, generateId);

                    sut.disposeAsync(generateId(), function (err, actual) {
                        expect(actual).to.equal(false);
                        done();
                    });
                });
            });

            spec.describe('when an array of moduleNames is passed as an argument', function () {
                it('should delete those modules from the container', function (done) {
                    var sut = new Hilary().useAsync(async),
                        sutModules = makeMockData(sut, generateId),
                        actual1,
                        actual2,
                        actual3,
                        actual4;

                    actual1 = sut.resolve(sutModules.module1.name);
                    actual2 = sut.resolve(sutModules.module2.name);
                    sut.disposeAsync([sutModules.module1.name, sutModules.module2.name], function () {
                        actual3 = sut.exists(sutModules.module1.name);
                        actual4 = sut.exists(sutModules.module2.name);

                        expect(actual1).to.equal(sutModules.module1.expected);
                        expect(actual2.thisOut).to.equal(sutModules.module2.expected);
                        expect(sut.getContext().container[sutModules.module1.name]).to.equal(undefined);
                        expect(actual3).to.equal(false);
                        expect(actual4).to.equal(false);
                        done();
                    });
                });

                it('should return false, if any do not exist', function (done) {
                    // given
                    var sut = new Hilary().useAsync(async),
                        sutModules = makeMockData(sut, generateId);

                    sut.disposeAsync([sutModules.module1.name, generateId()], function (err, actual) {
                        expect(actual).to.equal(false);
                        done();
                    });
                });

            });

            spec.describe('when no argument is passed', function () {
                it('should delete all modules from the container', function (done) {
                    var sut = new Hilary().useAsync(async),
                        sutModules = makeMockData(sut, generateId),
                        actual1,
                        actual2,
                        actual3,
                        actual4;

                    actual1 = sut.resolve(sutModules.module1.name);
                    actual2 = sut.resolve(sutModules.module2.name);
                    sut.disposeAsync(function () {
                        actual3 = sut.exists(sutModules.module1.name);
                        actual4 = sut.exists(sutModules.module2.name);

                        expect(actual1).to.equal(sutModules.module1.expected);
                        expect(actual2.thisOut).to.equal(sutModules.module2.expected);
                        expect(sut.getContext().container[sutModules.module1.name]).to.equal(undefined);
                        expect(actual3).to.equal(false);
                        expect(actual4).to.equal(false);
                        done();
                    });
                });
            });

            spec.describe('when an argument that isn\'t supported is passed', function (done) {
                it('should return false', function () {
                    var actual = scope.dispose(function (err, result) {
                        expect(actual).to.equal(false);
                        done();
                    });
                });
            });

        }); // /Dispose

        // /SPEC
    };

}((typeof module !== 'undefined' && module.exports) ? module.exports : window));


//        scope.resolveManyAsync = function (moduleNameArray, next) {
//            var id = utils.createGuid(),
//                registerTask,
//                resolveTask,
//                disposeTask;
//
//
//            resolveTask = function () {
////                scope.resolveAsync(id, function (err, result) {
////                    next(err, result);
////                    disposeTask();
////                });
//
//                var result = scope.resolve(id);
//                next(null, result);
//                disposeTask();
//            };
//
//            disposeTask = function () {
//                console.log('disposing', id);
//                //scope.disposeAsync(id);
//            };
//
//            scope.registerAsync({
//                name: id,
//                dependencies: moduleNameArray,
//                factory: function () {}
//            }, resolveTask);
//
//
////            var moduleTasks = [],
////                i,
////                makeTask = function (moduleName) {
////                    return function (callback) {
////                        //scope.resolveAsync(moduleName, container, pipeline, parent, callback);
////                        var result = scope.resolve(moduleName, container, pipeline, parent);
////
////                        if (result) {
////                            callback(null, result);
////                        } else {
////                            callback('error');
////                        }
////                    };
////                };
////
////            if (utils.notArray(moduleNameArray)) {
////                throw err.argumentException('The moduleNameArray is required and must be an Array', 'moduleNameArray');
////            }
////
////            if (utils.notFunction(next)) {
////                throw err.argumentException('The next argument is required and must be a Function', 'next');
////            }
////
////            for (i = 0; i < moduleNameArray.length; i += 1) {
////                moduleTasks.push(makeTask(moduleNameArray[i]));
////            }
////
////            async.parallel(moduleTasks, function (err, modules) {
////                next(null, modules);
////            });
//        };
