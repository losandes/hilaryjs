/*global module*/
(function (exports) {
    'use strict';

    exports['hilary.pipeline.fixture'] = function (Hilary, spec, generateId, makeMockData, async) {

        var fixtureScope = new Hilary().useAsync(async),
            expect = spec.expect,
            it = spec.it,
            testModules = makeMockData(fixtureScope, generateId),
            constants = fixtureScope.getContext().constants;


        spec.describe('The Hilary Pipeline', function () {

            spec.describe('when a "before::register" event exists', function () {

                var registerEvent = function (specScope, sutModuleName) {
                    specScope.registerEvent(constants.pipeline.beforeRegister, function (scope, moduleInfo) {
                        if (moduleInfo.name === testModules.module1.name) {
                            // register something new
                            var newModule = testModules.module2.moduleDefinition;
                            newModule.name = sutModuleName;
                            scope.register(newModule);

                            // modify the registration
                            moduleInfo.factory = function () {
                                return sutModuleName;
                            };
                        }
                    });
                };

                it('should execute that module BEFORE new modules are registered', function () {
                    var specScope = new Hilary(),
                        sutModuleName = generateId(),
                        actual1,
                        actual2;

                    // given
                    registerEvent(specScope, sutModuleName);

                    // when
                    specScope.register(testModules.module1.moduleDefinition);
                    actual1 = specScope.resolve(sutModuleName);
                    actual2 = specScope.resolve(testModules.module1.name);

                    // then the module that was being registered should have been modified by the event
                    actual2.should.equal(sutModuleName);

                    // then a new module should have been registered, as a result of the event
                    actual1.thisOut.should.equal(testModules.module2.expected);
                });

                it('should execute that module BEFORE new modules are registered asynchronously', function (done) {
                    var specScope = new Hilary().useAsync(async),
                        sutModuleName = generateId();

                    // given
                    registerEvent(specScope, sutModuleName);

                    // when
                    specScope.registerAsync(testModules.module1.moduleDefinition, function () {
                        var actual1,
                            actual2;

                        actual1 = specScope.resolve(sutModuleName);
                        actual2 = specScope.resolve(testModules.module1.name);

                        // then the module that was being registered should have been modified by the event
                        actual2.should.equal(sutModuleName);

                        // then a new module should have been registered, as a result of the event
                        actual1.thisOut.should.equal(testModules.module2.expected);
                        done();
                    });
                });

            }); // /"before::register

            spec.describe('when an "after::register" event exists', function () {

                var registerEvent = function (specScope, done) {
                    specScope.registerEvent(constants.pipeline.afterRegister, function (scope, moduleInfo) {
                        if (moduleInfo.name === testModules.module1.name) {
                            // then
                            var actual = specScope.resolve(testModules.module1.name);
                            expect(actual).to.equal(testModules.module1.expected);
                            expect(scope).to.not.equal(undefined);
                            expect(scope.useAsync).to.not.equal(undefined);
                            done();
                        }
                    });
                };

                it('should execute that module AFTER new modules are registered', function (done) {
                    // given
                    var specScope = new Hilary();
                    registerEvent(specScope, done);

                    // when
                    specScope.register(testModules.module1.moduleDefinition);
                });

                it('should execute that module AFTER new modules are registered asynchronously', function (done) {
                    // given
                    var specScope = new Hilary().useAsync(async);
                    registerEvent(specScope, done);

                    // when
                    specScope.registerAsync(testModules.module1.moduleDefinition);
                });

            }); // /after::register

            spec.describe('when a "before::resolve" event exists', function () {

                var registerEvent = function (specScope, done) {
                    specScope.registerEvent(constants.pipeline.beforeResolve, function (scope, moduleName) {
                        expect(moduleName).to.equal(testModules.module1.name);
                        expect(scope).to.not.equal(undefined);
                        expect(scope.useAsync).to.not.equal(undefined);
                        done();
                    });
                };

                it('should execute that module BEFORE new modules are resolved', function (done) {
                    // given
                    var specScope = new Hilary();
                    specScope.register(testModules.module1.moduleDefinition);
                    registerEvent(specScope, done);

                    // when
                    specScope.resolve(testModules.module1.name);
                });

                it('should execute that module BEFORE new modules are resolved asynchronously', function (done) {
                    // given
                    var specScope = new Hilary().useAsync(async);
                    specScope.register(testModules.module1.moduleDefinition);
                    registerEvent(specScope, done);

                    // when
                    specScope.resolveAsync(testModules.module1.name);
                });

            }); // /before::resolve

            spec.describe('when a "after::resolve" event exists', function () {

                var registerEvent = function (specScope, done) {
                    specScope.registerEvent(constants.pipeline.afterResolve, function (scope, moduleInfo) {
                        expect(moduleInfo.name).to.equal(testModules.module1.name);
                        expect(moduleInfo.result).to.equal(testModules.module1.expected);
                        expect(scope).to.not.equal(undefined);
                        expect(scope.useAsync).to.not.equal(undefined);
                        done();
                    });
                };

                it('should execute that module AFTER new modules are resolved', function (done) {
                    // given
                    var specScope = new Hilary();
                    specScope.register(testModules.module1.moduleDefinition);
                    registerEvent(specScope, done);

                    // when
                    specScope.resolve(testModules.module1.name);
                });

                it('should execute that module AFTER new modules are resolved asynchronously', function (done) {
                    // given
                    var specScope = new Hilary().useAsync(async);
                    specScope.register(testModules.module1.moduleDefinition);
                    registerEvent(specScope, done);

                    // when
                    specScope.resolveAsync(testModules.module1.name);
                });

            }); // /after::resolve

            spec.describe('when a "before::new::child" event exists', function () {

                var registerEvent = function (specScope, done) {
                    specScope.registerEvent(constants.pipeline.beforeNewChild, function (scope, options) {
                        expect(options).to.not.equal(undefined);
                        expect(options.parentContainer).to.not.equal(undefined);
                        expect(scope).to.not.equal(undefined);
                        expect(scope.useAsync).to.not.equal(undefined);
                        done();
                    });
                };

                it('should execute that module BEFORE new child containers are created', function (done) {
                    // given
                    var specScope = new Hilary();
                    registerEvent(specScope, done);

                    // when
                    specScope.createChildContainer();
                });

            }); // /before::new::child

            spec.describe('when a "after::new::child" event exists', function () {

                var registerEvent = function (specScope, done) {
                    specScope.registerEvent(constants.pipeline.afterNewChild, function (scope, options, child) {
                        expect(options).to.not.equal(undefined);
                        expect(options.parentContainer).to.not.equal(undefined);
                        expect(child).to.not.equal(undefined);
                        expect(child.register).to.be.a('function');
                        expect(child.resolve).to.be.a('function');
                        expect(scope).to.not.equal(undefined);
                        expect(scope.useAsync).to.not.equal(undefined);

                        done();
                    });
                };

                it('should execute that module AFTER new child containers are created', function (done) {
                    // given
                    var specScope = new Hilary();
                    registerEvent(specScope, done);

                    // when
                    specScope.createChildContainer();
                });

            }); // /after::new::child

            spec.describe('when a "hilary::error" event exists', function () {
                it('should execute that module when an error occurs', function (done) {
                    var count = 0;

                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.on.error(function (err) {
                                // then
                                expect(err).to.not.equal(undefined);
                                count += 1;

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
            });

            spec.describe('when a pipeline event has multiple registered handlers (i.e. an array of before register handlers)', function () {
                var registerEvent = function (specScope, sutModuleName) {
                    specScope.registerEvent(constants.pipeline.beforeRegister, function (scope, moduleInfo) {
                        if (moduleInfo.name === testModules.module1.name) {
                            // register something new
                            var newModule = testModules.module2.moduleDefinition;
                            newModule.name = sutModuleName;
                            scope.register(newModule);
                        }
                    });
                };

                it('should execute each one of them', function () {
                    var specScope = new Hilary(),
                        sutModuleName1 = generateId(),
                        sutModuleName2 = generateId(),
                        actual1,
                        actual2;

                    // given
                    registerEvent(specScope, sutModuleName1);
                    registerEvent(specScope, sutModuleName2);

                    // when
                    specScope.register(testModules.module1.moduleDefinition);
                    actual1 = specScope.resolve(sutModuleName1);
                    actual2 = specScope.resolve(sutModuleName2);

                    // then
                    expect(actual1.thisOut).to.equal(testModules.module2.expected);
                    expect(actual2.thisOut).to.equal(testModules.module2.expected);
                });
            });

            spec.describe('when a pipeline event has the once property', function () {
                it('should only execute one time', function () {
                    var eventHandler,
                        count = 0;

                    eventHandler = function () {
                        count += 1;
                    };
                    eventHandler.once = true;

                    fixtureScope.registerEvent(constants.pipeline.beforeRegister, eventHandler);

                    fixtureScope.register(testModules.module1.moduleDefinition);
                    fixtureScope.register(testModules.module2.moduleDefinition);

                    expect(count).to.equal(1);
                });
            });
        });

    }; // /eports

}((typeof module !== 'undefined' && module.exports) ? module.exports : window));
