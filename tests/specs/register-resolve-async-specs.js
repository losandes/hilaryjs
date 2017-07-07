(function (register) {
    'use strict';

    register({
        name: 'register-resolve-async-specs',
        Spec: Spec
    });

    function Spec (hilary, expect) {
        return {
            '(async) when an object literal is registered as a factory,': {
                'it should be resolvable': registerObjectLiteralAsync
            }
        };

        function registerObjectLiteralAsync (done) {
            // given
            var expected = {
                name: 'testobj',
                factory: { foo: 'bar' }
            };

            // when
            hilary.register(expected, function (err, registration) {
                // then
                expect(err).to.equal(null);
                expect(registration.isException).to.equal(undefined);

                hilary.resolve(expected.name, function (err, actual) {
                    expect(actual.foo).to.equal('bar');
                    done();
                });
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
