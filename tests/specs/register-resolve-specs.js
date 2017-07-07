(function (register) {
    'use strict';

    register({
        name: 'register-resolve-specs',
        Spec: Spec
    });

    function Spec (hilary, expect, id) {
        return {
            'when an object literal is registered as a factory,': {
                'it should be resolvable': registerObjectLiteral,
                'and it has dependencies,': {
                    'it should log and return an exception': registerObjectLiteralWithDependencies
                }
            },
            'when a primitive (number) is registered as a factory,': {
                'it should be resolvable': registerPrimitiveNumber,
                'and it has dependencies,': {
                    'it should log and return an exception': registerPrimitiveNumberWithDependencies
                }
            },
            'when a primitive (boolean) is registered as a factory,': {
                'it should be resolvable': registerPrimitiveBoolean,
                'and it has dependencies,': {
                    'it should log and return an exception': registerPrimitiveBooleanWithDependencies
                }
            },
            'when a scope is present on the registration,': {
                'and that scope already exists,': {
                    'it should register the module on that scope': registerWithExistingScope
                },
                'and that scope does NOT exist,': {
                    'it should create that scope and register the module on it': registerWithUndefinedScope
                },
                'and that scope matches the scope register was called on,': {
                    'it should not recurse': registerWithSameScope
                },
                'and the current scope is NOT default (i.e. attempts to register on scope2, from scope1),': {
                    'it should ignore the scope declaration': registerWithOtherScope
                }
            }
        };

        // factory: {}
        function registerObjectLiteral () {
            // when
            var registration = hilary.register({
                name: 'testobj',
                factory: { foo: 'bar' }
            });

            // then
            expect(registration.isException).to.equal(undefined);
            expect(hilary.resolve('testobj').foo).to.equal('bar');
        }

        // factory: {} MISMATCH
        function registerObjectLiteralWithDependencies () {
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});

            expect(scope.register({
                name: 'testobjdep',
                dependencies: ['arg1'],
                factory: { foo: 'bar' }
            }).isException).to.equal(true);
        }

        // factory: 42
        function registerPrimitiveNumber () {
            // when
            var registration = hilary.register({
                name: 'testnum',
                factory: 42
            });

            // then
            expect(registration.isException).to.equal(undefined);
            expect(hilary.resolve('testnum')).to.equal(42);
        }

        // factory: 42 MISMATCH
        function registerPrimitiveNumberWithDependencies () {
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});

            expect(scope.register({
                name: 'testobjdep',
                dependencies: ['arg1'],
                factory: 42
            }).isException).to.equal(true);
        }

        // factory: false
        function registerPrimitiveBoolean () {
            // when
            var registration = hilary.register({
                name: 'testbool',
                factory: false
            });

            // then
            expect(registration.isException).to.equal(undefined);
            expect(hilary.resolve('testbool')).to.equal(false);
        }

        // factory: false MISMATCH
        function registerPrimitiveBooleanWithDependencies () {
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});

            expect(scope.register({
                name: 'testobjdep',
                dependencies: ['arg1'],
                factory: false
            }).isException).to.equal(true);
        }

        function registerWithExistingScope () {
            // given
            var scopeName = id.createUid(8),
                moduleName = 'test';

            // when
            // create the scope
            expect(typeof hilary.scope(scopeName)).to.equal('object');
            hilary.register({
                scope: scopeName,
                name: moduleName,
                factory: { foo: 'bar' }
            });

            // then
            expect(hilary.scope(scopeName)
                .context    // make sure it's on this specific scope
                .container  // by accessing it's container directly
                .resolve(moduleName)
                .factory
                .foo
            ).to.equal('bar');
        } // /registerWithExistingScope

        function registerWithUndefinedScope () {
            // given
            var scopeName = id.createUid(8),
                moduleName = 'test';

            // when
            hilary.register({
                scope: scopeName,
                name: moduleName,
                factory: { foo: 'bar' }
            });

            // then
            expect(hilary.scope(scopeName) // scope creation is implied
                .context    // make sure it's on this specific scope
                .container  // by accessing it's container directly
                .resolve(moduleName)
                .factory
                .foo
            ).to.equal('bar');
        } // /registerWithUndefinedScope

        function registerWithSameScope () {
            // given
            var scopeName = id.createUid(8),
                scope = hilary.scope(scopeName),
                moduleName = 'test';

            // when
            scope.register({
                scope: scopeName,
                name: moduleName,
                factory: { foo: 'bar' }
            });

            // then
            expect(scope
                .context    // make sure it's on this specific scope
                .container  // by accessing it's container directly
                .resolve(moduleName)
                .factory
                .foo
            ).to.equal('bar');
        } // /registerWithSameScope

        function registerWithOtherScope () {
            // given
            var scopeName1 = id.createUid(8),
                scope1 = hilary.scope(scopeName1),
                scopeName2 = id.createUid(8),
                scope2 = hilary.scope(scopeName2),
                moduleName = 'test';

            // when
            scope1.register({
                scope: scopeName2,
                name: moduleName,
                factory: { foo: 'bar' }
            });

            // then
            expect(scope1
                .context    // make sure it's on this specific scope
                .container  // by accessing it's container directly
                .resolve(moduleName)
                .factory
                .foo
            ).to.equal('bar');

            expect(scope2
                .context
                .container
                .resolve(moduleName)
            ).to.equal(undefined);
        } // /registerWithOtherScope

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
