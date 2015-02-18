/*jslint plusplus: true */
/*global require */
require(['describe', 'beforeEach', 'Hilary', 'it', 'expect', 'jQuery'], function (describe, beforeEach, Hilary, it, expect, $) {
    "use strict";
    
    var scope = new Hilary(),
        assert,
        whenRegistration,
        whenChildContainer;

    assert = function (sut, when, done) {
        $(document).on(sut, function (event) {
            expect(event.type).toBe(sut);
            done();
        });

        when();
    };
    
    whenRegistration = function () {
        scope.register('foo', function () { return 'hello world!'; });
        scope.resolve('foo');
    };

    whenChildContainer = function () {
        scope.createChildContainer();
    };

    describe("Hilary jQuery Event Emitter", function () {
        describe('when events are fired', function () {
            it('should trigger the hilary::before::register event on the DOM', function (done) {
                assert('hilary::before::register', whenRegistration, done);
            });
            
            it('should trigger the hilary::after::register event on the DOM', function (done) {
                assert('hilary::after::register', whenRegistration, done);
            });
            
            it('should trigger the hilary::before::resolve event on the DOM', function (done) {
                assert('hilary::before::resolve', whenRegistration, done);
            });
            
            it('should trigger the hilary::after::resolve event on the DOM', function (done) {
                assert('hilary::after::resolve', whenRegistration, done);
            });
            
            it('should trigger the hilary::before::new::child event on the DOM', function (done) {
                assert('hilary::before::new::child', whenChildContainer, done);
            });
            
            it('should trigger the hilary::after::new::child event on the DOM', function (done) {
                assert('hilary::after::new::child', whenChildContainer, done);
            });
        });
    });
});
