(function (register) {
    'use strict';

    register({
        name: 'exists-specs',
        Spec: Spec
    });

    function Spec (hilary, expect, id) {
        return {
            'when exists is called with an existing module name,': {
                'it should return true': existsTrue
            },
            'when exists is called with a module name that does NOT exist,': {
                'it should return false': existsFalse
            }
        };

        function existsTrue () {
            // given
            var scope = hilary.scope(id.createUid(8)),
                name = id.createUid(8),
                actual;

            scope.register({ name: name, factory: { foo: 'bar' }});

            // when
            actual = scope.exists(name);

            // then
            expect(actual).to.equal(true);
        }

        function existsFalse () {
            // given
            var scope = hilary.scope(id.createUid(8)),
                name = id.createUid(8),
                actual;

            // when
            actual = scope.exists(name);

            // then
            expect(actual).to.equal(false);
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
