/*jslint plusplus: true */
/*global describe,beforeEach,Hilary,it,expect*/

describe("Hilary Loader", function () {
    "use strict";
    
    var container,
        global = window,
        testModuleDefinitions = {
            empty: {
                name: 'foo',
                output: 'registered foo!'
            },
            emptyToo: {
                name: 'bar',
                output: 'registered bar!'
            }
        };

    beforeEach(function () {
        container = new Hilary();
    });

    describe('baseUrl', function () {
        it('should exist in Hilary instances', function () {
            expect(container.baseUrl).toBe('/scripts/');
        });
    });
});
