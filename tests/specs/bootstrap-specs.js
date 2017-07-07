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
                    printer: function (arg1) {
                        if (arg1.indexOf('no task functions were found in the bootstrapper') > -1) {
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
                    printer: function (arg1) {
                        if (arg1.indexOf('a callback was not defined for the bootstrapper') > -1) {
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
