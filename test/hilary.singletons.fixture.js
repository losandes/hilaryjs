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

            spec.describe('when a singleton is registered', function () {

                it('a copy of the original module should be registered as hilary::original::{name}', function () {
                    // given
                    var scope = new Hilary(),
                        sut;

                    scope.register({
                        name: 'sut2',
                        factory: function () {
                            return {
                                foo: true
                            };
                        }
                    });

                    scope.register({
                        name: 'sut',
                        singleton: true,
                        dependencies: ['sut2'],
                        factory: function (sut2) {
                            return {
                                foo: sut2.foo
                            };
                        }
                    });

                    // when
                    sut = scope.resolve('sut');

                    // then
                    // expect the module to be on the singletons object
                    expect(typeof scope.getContext().singletons.sut).to.equal('object');
                    // expect the original module prefixed with "hilary::original::" to be registered on the container
                    expect(scope.getContext().container['hilary::original::sut'].dependencies[0]).to.equal('sut2');
                    expect(scope.getContext().container['hilary::original::sut'].factory.length).to.equal(1);
                    // expect the module dependencies and factory to be replaced with new values
                    expect(scope.getContext().container.sut.dependencies).to.equal(undefined);
                    expect(scope.getContext().container.sut.factory.length).to.equal(0);
                }); // /it

            }); // /describe

        }); // /Hilary DI

    };
}((typeof module !== 'undefined' && module.exports) ? module.exports : window));
