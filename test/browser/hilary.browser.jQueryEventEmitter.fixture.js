/*jslint plusplus: true */
/*global require */
require(['describe', 'beforeEach', 'Hilary', 'it', 'expect', 'jQuery'], function (describe, beforeEach, Hilary, it, expect, $) {
    "use strict";
    
    var scope = new Hilary(),
        assert,
        whenRegistration,
        whenChildContainer;

    assert = function (sut, when, then, done) {
        $(document).on(sut, function (event, data) {
            expect(event.type).toBe(sut);
            then(data);
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
                var then = function (data) {
                    expect(data.scope).toBeDefined();
                    expect(data.moduleName).toBeDefined();
                    expect(data.moduleDefinition).toBeDefined();
                };
                
                assert('hilary::before::register', whenRegistration, then, done);
            });
            
            it('should trigger the hilary::after::register event on the DOM', function (done) {
                var then = function (data) {
                    expect(data.scope).toBeDefined();
                    expect(data.moduleName).toBeDefined();
                    expect(data.moduleDefinition).toBeDefined();
                };
                
                assert('hilary::after::register', whenRegistration, then, done);
            });
            
            it('should trigger the hilary::before::resolve event on the DOM', function (done) {
                var then = function (data) {
                    expect(data.scope).toBeDefined();
                    expect(data.moduleName).toBeDefined();
                };
                
                assert('hilary::before::resolve', whenRegistration, then, done);
            });
            
            it('should trigger the hilary::after::resolve event on the DOM', function (done) {
                var then = function (data) {
                    expect(data.scope).toBeDefined();
                    expect(data.moduleName).toBeDefined();
                    expect(data.result).toBeDefined();
                };
                
                assert('hilary::after::resolve', whenRegistration, then, done);
            });
            
            it('should trigger the hilary::before::new::child event on the DOM', function (done) {
                var then = function (data) {
                    expect(data.scope).toBeDefined();
                    expect(data.options).toBeDefined();
                };
                
                assert('hilary::before::new::child', whenChildContainer, then, done);
            });
            
            it('should trigger the hilary::after::new::child event on the DOM', function (done) {
                var then = function (data) {
                    expect(data.scope).toBeDefined();
                    expect(data.options).toBeDefined();
                    expect(data.child).toBeDefined();
                };
                
                assert('hilary::after::new::child', whenChildContainer, then, done);
            });
        });
    });
});
