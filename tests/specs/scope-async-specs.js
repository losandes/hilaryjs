(function (register) {
    'use strict';

    register({
        name: 'scope-async-specs',
        Spec: Spec
    });

    function Spec (hilary, expect, id) {
        return {
            'when a new scope is created (async),': {
                'it should execute the callback': namedScope
            }
        };

        function namedScope (done) {
            var name = id.createUid(8);

            // when
            hilary.scope(name, {}, function (err, scope) {
                // then
                expect(err).to.equal(null);
                expect(scope.context.scope).to.equal(name);
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
