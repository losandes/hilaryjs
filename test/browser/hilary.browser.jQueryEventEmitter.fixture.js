/*jslint plusplus: true */
window['hilary.browser.jQueryEventEmitter.fixture'] = function (Hilary, spec, $) {
    "use strict";

    var scope = new Hilary(),
        it = spec.it,
        expect = spec.expect,
        assert,
        whenRegistration,
        whenChildContainer;

    assert = function (sut, when, then) {
        $(document).one(sut, function (event, data) {
            expect(event.type).to.equal(sut);
            then(data);
        });

        when();
    };

    whenRegistration = function () {
        scope.register({
            name: 'foo',
            factory: function () { return 'hello world!'; }
        });
        scope.resolve('foo');
    };

    whenChildContainer = function () {
        scope.createChildContainer();
    };

    spec.describe("Hilary jQuery Event Emitter", function () {
        spec.describe('when events are fired', function () {
            it('should trigger the hilary::before::register event on the DOM', function (done) {
                var then = function (data) {
                    expect(data.scope).to.be.a('object');
                    expect(data.moduleInfo).to.be.a('object');
                    done();
                };

                assert('hilary::before::register', whenRegistration, then);
            });

            it('should trigger the hilary::after::register event on the DOM', function (done) {
                var then = function (data) {
                    expect(data.scope).to.be.a('object');
                    expect(data.moduleInfo).to.be.a('object');
                    done();
                };

                assert('hilary::after::register', whenRegistration, then);
            });

            it('should trigger the hilary::before::resolve event on the DOM', function (done) {
                var then = function (data) {
                    expect(data.scope).to.be.a('object');
                    expect(data.moduleName).to.be.a('string');
                    done();
                };

                assert('hilary::before::resolve', whenRegistration, then);
            });

            it('should trigger the hilary::after::resolve event on the DOM', function (done) {
                var then = function (data) {
                    expect(data.scope).to.be.a('object');
                    expect(data.name).to.be.a('string');
                    expect(data.result).to.be.a('string');
                    done();
                };

                assert('hilary::after::resolve', whenRegistration, then);
            });

            it('should trigger the hilary::before::new::child event on the DOM', function (done) {
                var then = function (data) {
                    expect(data.scope).to.be.a('object');
                    expect(data.options).to.be.a('object');
                    done();
                };

                assert('hilary::before::new::child', whenChildContainer, then);
            });

            it('should trigger the hilary::after::new::child event on the DOM', function (done) {
                var then = function (data) {
                    expect(data.scope).to.be.a('object');
                    expect(data.options).to.be.a('object');
                    expect(data.child).to.be.a('object');
                    done();
                };

                assert('hilary::after::new::child', whenChildContainer, then);
            });

            it('should trigger the hilary::error event on the DOM', function (done) {
                var then = function (data) {
                    expect(data.err).to.be.a('object');
                    done();
                };

                assert('hilary::error', function () {
                    try { scope.register({}); } catch (e) { }
                }, then);
            });
        });
    });
};
