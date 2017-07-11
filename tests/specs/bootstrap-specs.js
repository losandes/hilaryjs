(function (register) {
    'use strict';

    register({
        name: 'bootstrap-specs',
        Spec: Spec
    });

    function Spec (hilary, expect, id) {
        return {
            'when an array of tasks is passed as the first argument,': {
                'they should be executed in order': tasksExecuteInOrder
            },
            'when a callback is present': {
                // note this is the same test as above
                'it should be executed after the tasks complete': tasksExecuteInOrder
            },
            'when the first argument is not an array,': {
                'a trace log should indicate there are no tasks': tasksAreNotAnArray
            },
            'when the first argument is an array, but does not contain functions,': {
                'a trace log should indicate there are no tasks': tasksContainsNoFunctions
            },
            'when a callback is not present': {
                'a final function should be generated': bootstrapWithoutCallback,
                'and an error was encountered in the tasks': {
                    'the final function should produce a fatal log': bootstrapErrorWithoutCallback
                }
            },
            'when makeRegistrationTask is used to populate the startup array': {
                'it should register the modules that are presented': makeRegistrationTasks,
                'and the first argument is not `scope`': {
                    'it should throw an error': makeRegistrationTasksFirstArgError
                },
                'and the second argument is not the callback': {
                    'it should throw an error': makeRegistrationTasksSecondArgError
                }
            }
        };

        function tasksExecuteInOrder (done) {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});

            // when
            scope.bootstrap([
                function (scope, next) {
                    next(null, scope, [0]);
                },
                function (scope, tasks, next) {
                    tasks.push(1);
                    next(null, scope, tasks);
                },
                function (scope, tasks, next) {
                    tasks.push(2);
                    next(null, scope, tasks);
                }
            ], function (err, scope, tasks) {
                expect(err).to.equal(null);
                expect(scope.__isHilaryScope).to.equal(true);
                expect(tasks.length).to.equal(3);
                expect(tasks[0]).to.equal(0);
                expect(tasks[1]).to.equal(1);
                expect(tasks[2]).to.equal(2);
                done();
            });
        }

        function tasksAreNotAnArray (done) {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});

            // when
            scope.bootstrap(
                function (scope, next) {
                    next(null, scope, [0]);
                },
                function (err) {
                    expect(err.isException).to.equal(true);
                    expect(err.type).to.equal('BootstrapFailed');
                    done();
            });
        }

        function tasksContainsNoFunctions (done) {
            // given
            var actual = false,
                scope = hilary.scope(id.createUid(8), {
                logging: {
                    level: 'trace',
                    printer: function (entry) {
                        if (entry.message.indexOf('no task functions were found in the bootstrapper') > -1) {
                            actual = true;
                        }
                    }
                }
            });

            // when
            scope.bootstrap([],
                function (err) {
                    expect(err).to.equal(null);
                    expect(actual).to.equal(true);
                    done();
            });
        }

        function bootstrapWithoutCallback (done) {
            // given
            var scope = hilary.scope(id.createUid(8), {
                logging: {
                    level: 'trace',
                    printer: function (entry) {
                        if (entry.message.indexOf('callback was not defined') > -1) {
                            done();
                        }
                    }
                }
            });

            // when
            scope.bootstrap([]);
        }

        function bootstrapErrorWithoutCallback (done) {
            // given
            var expected = id.createUid(8),
                scope = hilary.scope(id.createUid(8), {
                logging: {
                    level: 'trace',
                    printer: function (arg1) {
                        if (arg1.error) {
                            expect(arg1.error.message).to.equal(expected);
                            done();
                        }
                    }
                }
            });

            // when
            scope.bootstrap([
                function (scope, next) {
                    next(new Error(expected));
                }
            ]);
        }

        function makeRegistrationTasks (done) {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}}),
                module1, module2, module3;

            module1 = { name: 'module1', factory: { id: 1 } };
            module2 = { name: 'module2', factory: { id: 2 } };
            module3 = { name: 'module3', factory: { id: 3 } };

            // when
            scope.bootstrap([
                scope.makeRegistrationTask(module1),
                scope.makeRegistrationTask(module2),
                scope.makeRegistrationTask(module3)
            ], function (err, scope) {
                expect(err).to.equal(null);
                expect(scope.__isHilaryScope).to.equal(true);
                expect(scope.resolve('module1').id).to.equal(1);
                expect(scope.resolve('module2').id).to.equal(2);
                expect(scope.resolve('module3').id).to.equal(3);
                done();
            });
        }

        function makeRegistrationTasksFirstArgError (done) {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}}),
                module1;

            module1 = { name: 'module1', factory: { id: 1 } };

            // when
            scope.bootstrap([
                function (scope, next) {
                    next(null, 1, 2, 3);
                },
                scope.makeRegistrationTask(module1)
            ], function (err) {
                expect(err.isException).to.equal(true);
                done();
            });
        }

        function makeRegistrationTasksSecondArgError (done) {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}}),
                module1;

            module1 = { name: 'module1', factory: { id: 1 } };

            // when
            scope.bootstrap([
                function (scope, next) {
                    next(null, scope, 2, 3);
                },
                scope.makeRegistrationTask(module1)
            ], function (err) {
                expect(err.isException).to.equal(true);
                done();
            });
        }

    } // /Spec

}(function (registration) {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = registration.Spec;
    } else if (typeof window !== 'undefined') {
        window.fixtures = window.fixtures || {};
        window.fixtures[registration.name] = registration.Spec;
    } else {
        throw new Error('[HILARY-TESTS] Unkown runtime environment');
    }
}));
