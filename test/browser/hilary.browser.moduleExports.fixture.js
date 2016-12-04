window['hilary.browser.moduleExports.fixture'] = function (Hilary, spec, generateId) {
    'use strict';

    var scope = 'module-exports',
        it = spec.it,
        expect = spec.expect;

    spec.describe('Hilary module.exports compatibility', function () {

        spec.describe('it should exist on window', function () {
            expect(typeof window.module).to.equal('object');
        });

        spec.describe('when an module.exports is set', function () {

            it('should register the module on Hilary', function () {
                // given
                var expectedName = generateId(),
                    expectedVal = generateId();

                // when
                window.module.exports = {
                    scope: scope,
                    name: expectedName,
                    factory: function () {
                        return expectedVal;
                    }
                };

                var actual = Hilary.scope(scope).resolve(expectedName);

                // then
                expect(actual).to.equal(expectedVal);
            });

            it('should register the module on a default scope, if a scope is not provided', function () {
                // given
                var expectedName = generateId(),
                    expectedVal = generateId();

                // when
                window.module.exports = {
                    name: expectedName,
                    factory: function () {
                        return expectedVal;
                    }
                };

                var actual = Hilary.scope('default').resolve(expectedName);

                // then
                expect(actual).to.equal(expectedVal);
            });

        });

    }); // /describe module.exports
};
