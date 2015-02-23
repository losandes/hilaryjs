/*jslint plusplus: true */
/*global require*/
require(['describe', 'beforeEach', 'Hilary', 'it', 'expect'], function (describe, beforeEach, Hilary, it, expect) {
    "use strict";

    describe("Hilary Loader", function () {
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
});
