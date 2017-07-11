(function (register) {
    'use strict';

    register({
        name: 'register-resolve-error-async-specs',
        Spec: Spec
    });

    function Spec (hilary, expect, id) {
        return {
            '(async) when attempting to register a module,': {
                'and the first argument is NOT an object or array': {
                    'it should pass an exception to the callback': registerInvalidFirstArg
                },
                'and the registration is missing required properties': {
                    'it should pass an exception to the callback': registrationMissingProperties
                }
            },
            '(async) when attempting to resolve a module,': {
                'and the name is not a string': {
                    'it should pass an exception to the callback': resolveWithInvalidName
                },
                'and the module is not found': {
                    'it should pass an exception to the callback': resolveNotFound
                },
                'and the module\'s dependencies were not found': {
                    'it should pass an exception to the callback': resolveMissingDependencies
                }
            }
        };

        function registerInvalidFirstArg (done) {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});

            // when
            scope.register(0, function (err) {
                // then
                expect(err.type).to.equal('InvalidArgument');
                done();
            });
        }

        function registrationMissingProperties (done) {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});

            // when
            scope.register({}, function (err) {
                // then
                expect(err.type).to.equal('InvalidRegistration');
                done();
            });
        }

        function resolveWithInvalidName (done) {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});

            // when
            scope.resolve(0, function (err) {
                // then
                expect(typeof err).to.equal('object');
                expect(err.isException).to.equal(true);
                expect(err.type).to.equal('InvalidArgument');
                done();
            });
        }

        function resolveNotFound (done) {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});

            // when
            scope.resolve(id.createUid(8), function (err) {
                // then
                expect(err.isException).to.equal(true);
                expect(err.type).to.equal('ModuleNotFound');
                done();
            });
        }

        function resolveMissingDependencies (done) {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});

            scope.register({
                name: 'regfunc1',
                factory: function () {
                    this.foo = 'bar';
                }
            });

            scope.register({
                name: 'regfunc4',
                dependencies: ['regfunc1', 'regfunc2', 'regfunc3'],
                factory: function (f1, f2, f3) {
                    this.f1 = f1;
                    this.f2 = f2;
                    this.f3 = f3;
                }
            });

            // when
            scope.resolve('regfunc4', function (err) {
                // then
                expect(err.isException).to.equal(true);
                expect(err.type).to.equal('ModuleNotFound');
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
