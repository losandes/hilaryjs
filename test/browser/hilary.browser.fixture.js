/*jslint plusplus: true */
/*global Hilary*/
window['hilary.browser.fixture'] = function () {
    "use strict";
    
    var browserScope = new Hilary();
    
    browserScope.resolveMany(['describe', 'beforeEach', 'Hilary', 'it', 'spec'], function (describe, beforeEach, Hilary, it, spec) {
        
        var expect = spec.expect;
        
        describe("Hilary", function () {

            describe('Global Hilary', function () {
                it('should exist in window', function () {
                    expect(window.Hilary).to.not.equal(undefined);
                    expect(window.Hilary.extend).to.be.a('function');
                });
            });

        });
    });
};
