/*jslint node: true*/
(function (exports) {
    "use strict";
    
    exports['hilary.fixture'] = function (Hilary, spec, generateId, makeMockData) {

        // SETUP

        var scope = new Hilary(),
            should = spec.should,
            expect = spec.expect,
            it = spec.it;

        // /SETUP

        // SPEC
        spec.describe('Hilary Context', function () {
            it('should be open for extension, but closed for modification', function () {
                // given
                var moduleName = generateId(),
                    expected = generateId(),
                    factory,
                    next;

                factory = function () {
                    return expected;
                };

                // when
                scope.register({
                    name: moduleName,
                    factory: factory
                });

                // then
                scope.getContext().container = {};
                scope.getContext().container[moduleName].should.not.equal(undefined);
            });
        });

    };
    
    
}((typeof module !== 'undefined' && module.exports) ? module.exports : window));
