/*globals require*/

window['hilary.browser.amd.fixture'] = function () {
    "use strict";
    
    require(['window', 'Hilary', 'spec', 'makeMockData', 'createGuid'], function (global, Hilary, spec, makeMockData, generateId) {
    
        var scope = new Hilary(),
            it = spec.it,
            expect = spec.expect,
            testModules = makeMockData(scope, generateId);

        spec.describe("Hilary AMD Extensions", function () {

            spec.describe('AMDContainer', function () {
                it('should exist in window', function () {
                    expect(global.AMDContainer).to.be.a('object');
                });
            });

            spec.describe('define', function () {
                it('should exist in window', function () {
                    expect(global.define).to.be.a('function');
                    expect(global.define.amd).to.be.a('object');
                });
    
                it('should exist in new Hilary instances', function () {
                    expect(new Hilary().define).to.be.a('function');
                });
            });

            spec.describe('require', function () {
                it('should exist in window', function () {
                    expect(global.require).to.be.a('function');
                });
    
                it('should exist in new Hilary instances', function () {
                    expect(new Hilary().require).to.be.a('function');
                });
            });

            spec.describe('define, when registering modules', function () {
                it('should be able to define the module by name WITHOUT dependencies', function () {
                    // when
                    global.define(testModules.module1.name, testModules.module1.moduleDefinition.factory);
                    
                    // then
                    var actual = global.require(testModules.module1.name);
                    expect(actual).to.equal(testModules.module1.expected);
                });
    
                it('should be able to define the module by name WITH dependencies', function () {
                    global.define(testModules.module2.name, testModules.module2.moduleDefinition.dependencies, testModules.module2.moduleDefinition.factory);

                    var actual = global.require(testModules.module2.name);
                    expect(actual.thisOut).to.equal(testModules.module2.expected);
                });

                it('should be able to define as a factory, anonymously', function (done) {
                    global.define(function (require, exports) {
                        var actual,
                            expected = 'tada';
                        
                        exports.tada = {
                            factory: function () {
                                return expected;
                            }
                        };
                        actual = require(expected);

                        expect(actual).to.equal(expected);

                        done();
                    });
                });

                it('should be able to define as an object literal, anonymously', function (done) {
                    var expected = 'anonymous literal';

                    global.define({
                        anonLiteral: expected
                    });

                    global.require(['anonLiteral'], function (actual) {
                        expect(actual).to.equal(expected);
                        done();
                    });
                });

                it('should be able to define as an object literal, by name', function (done) {
                    var expected = 'anonymous literal';

                    global.define('aLiteral', {
                        aLiteral: expected
                    });

                    global.require(['aLiteral'], function (actual) {
                        expect(actual.aLiteral).to.equal(expected);
                        done();
                    });
                });
            }); // /define

            spec.describe('require, when requiring modules', function () {
                it('should be able to require an array of modules by name', function (done) {
                    global.require([testModules.module1.name], function (actual) {
                        expect(actual).to.equal(testModules.module1.expected);
                        done();
                    });
                });
    
                it('should be able to require single modules by name', function () {
                    var actual = global.require(testModules.module2.name);
                    expect(actual.thisOut).to.equal(testModules.module2.expected);
                });

                // if the second argument of define is a factory that accepts arguments, but
                // there are no dependencies, then it should not be executed when being resolved
                // we assume it is a factory
                it('should be able to require factories by name', function (done) {
                    var expected = 'hello world!',
                        specScope = new Hilary();

                    specScope.define('messenger', function (msg) {
                        return msg;
                    });

                    specScope.require(function (require, exports, module) {
                        var messenger = require('messenger');

                        expect(messenger(expected)).to.equal(expected);
                        done();
                    });
                });

                it('should be able to require modules inline', function (done) {
                    global.require(function (require, exports, module) {
                        var actual = require(testModules.module2.name);
                        expect(actual.thisOut).to.equal(testModules.module2.expected);

                        done();
                    });
                });

                it('should grant the factory access to the inner container', function (done) {
                    global.require(function (require, exports, module) {
                        var actual,
                            expected = 'lala';
                        
                        exports.lala = {
                            factory: function () {
                                return expected;
                            }
                        };
                        actual = require(expected);

                        expect(actual).to.equal(expected);

                        done();
                    });
                });
                
            }); // /require
            
        }); // /describe AMD
    }); // /require
}; // /window

