/*jslint node: true*/
(function (exports) {
    'use strict';

    exports['hilary.singletons.fixture'] = function (Hilary, spec) {

        var expect = spec.expect,
            it = spec.it;

        spec.describe('Hilary Singletons', function () {

            spec.describe('when an object literal is registered as the factory', function () {

                it('should be treated as a singleton', function () {
                    // given
                    var scope = new Hilary(),
                        sut,
                        sut2;

                    scope.register({
                        name: 'sut',
                        singleton: true,
                        factory: {
                            state: 'on'
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

                }); // /it

            }); // /describe

            spec.describe('when a module is registered with a function that takes arguments but has not dependencies', function () {

                it('should be treated as a singleton', function () {
                    // given
                    var scope = new Hilary(),
                        expected = 'hello world!',
                        sut,
                        sut2;

                    scope.register({
                        name: 'sut',
                        dependencies: [],
                        factory: function (arg1) {
                            return {
                                state: arg1
                            };
                        }
                    });

                    // when
                    sut = scope.resolve('sut');
                    expect(sut.extension).to.equal(undefined);
                    sut.extension = expected;

                    // then
                    expect(typeof scope.getContext().singletons.sut).to.equal('function');
                    sut2 = scope.resolve('sut');
                    sut2.extension.should.equal(expected);

                }); // /it

            }); // /describe

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
                }); // /it

            }); // /describe

        }); // /Hilary DI

    };
}((typeof module !== 'undefined' && module.exports) ? module.exports : window));
