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

                it('should execute that module BEFORE new modules are registered', function (done) {
                    var expected = generateId();

                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.register(function (err, payload, next) {
                                payload.moduleInfo.factory = function () {
                                    return expected;
                                };

                                next(err, payload);
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register(testModules.module1.moduleDefinition);
                        },
                        onComposed: function (err, scope) {
                            // then
                            expect(scope.resolve(testModules.module1.name)).to.equal(expected);
                            done();
                        }
                    });
                });

                it('should execute that module BEFORE new modules are registered asynchronously', function (done) {
                    var expected = generateId();

                    // given
                    new Hilary().useAsync(async).Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.register(function (err, payload, next) {
                                payload.moduleInfo.factory = function () {
                                    return expected;
                                };

                                next(err, payload);
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.registerAsync(testModules.module1.moduleDefinition, function () {
                                // then
                                expect(scope.resolve(testModules.module1.name)).to.equal(expected);
                                done();
                            });
                        }
                    });
                });

                it('should pass the err in a waterfall, through before.register events', function (done) {
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.register(function (err, payload, next) {
                                next({ status: 500 });
                            });

                            pipeline.register.before.register(function (err) {
                                // then
                                expect(err.status).to.equal(500);
                                done();
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register(testModules.module1.moduleDefinition);
                        }
                    });
                });

                it('should pass the err in a waterfall, through before.register async events', function (done) {
                    // given
                    new Hilary().useAsync(async).Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.register(function (err, payload, next) {
                                next({ status: 500 });
                            });

                            pipeline.register.before.register(function (err, payload, next) {
                                next(err);
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.registerAsync(testModules.module1.moduleDefinition, function (err) {
                                // then
                                expect(err.status).to.equal(500);
                                done();
                            });
                        }
                    });
                });

                it('should pass the result in a waterfall, through before.register events', function (done) {
                    var expected1 = generateId(),
                        expected2 = generateId();

                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.register(function (err, payload, next) {
                                payload.moduleInfo.factory = {
                                    expected1: expected1
                                };

                                next(err, payload);
                            });

                            pipeline.register.before.register(function (err, payload, next) {
                                payload.moduleInfo.factory.expected2 = expected2;
                                next(err, payload);
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register(testModules.module1.moduleDefinition);
                        },
                        onComposed: function (err, scope) {
                            // then
                            var actual = scope.resolve(testModules.module1.name);
                            expect(actual.expected1).to.equal(expected1);
                            expect(actual.expected2).to.equal(expected2);
                            done();
                        }
                    });
                });

                it('should pass the result in a waterfall, through before.register async events', function (done) {
                    var expected1 = generateId(),
                        expected2 = generateId();

                    // given
                    new Hilary().useAsync(async).Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.register(function (err, payload, next) {
                                payload.moduleInfo.factory = {
                                    expected1: expected1
                                };

                                next(err, payload);
                            });

                            pipeline.register.before.register(function (err, payload, next) {
                                payload.moduleInfo.factory.expected2 = expected2;
                                next(err, payload);
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.registerAsync(testModules.module1.moduleDefinition, function (err, actual) {
                                // then
                                expect(actual.factory.expected1).to.equal(expected1);
                                expect(actual.factory.expected2).to.equal(expected2);
                                done();
                            });
                        }
                    });
                });

            }); // /"before::register

            spec.describe('when an "after::register" event exists', function () {

                it('should execute that module AFTER new modules are registered', function (done) {
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.register(function () {
                                // then
                                expect(scope.resolve(testModules.module1.name)).to.equal(testModules.module1.expected);
                                done();
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register(testModules.module1.moduleDefinition);
                        }
                    });
                });

                it('should execute that module AFTER new modules are registered asynchronously', function (done) {
                    // given
                    new Hilary().useAsync(async).Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.register(function () {
                                // then
                                expect(scope.resolve(testModules.module1.name)).to.equal(testModules.module1.expected);
                                done();
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.registerAsync(testModules.module1.moduleDefinition);
                        }
                    });
                });

                it('should pass the err in a waterfall, through after.register events', function (done) {
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.register(function (err, payload, next) {
                                next({ status: 500 });
                            });

                            pipeline.register.after.register(function (err) {
                                // then
                                expect(err.status).to.equal(500);
                                done();
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register({ name: 'foo', factory: function () {} });
                        }
                    });
                });

                it('should pass the err in a waterfall, through after.register async events', function (done) {
                    // given
                    new Hilary().useAsync(async).Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.register(function (err, payload, next) {
                                next({ status: 500 });
                            });

                            pipeline.register.after.register(function (err, payload, next) {
                                next(err);
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.registerAsync({ name: 'foo', factory: function () {} }, function (err) {
                                // then
                                expect(err.status).to.equal(500);
                                done();
                            });
                        }
                    });
                });

                it('should pass the result in a waterfall, through after.register events', function (done) {
                    var expected1 = generateId(),
                        expected2 = generateId();

                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.register(function (err, payload, next) {
                                payload.moduleInfo.factory = {
                                    expected1: expected1
                                };

                                next(err, payload);
                            });

                            pipeline.register.after.register(function (err, payload, next) {
                                payload.moduleInfo.factory.expected2 = expected2;
                                next(err, payload);
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register(testModules.module1.moduleDefinition);
                        },
                        onComposed: function (err, scope) {
                            // then
                            var actual = scope.resolve(testModules.module1.name);
                            expect(actual.expected1).to.equal(expected1);
                            expect(actual.expected2).to.equal(expected2);
                            done();
                        }
                    });
                });

                it('should pass the result in a waterfall, through after.register async events', function (done) {
                    var expected1 = generateId(),
                        expected2 = generateId();

                    // given
                    new Hilary().useAsync(async).Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.register(function (err, payload, next) {
                                payload.moduleInfo.factory = {
                                    expected1: expected1
                                };

                                next(err, payload);
                            });

                            pipeline.register.after.register(function (err, payload, next) {
                                payload.moduleInfo.factory.expected2 = expected2;
                                next(err, payload);
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.registerAsync(testModules.module1.moduleDefinition, function (err, actual) {
                                // then
                                expect(actual.factory.expected1).to.equal(expected1);
                                expect(actual.factory.expected2).to.equal(expected2);
                                done();
                            });
                        }
                    });
                });

            }); // /after::register

            spec.describe('when a "before::resolve" event exists', function () {

                it('should execute that module BEFORE new modules are resolved', function (done) {
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.resolve(function (err, payload) {
                                payload.moduleName = testModules.module1.name;
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register(testModules.module1.moduleDefinition);
                            scope.register(testModules.module2.moduleDefinition);
                        },
                        onComposed: function (err, scope) {
                            // then
                            expect(scope.resolve(testModules.module2.name)).to.equal(testModules.module1.expected);
                            done();
                        }
                    });
                });

                it('should execute that module BEFORE new modules are resolved asynchronously', function (done) {
                    // given
                    new Hilary().useAsync(async).Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.resolve(function (err, payload) {
                                payload.moduleName = testModules.module1.name;
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register(testModules.module1.moduleDefinition);
                            scope.register(testModules.module2.moduleDefinition);
                        },
                        onComposed: function (err, scope) {
                            scope.resolveAsync(testModules.module2.name, function (err, actual) {
                                // then
                                expect(err).to.equal(null);
                                expect(actual).to.equal(testModules.module1.expected);
                                done();
                            });
                        }
                    });
                });

                it('should pass the err in a waterfall, through before.resolve events', function (done) {
                    var name = generateId(),
                        expected = generateId();
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.resolve(function (err, payload, next) {
                                next({ status: 500 });
                            });

                            pipeline.register.before.resolve(function (err, payload) {
                                // then
                                expect(err.status).to.equal(500);
                                done();
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register({ name: name, factory: function () { return expected; }});
                        },
                        onComposed: function (err, scope) {
                            scope.resolve(name);
                        }
                    });
                });

                it('should pass the err in a waterfall, through before.resolve async events', function (done) {
                    var name = generateId(),
                        expected = generateId();
                    // given
                    new Hilary().useAsync(async).Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.resolve(function (err, payload, next) {
                                next({ status: 500 });
                            });

                            pipeline.register.before.resolve(function (err, payload, next) {
                                next(err);
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register({ name: name, factory: function () { return expected; }});
                        },
                        onComposed: function (err, scope) {
                            scope.resolveAsync(name, function (err) {
                                // then
                                expect(err.status).to.equal(500);
                                done();
                            });
                        }
                    });
                });

                it('should pass the result in a waterfall, through before.resolve events', function (done) {
                    var name = generateId(),
                        expected = generateId();
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.resolve(function (err, payload, next) {
                                next(null, { newResult: true });
                            });

                            pipeline.register.before.resolve(function (err, payload) {
                                // then
                                expect(payload.newResult).to.equal(true);
                                done();
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register({ name: name, factory: function () { return expected; }});
                        },
                        onComposed: function (err, scope) {
                            scope.resolve(name);
                        }
                    });
                });

                it('should pass the result in a waterfall, through before.resolve async events', function (done) {
                    var name = generateId(),
                        expected = generateId(),
                        name2 = generateId(),
                        expected2 = generateId();
                    // given
                    new Hilary().useAsync(async).Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.resolve(function (err, payload, next) {
                                payload.moduleName = name2;
                                next(null, payload);
                            });

                            pipeline.register.before.resolve(function (err, payload, next) {
                                next(err, payload);
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register({ name: name, factory: function () { return expected; }});
                            scope.register({ name: name2, factory: function () { return expected2; }});
                        },
                        onComposed: function (err, scope) {
                            scope.resolveAsync(name, function (err, payload) {
                                // then
                                expect(payload).to.equal(expected2);
                                done();
                            });
                        }
                    });
                });

            }); // /before::resolve

            spec.describe('when a "after::resolve" event exists', function () {

                it('should execute that module AFTER new modules are resolved', function (done) {
                    var name = generateId(),
                        expected = generateId();
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.resolve(function (err, payload) {
                                // then
                                expect(err).to.equal(null);
                                expect(payload.result).to.equal(expected);
                                done();
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register({ name: name, factory: function () { return expected; }});
                        },
                        onComposed: function (err, scope) {
                            scope.resolve(name);
                        }
                    });
                });

                it('should execute that module AFTER new modules are resolved asynchronously', function (done) {
                    var name = generateId(),
                        expected = generateId();
                    // given
                    new Hilary().useAsync(async).Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.resolve(function (err, payload) {
                                // then
                                expect(err).to.equal(null);
                                expect(payload.result).to.equal(expected);
                                done();
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register({ name: name, factory: function () { return expected; }});
                        },
                        onComposed: function (err, scope) {
                            scope.resolveAsync(name, function() {});
                        }
                    });
                });

                it('should pass the err in a waterfall, through after.resolve events', function (done) {
                    var name = generateId(),
                        expected = generateId();
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.resolve(function (err, payload, next) {
                                next({ status: 500 });
                            });

                            pipeline.register.after.resolve(function (err, payload) {
                                // then
                                expect(err.status).to.equal(500);
                                done();
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register({ name: name, factory: function () { return expected; }});
                        },
                        onComposed: function (err, scope) {
                            scope.resolve(name);
                        }
                    });
                });

                it('should pass the err in a waterfall, through after.resolve async events', function (done) {
                    var name = generateId(),
                        expected = generateId();
                    // given
                    new Hilary().useAsync(async).Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.resolve(function (err, payload, next) {
                                next({ status: 500 });
                            });

                            pipeline.register.after.resolve(function (err, payload, next) {
                                next(err);
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register({ name: name, factory: function () { return expected; }});
                        },
                        onComposed: function (err, scope) {
                            scope.resolveAsync(name, function (err) {
                                // then
                                expect(err.status).to.equal(500);
                                done();
                            });
                        }
                    });
                });

                it('should pass the result in a waterfall, through after.resolve events', function (done) {
                    var name = generateId(),
                        expected = generateId();
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.resolve(function (err, payload, next) {
                                next(null, { newResult: true });
                            });

                            pipeline.register.after.resolve(function (err, payload) {
                                // then
                                expect(payload.newResult).to.equal(true);
                                done();
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register({ name: name, factory: function () { return expected; }});
                        },
                        onComposed: function (err, scope) {
                            scope.resolve(name);
                        }
                    });
                });

                it('should pass the result in a waterfall, through after.resolve async events', function (done) {
                    var name = generateId(),
                        expected = generateId();
                    // given
                    new Hilary().useAsync(async).Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.resolve(function (err, payload, next) {
                                next(null, { result: { newResult: true } });
                            });

                            pipeline.register.after.resolve(function (err, payload, next) {
                                next(err, payload);
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register({ name: name, factory: function () { return expected; }});
                        },
                        onComposed: function (err, scope) {
                            scope.resolveAsync(name, function (err, payload) {
                                // then
                                expect(payload.newResult).to.equal(true);
                                done();
                            });
                        }
                    });
                });

            }); // /after::resolve

            spec.describe('when a "before::new::child" event exists', function () {
                it('should execute that module BEFORE new child containers are created', function (done) {
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.newChild(function (err, payload) {
                                expect(payload.options).to.not.equal(undefined);
                                expect(payload.options.parentContainer).to.not.equal(undefined);
                                expect(payload.scope).to.not.equal(undefined);
                                expect(payload.scope.useAsync).to.not.equal(undefined);
                                done();
                            });
                        },
                        onComposed: function (err, scope) {
                            scope.createChildContainer();
                        }
                    });
                });

                it('should pass the err in a waterfall, through before.newChild events', function (done) {
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.newChild(function (err, payload, next) {
                                next({ status: 500 });
                            });

                            pipeline.register.before.newChild(function (err, payload) {
                                expect(err.status).to.equal(500);
                                done();
                            });
                        },
                        onComposed: function (err, scope) {
                            scope.createChildContainer();
                        }
                    });
                });

                it('should pass the options in a waterfall, through before.newChild events', function (done) {
                    var expected = generateId();

                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.newChild(function (err, payload, next) {
                                payload.options.name = expected;
                                next(null, payload);
                            });

                            pipeline.register.before.newChild(function (err, payload, next) {
                                next(err, payload);
                            });
                        },
                        onComposed: function (err, scope) {
                            var child = scope.createChildContainer();
                            expect(child.getContext().namedScope).to.equal(expected);
                            done();
                        }
                    });
                });
            }); // /before::new::child

            spec.describe('when a "after::new::child" event exists', function () {
                it('should execute that module AFTER new child containers are created', function (done) {
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.newChild(function (err, payload) {
                                expect(payload.options).to.not.equal(undefined);
                                expect(payload.options.parentContainer).to.not.equal(undefined);
                                expect(payload.child).to.not.equal(undefined);
                                expect(payload.child.register).to.be.a('function');
                                expect(payload.child.resolve).to.be.a('function');
                                expect(payload.scope).to.not.equal(undefined);
                                expect(payload.scope.useAsync).to.not.equal(undefined);
                                done();
                            });
                        },
                        onComposed: function (err, scope) {
                            scope.createChildContainer();
                        }
                    });
                });

                it('should pass the err in a waterfall, through after.newChild events', function (done) {
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.newChild(function (err, payload, next) {
                                next({ status: 500 });
                            });

                            pipeline.register.after.newChild(function (err) {
                                expect(err.status).to.equal(500);
                                done();
                            });
                        },
                        onComposed: function (err, scope) {
                            scope.createChildContainer();
                        }
                    });
                });

                it('should pass the child in a waterfall, through after.newChild events', function (done) {
                    var expected = generateId();

                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.after.newChild(function (err, payload, next) {
                                payload.child.sut = expected;
                                next(null, payload);
                            });

                            pipeline.register.after.newChild(function (err, payload) {
                                expect(payload.child.sut).to.equal(expected);
                                done();
                            });
                        },
                        onComposed: function (err, scope) {
                            scope.createChildContainer();
                        }
                    });
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
                it('also see the "waterfall" specs in before::register, after::register, before::resolve and after::resolve', function (done) {
                    // pass
                    done();
                });

                it('should execute each one of them', function (done) {
                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.register(function (err, payload, next) {
                                next({ status: 500 });
                            });

                            pipeline.register.before.register(function (err) {
                                // then
                                expect(err.status).to.equal(500);
                                done();
                            });
                        },
                        composeModules: function (err, scope) {
                            scope.register(testModules.module1.moduleDefinition);
                        }
                    });
                });
            });

            spec.describe('when a pipeline event has the once property', function () {
                it('should only execute one time', function (done) {
                    var count = 0;

                    // given
                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.register(new scope.PipelineEvent({
                                eventHandler: function () {
                                    count += 1;
                                },
                                once: true
                            }));
                        },
                        composeModules: function (err, scope) {
                            // when
                            scope.register(testModules.module1.moduleDefinition);
                            scope.register(testModules.module2.moduleDefinition);
                            scope.register(testModules.module3.moduleDefinition);

                            // then
                            expect(count).to.equal(1);
                            done();
                        }
                    });
                });
            });

            spec.describe('when a pipeline event has the remove property', function () {
                it('should remove the pipeline event when remove returns true', function (done) {
                    // given
                    var handler1Count = 0,
                        handler2Count = 0,
                        name1 = generateId(),
                        name2 = generateId();

                    new Hilary().Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.register.before.resolve(function () {
                                handler1Count += 1;
                            });

                            pipeline.register.before.resolve(new scope.PipelineEvent({
                                eventHandler: function () {
                                    handler2Count += 1;
                                },
                                remove: function (err, data) {
                                    if (data.moduleName === name2) {
                                        return true;
                                    }
                                }
                            }));
                        },
                        composeModules: function (err, scope) {
                            scope.register({ name: name1, factory: function () {}});
                            scope.register({ name: name2, factory: function () {}});
                        },
                        onComposed: function (err, scope) {
                            // when
                            scope.resolve(name1);
                            scope.resolve(name2);
                            scope.resolve(name2);
                            scope.resolve(name1);

                            // then
                            expect(handler1Count).to.equal(4);
                            expect(handler2Count).to.equal(2);
                            done();
                        }
                    });
                });
            });
        });

    }; // /eports

}((typeof module !== 'undefined' && module.exports) ? module.exports : window));
