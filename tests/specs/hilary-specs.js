(function (register) {
    'use strict';

    register({
        name: 'hilary-specs',
        Spec: Spec
    });

    function Spec (hilary, expect, id) {
        return {
            'when hilary is used without a scope,': {
                'it should demonstrate the same API as a scope': defaultScope,
                'it should have some default registrations': defaultRegistrations
            },
            'when a new scope is created,': {
                'it should return an instance of hilary': newScope
            }
        };

        function defaultScope () {
            expectObjectToMeetHilaryApi(hilary);
        }

        function newScope () {
            expectObjectToMeetHilaryApi(hilary.scope());
        }

        function defaultRegistrations () {
            // given
            var ASYNC = 'polyn::async',
                CONTEXT = 'hilary::context',
                IMMUTABLE = 'polyn::Immutable',
                IS = 'polyn::is',
                //
                name = id.createUid(8),
                registration = hilary.register({
                    name: name,
                    dependencies: [ASYNC, CONTEXT, IMMUTABLE, IS],
                    factory: function (async, context, Immutable, is) {
                        return {
                            async: async,
                            context: context,
                            Immutable: Immutable,
                            is: is
                        };
                    }
                }),
                actual;

            // when
            // jshint -W030
            expect(registration.isException).to.be.undefined;
            // jshint +W030
            actual = hilary.resolve(name);

            // then
            expect(typeof actual.async).to.equal('object');
            expect(typeof actual.context).to.equal('function');
            expect(typeof actual.Immutable).to.equal('function');
            expect(typeof actual.is).to.equal('object');
        }

        function expectObjectToMeetHilaryApi (scope) {
            expect(typeof scope).to.equal('object');
            expect(scope.__isHilaryScope).to.equal(true);
            expect(typeof scope.context).to.equal('object');
            expect(typeof scope.register).to.equal('function');
            expect(typeof scope.resolve).to.equal('function');
            expect(typeof scope.exists).to.equal('function');
            expect(typeof scope.dispose).to.equal('function');
            expect(typeof scope.bootstrap).to.equal('function');
            expect(typeof scope.scope).to.equal('function');
            expect(typeof scope.setParentScope).to.equal('function');
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
