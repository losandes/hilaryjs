(function (register) {
    'use strict';

    register({
        name: 'register-resolve-members-specs',
        Spec: Spec
    });

    function Spec (hilary, expect, id) {
        return {
            'when a module is resolved with a single member declaration (i.e. `polyn { is }`)': {
                'it should return the value of that member': resolveSingleMember
            },
            'when a module depends on another module': {
                'and uses a single member declaration (i.e. `polyn { is }`)': {
                    'it should just pass the declared member to the factory': dependOnSingleMember
                },
                'and uses a multiple member declaration (i.e. `polyn { is, Immutable }`)': {
                    'it should just pass the declared members to the factory': dependOnMultipleMembers
                },
                'and uses aliases in the member declaration (i.e. `polyn { is as test, Immutable }`)': {
                    'it should use the aliases as the member names that are passed to the factory': dependOnAliases
                },
            },
            'when a module is resolved with a multiple member declaration (i.e. `polyn { is, Immutable }`)': {
                'it should only return the desired members': resolveMultipleMembers
            },
            'when a module uses aliases in the member declaration (i.e. `polyn { is as test, Immutable }`)': {
                'it should only return the aslases of the desired members': resolveAliases
            },
            'when a module is resolved with a member declaration': {
                'the reduction should be stored as a singleton': isRegisteredAsSingleton
            }
        };

        function resolveSingleMember () {
            // given
            var scope = hilary.scope(id.createUid(8));

            scope.register({
                name: 'something',
                factory: {
                    foo: 'bar'
                }
            });

            // when
            var actual = scope.resolve('something { foo }');

            // then
            expect(actual.isException).to.equal(undefined);
            expect(actual).to.equal('bar');
        }

        function dependOnSingleMember () {
            // given
            var scope = hilary.scope(id.createUid(8));

            scope.register({
                name: 'something',
                factory: {
                    foo: 'bar'
                }
            });

            scope.register({
                name: 'dependOnMember',
                dependencies: ['something { foo }'],
                factory: function (foo) {
                    return {
                        value: foo
                    };
                }
            });

            // when
            var actual = scope.resolve('dependOnMember');

            // then
            expect(actual.isException).to.equal(undefined);
            expect(actual.value).to.equal('bar');
        }

        function resolveMultipleMembers () {
            // given
            var scope = hilary.scope(id.createUid(8));

            scope.register({
                name: 'something',
                factory: {
                    foo: 'bar',
                    baz: 'fizz',
                    raz: 'amataz'
                }
            });

            // when
            var actual = scope.resolve('something { foo, baz }');

            // then
            expect(actual.isException).to.equal(undefined);
            expect(actual.foo).to.equal('bar');
            expect(actual.baz).to.equal('fizz');
            expect(actual.raz).to.equal(undefined);
        }

        function resolveAliases () {
            // given
            var scope = hilary.scope(id.createUid(8));

            scope.register({
                name: 'something',
                factory: {
                    foo: 'bar',
                    baz: 'fizz',
                    raz: 'amataz'
                }
            });

            // when
            var actual = scope.resolve('something { foo as one, baz as two}');

            // then
            expect(actual.isException).to.equal(undefined);
            expect(actual.one).to.equal('bar');
            expect(actual.two).to.equal('fizz');
            expect(actual.raz).to.equal(undefined);
        }

        function dependOnMultipleMembers () {
            // given
            var scope = hilary.scope(id.createUid(8));

            scope.register({
                name: 'something',
                factory: {
                    foo: 'bar',
                    baz: 'fizz',
                    raz: 'amataz'
                }
            });

            scope.register({
                name: 'dependOnMember',
                dependencies: ['something { foo, baz }'],
                factory: function (foo) {
                    return {
                        value: foo
                    };
                }
            });

            // when
            var actual = scope.resolve('dependOnMember');

            // then
            expect(actual.isException).to.equal(undefined);
            expect(actual.value.foo).to.equal('bar');
            expect(actual.value.baz).to.equal('fizz');
            expect(actual.value.raz).to.equal(undefined);
        }

        function dependOnAliases () {
            // given
            var scope = hilary.scope(id.createUid(8));

            scope.register({
                name: 'something',
                factory: {
                    foo: 'bar',
                    baz: 'fizz',
                    raz: 'amataz'
                }
            });

            scope.register({
                name: 'dependOnMember',
                dependencies: ['something { foo, baz as bar }'],
                factory: function (foo) {
                    return {
                        value: foo
                    };
                }
            });

            // when
            var actual = scope.resolve('dependOnMember');

            // then
            expect(actual.isException).to.equal(undefined);
            expect(actual.value.foo).to.equal('bar');
            expect(actual.value.bar).to.equal('fizz');
            expect(actual.value.raz).to.equal(undefined);
        }

        function isRegisteredAsSingleton () {
            // given
            var scope = hilary.scope(id.createUid(8));

            scope.register({
                name: 'something',
                factory: {
                    foo: 'bar'
                }
            });

            // when
            var actual = scope.resolve('something { foo }');

            // then
            expect(actual.isException).to.equal(undefined);
            expect(scope.context.singletonContainer.exists('something { foo }'))
                .to.equal(true);
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
