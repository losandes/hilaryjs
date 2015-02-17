/*jslint plusplus: true */
/*global require*/
require(['describe', 'beforeEach', 'Hilary', 'HilaryModule', 'it', 'expect'], function (describe, beforeEach, Hilary, HilaryModule, it, expect) {
    "use strict";

    describe("Hilary AMD Style Dependency Injection", function () {
        var container,
            registerTestModuleDefinitions,
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

        registerTestModuleDefinitions = function () {
            container.register(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });

            container.register(testModuleDefinitions.emptyToo.name, [testModuleDefinitions.empty.name], function (dep) {
                return {
                    depOut: dep,
                    thisOut: testModuleDefinitions.emptyToo.output
                };
            });
        };

        describe('hilary.amd.register, when registering modules', function () {
            it('should be able to define the module by name WITHOUT dependencies', function () {
                // when
                var sut = container.register(testModuleDefinitions.empty.name, function () {
                    return testModuleDefinitions.empty.output;
                });

                // then
                expect(sut).toBeDefined();
            });

            it('should be able to define the module by name WITH dependencies', function () {
                // when
                var sut = container.register(testModuleDefinitions.emptyToo.name, [testModuleDefinitions.empty.name], function (dep) {
                    return {
                        depOut: dep,
                        thisOut: testModuleDefinitions.emptyToo.output
                    };
                });

                // then
                expect(sut).toBeDefined();
            });

            it('should be able to define as a factory, anonymously', function (done) {
                container.register(function (require, exports) {
                    var actual,
                        expected = 'tada';

                    // given
                    exports.tada = expected;

                    // when
                    actual = require('tada');

                    // then
                    expect(actual).toBe(expected);

                    done();
                });
            });

            it('should be able to define as an object literal, anonymously', function (done) {
                var expected = 'anonymous literal';

                // given
                container.register({
                    anonLiteral: expected
                });

                // when
                container.resolve(['anonLiteral'], function (actual) {

                    // then
                    expect(actual).toBe(expected);
                    done();
                });
            });

            it('should be able to define as an object literal, by name', function (done) {
                var expected = 'anonymous literal';

                // given
                container.register('aLiteral', {
                    aLiteral: expected
                });

                // when
                container.resolve(['aLiteral'], function (actual) {

                    // then
                    expect(actual.aLiteral).toBe(expected);
                    done();
                });
            });
        }); // /define

        describe('hilary.amd.resolve, when requiring modules', function () {
            it('should be able to require an array of modules by name', function (done) {
                // given
                registerTestModuleDefinitions();

                // when
                container.resolve([testModuleDefinitions.emptyToo.name], function (result) {

                    // then
                    expect(result.depOut).toBe(testModuleDefinitions.empty.output);
                    expect(result.thisOut).toBe(testModuleDefinitions.emptyToo.output);

                    done();
                });
            });

            it('should be able to require single modules by name', function () {
                // given
                registerTestModuleDefinitions();

                // when
                var result = container.resolve(testModuleDefinitions.emptyToo.name);

                // then
                expect(result.depOut).toBe(testModuleDefinitions.empty.output);
                expect(result.thisOut).toBe(testModuleDefinitions.emptyToo.output);
            });

            // if the second argument of define is a factory that accepts arguments, but
            // there are no dependencies, then it should not be executed when being resolved
            // we assume it is a factory
            it('should be able to require factories by name', function (done) {
                var expected = 'hello world!';

                // given
                container.define('messenger', function (msg) {
                    return msg;
                });

                // when
                container.require(function (require, exports, module) {
                    var messenger = require('messenger');

                    // then
                    expect(messenger(expected)).toBe(expected);
                    done();
                });
            });

            it('should be able to require modules inline', function (done) {
                // given
                registerTestModuleDefinitions();

                container.resolve(function (require, exports, module) {
                    // when
                    var result = require(testModuleDefinitions.emptyToo.name);

                    // then
                    expect(result.depOut).toBe(testModuleDefinitions.empty.output);
                    expect(result.thisOut).toBe(testModuleDefinitions.emptyToo.output);

                    done();
                });
            });

            it('should grant the factory access to the inner container', function (done) {
                container.resolve(function (require, exports, module) {
                    var actual,
                        expected = 'lala';

                    // given
                    exports.lala = expected; // is the same as container.register('lala', function () { return epected; });

                    // when
                    actual = require('lala');

                    // then
                    expect(actual).toBe(expected);

                    done();
                });
            });
        }); // /require

    });
    
});
