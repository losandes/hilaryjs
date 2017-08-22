(function (register) {
    'use strict';

    register({
        name: 'register-resolve-error-specs',
        Spec: Spec
    });

    function Spec (hilary, expect, id) {
        return {
            'when attempting to register a module,': {
                'and the first argument is NOT an object or array': {
                    'it should return an exception': registerInvalidFirstArg
                },
                'and the registration is missing required properties': {
                    'it should return an exception': registrationMissingProperties
                }
            },
            'when attempting to resolve a module,': {
                'and the name is not a string': {
                    'it should return an exception': resolveWithInvalidName
                },
                'and the module is not found': {
                    'it should return an exception': resolveNotFound
                },
                'and the module\'s dependencies were not found': {
                    'it should return an exception': resolveMissingDependencies
                }
            },
            'when resolving a module that depends on a broken module': {
                'it should log an exception': resolveDependsOnBrokenModule
            },
            'when resolving a module that depends on a module that depends on a broken module': {
                'it should log an exception (1)': resolveDependsOnModuleThatDependsOnABrokenModule,
                'it should log an exception (2)': resolveDependsOnModuleThatDependsOnABrokenModule2
            }
        };

        function registerInvalidFirstArg () {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});

            // when
            var actual = scope.register(0);

            // then
            expect(actual.isException).to.equal(true);
            expect(actual.type).to.equal('InvalidArgument');
        }

        function registrationMissingProperties () {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});

            // when
            var actual = scope.register({});

            // then
            expect(actual.isException).to.equal(true);
            expect(actual.type).to.equal('InvalidRegistration');
        }

        function resolveWithInvalidName () {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});

            // when
            var actual = scope.resolve(0);

            // then
            expect(actual.isException).to.equal(true);
            expect(actual.type).to.equal('InvalidArgument');
        }

        function resolveNotFound () {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}});

            // when
            var actual = scope.resolve(id.createUid(8));

            // then
            expect(actual.isException).to.equal(true);
            expect(actual.type).to.equal('ModuleNotFound');
        }

        function resolveMissingDependencies () {
            // given
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}}),
                actual;

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
            actual = scope.resolve('regfunc4');

            // then
            expect(actual.isException).to.equal(true);
            expect(actual.type).to.equal('ModuleNotFound');
        }

        function resolveDependsOnBrokenModule () {
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}}),
                actual;

            scope.register({ name: 't1', factory: () => { return { foo: 'bar1' }; }});
            scope.register({ name: 't2', factory: () => { return { foo: 'bar2' }; }});
            scope.register({ name: 't3', factory: () => { throw new Error('BOOM!'); }});
            scope.register({ name: 't4', factory: () => { return { foo: 'bar4' }; }});
            scope.register({ name: 't5', factory: () => { return { foo: 'bar5' }; }});
            scope.register({ name: 'sut', factory: (t1, t2, t3, t4, t5) => {
                return {
                    t1: t1,
                    t2: t2,
                    t3: t3,
                    t4: t4,
                    t5: t5
                };
            }});

            // when
            actual = scope.resolve('sut');

            // then
            expect(actual.isException).to.equal(true);
            expect(actual.type).to.equal('ModuleNotResolved');
        }

        function resolveDependsOnModuleThatDependsOnABrokenModule () {
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}}),
                actual;

            scope.register({ name: 't1', factory: () => { return { foo: 'bar1' }; }});
            scope.register({ name: 't2', factory: () => { return { foo: 'bar2' }; }});
            scope.register({ name: 't3', factory: () => { throw new Error('BOOM!'); }});
            scope.register({ name: 't4', factory: () => { return { foo: 'bar4' }; }});
            scope.register({ name: 't5', factory: () => { return { foo: 'bar5' }; }});
            scope.register({ name: 't6', factory: (t1, t2, t3, t4, t5) => {
                return {
                    t1: t1,
                    t2: t2,
                    t3: t3,
                    t4: t4,
                    t5: t5
                };
            }});
            scope.register({ name: 'sut', factory: (t1, t6, t2, t3) => {
                return {
                    t1: t1,
                    t2: t2,
                    t3: t3,
                    t6: t6
                };
            }});

            // when
            actual = scope.resolve('sut');

            // then
            expect(actual.isException).to.equal(true);
            expect(actual.type).to.equal('ModuleNotResolved');
        }

        function resolveDependsOnModuleThatDependsOnABrokenModule2 () {
            var scope = hilary.scope(id.createUid(8), { logging: { log: function () {}}}),
                actual;

            scope.register({ name: 't1', factory: () => { return { foo: 'bar1' }; }});
            scope.register({ name: 't2', factory: () => { return { foo: 'bar2' }; }});
            scope.register({ name: 't3', factory: (t2) => { t2.bar(); /*should throw*/ }});
            scope.register({ name: 't4', factory: () => { return { foo: 'bar4' }; }});
            scope.register({ name: 't5', factory: () => { return { foo: 'bar5' }; }});
            scope.register({ name: 't6', factory: (t1, t2, t3, t4, t5) => {
                return {
                    t1: t1,
                    t2: t2,
                    t3: t3,
                    t4: t4,
                    t5: t5
                };
            }});
            scope.register({ name: 'sut', factory: (t1, t6, t2, t3) => {
                return {
                    t1: t1,
                    t2: t2,
                    t3: t3,
                    t6: t6
                };
            }});

            // when
            actual = scope.resolve('sut');

            // then
            expect(actual.isException).to.equal(true);
            expect(actual.type).to.equal('ModuleNotResolved');
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
