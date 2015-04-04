/*globals module*/
(function (exports) {
    "use strict";
    
    exports['hilary.di.autowire.fixture'] = function (Hilary, spec, autowire) {
    
        var scope = new Hilary(),
            should = spec.should,
            it = spec.it;

        spec.describe('Hilary Autowire', function () {

            spec.describe('when a module with a factory thas has arguments is registered without dependencies', function () {
                it('should autowire the dependencies', function () {
                    // given
                    var specScope = new Hilary(),
                        sut;

                    specScope.register({
                        name: 'sut1',
                        factory: function () {
                            return {
                                state: 'on'
                            };
                        }
                    });
                    
                    specScope.register({
                        name: 'sut2',
                        factory: function () {
                            return {
                                state: 'off'
                            };
                        }
                    });

                    specScope.register({
                        name: 'sut3',
                        factory: function (sut1, sut2) {
                            return {
                                sut1: sut1,
                                sut2: sut2
                            };
                        }
                    });

                    // when
                    sut = specScope.resolve('sut3');
                    
                    // then
                    sut.sut1.state.should.equal('on');
                    sut.sut2.state.should.equal('off');
                });
            });

        }); // /Hilary DI

    };
    
}((typeof module !== 'undefined' && module.exports) ? module.exports : window));
