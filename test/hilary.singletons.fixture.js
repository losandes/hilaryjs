/*jslint node: true*/
(function (exports) {
    'use strict';

    exports['hilary.singletons.fixture'] = function (Hilary, spec) {

        var expect = spec.expect,
            should = spec.should,
            it = spec.it;

        spec.describe('Hilary Singletons', function () {

            spec.describe('when a module is registered as a singleton', function () {
                it('should always resolve the single instance', function () {
                    // given
                    var scope = new Hilary(),
                        sut,
                        sut2;

                    scope.register({
                        name: 'sutCtor',
                        factory: function () {
                            return {
                                state: 'on'
                            };
                        }
                    });

                    scope.register({
                        name: 'sut',
                        factory: scope.resolve('sutCtor')
                    });

                    // when
                    sut = scope.resolve('sut');
                    sut.state.should.equal('on');
                    sut.state = 'off';

                    // then
                    sut2 = scope.resolve('sut');
                    sut2.state.should.equal('off');
                });
            });

            spec.describe('when a module is registered using the singleton flag', function () {
                it('should always resolve the single instance', function () {
                    // given
                    var scope = new Hilary(),
                        sut,
                        sut2;

                    scope.register({
                        name: 'sut',
                        singleton: true,
                        factory: function () {
                            return {
                                state: 'on'
                            };
                        }
                    });

                    // when
                    sut = scope.resolve('sut');
                    sut.state.should.equal('on');
                    sut.state = 'off';

                    // then
                    expect(typeof scope.getContext().singletons.sut).to.equal('object');
                    sut2 = scope.resolve('sut');
                    sut2.state.should.equal('off');
                });
            });

        }); // /Hilary DI

    };
}((typeof module !== 'undefined' && module.exports) ? module.exports : window));
