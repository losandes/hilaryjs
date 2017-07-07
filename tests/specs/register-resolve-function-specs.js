(function (register) {
    'use strict';

    register({
        name: 'register-resolve-function-specs',
        Spec: Spec
    });

    function Spec (hilary, expect, id) {
        return {
            'when a factory function with no dependencies or arguments is resolved,': {
                'hilary should execute the constructor': executesConstructor
            },
            'when a factory function with dependencies is resolved,': {
                'hilary should recursively resolve modules': resolveClassDependencies
            },
            'when factory functions are registered with undeclared dependencies,': {
                'hilary should generate and resolve the dependencies': generateDependencies
            },
            'when a factory function is registered with dependencies,': {
                'and there are a different number of factory arguments': {
                    'hilary should return an Exception': dependencyArgMismatch
                },
                'that are neither false, nor an array': {
                    'hilary should return an Exception': invalidDependencies
                },
                'that are empty, and the factory takes arguments': {
                    'hilary should return the factory without executing it': factoryArgsWithEmptyDependencies
                },
                'that are FALSE, and the factory takes arguments': {
                    'hilary should return the factory without executing it': factoryArgsWithFalseDependencies
                }
            }
        };

        function executesConstructor () {
            var scope = hilary.scope(id.createUid(8)),
                registration1;

            // when
            registration1 = scope.register({
                name: 'regfunc1',
                factory: function () {
                    this.hello = 'world';
                }
            });

            expect(registration1.isException).to.equal(undefined);
            expect(scope.resolve('regfunc1').hello).to.equal('world');
        }

        function resolveClassDependencies () {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { level: 'info' } }),
                actual;

            scope.register({
                name: 'regfunc1',
                factory: function () {
                    this.foo = 'bar';
                }
            });

            scope.register({
                name: 'regfunc2',
                dependencies: ['regfunc1'],
                factory: function (f1) {
                    this.f1 = f1;
                    this.hello = 'world';
                }
            });

            scope.register({
                name: 'regfunc3',
                dependencies: ['regfunc1', 'regfunc2'],
                factory: function (f1, f2) {
                    this.f1 = f1;
                    this.f2 = f2;
                    this.chaka = 'khan';
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
            actual = scope.resolve('regfunc4');

            // then
            expect(actual.f1.foo).to.equal('bar');
            expect(actual.f2.hello).to.equal('world');
            expect(actual.f3.chaka).to.equal('khan');
            expect(actual.f2.f1.foo).to.equal('bar');
            expect(actual.f3.f1.foo).to.equal('bar');
            expect(actual.f3.f2.hello).to.equal('world');
        }

        function generateDependencies () {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { level: 'info' } }),
                registration1,
                registration2;

            // when
            registration1 = scope.register({
                name: 'regfunc1',
                factory: function () {
                    this.foo = 'bar';
                }
            });

            registration2 = scope.register({
                name: 'regfunc2',
                factory: function (regfunc1) {
                    this.f1 = regfunc1;
                    this.hello = 'world';
                }
            });

            // then
            expect(registration1.isException).to.equal(undefined);
            expect(registration2.isException).to.equal(undefined);
            expect(scope.resolve('regfunc2').f1.foo).to.equal('bar');
        }

        function dependencyArgMismatch () {
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});
            expect(scope.register({
                name: 'testdepmismatch',
                dependencies: ['arg1', 'arg2'],
                /* jshint -W098 */
                factory: function (arg1) {}
                /* jshint +W098 */
            }).isException).to.equal(true);
        }

        function invalidDependencies () {
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});
            expect(scope.register({
                name: 'testdepmismatch',
                dependencies: 'foobar',
                /* jshint -W098 */
                factory: function (arg1) {}
                /* jshint +W098 */
            }).isException).to.equal(true);
        }

        function factoryArgsWithEmptyDependencies () {
            // given
            var scope = hilary.scope(id.createUid(8)),
                Actual,
                actual;

            scope.register({
                name: 'regfunc1',
                dependencies: [],
                factory: function (arg1) {
                    this.val = arg1;
                }
            });

            // when
            Actual = new scope.resolve('regfunc1');
            actual = new Actual('world');

            // then
            expect(actual.val).to.equal('world');
        }

        function factoryArgsWithFalseDependencies () {
            // given
            var scope = hilary.scope(id.createUid(8)),
                Actual,
                actual;

            scope.register({
                name: 'regfunc1',
                dependencies: false,
                factory: function (arg1) {
                    this.val = arg1;
                }
            });

            // when
            Actual = new scope.resolve('regfunc1');
            actual = new Actual('world');

            // then
            expect(actual.val).to.equal('world');
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
