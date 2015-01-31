/*jslint plusplus: true */
/*global describe,beforeEach,Hilary,it,expect*/

describe("Hilary AMD", function () {
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

    describe('AMDContainer', function () {
        it('should exist in window', function () {
            expect(global.AMDContainer).toBeDefined();
        });
    });
    
    describe('define', function () {
        it('should exist in window', function () {
            expect(global.define).toBeDefined();
            expect(global.define.amd).toBeDefined();
        });
        
        it('should exist in new Hilary instances', function () {
            expect(container.define).toBeDefined();
            expect(container.define.amd).toBeDefined();
        });
    });
    
    describe('require', function () {
        it('should exist in window', function () {
            expect(global.require).toBeDefined();
        });
        
        it('should exist in new Hilary instances', function () {
            expect(container.require).toBeDefined();
        });
    });

    describe('define, when registering modules', function () {
        it('should be able to define the module by name WITHOUT dependencies', function () {
            var sut = global.define(testModuleDefinitions.empty.name, function () {
                return testModuleDefinitions.empty.output;
            });
            
            expect(sut).toBeDefined();
        });
        
        it('should be able to define the module by name WITH dependencies', function () {
            var sut = global.define(testModuleDefinitions.emptyToo.name, [testModuleDefinitions.empty.name], function (dep) {
                return {
                    depOut: dep,
                    thisOut: testModuleDefinitions.emptyToo.output
                };
            });
            
            expect(sut).toBeDefined();
        });
        
        it('should be able to define as a factory, anonymously', function (done) {
            global.define(function (require, exports) {
                var actual,
                    expected = 'tada';
                
                exports.tada = expected;
                actual = require('tada');
                
                expect(actual).toBe(expected);
                
                done();
            });
        });
        
        it('should be able to define as an object literal, anonymously', function (done) {
            var expected = 'anonymous literal';
            
            global.define({
                anonLiteral: expected
            });
            
            global.require(['anonLiteral'], function (actual) {
                expect(actual).toBe(expected);
                done();
            });
        });
        
        it('should be able to define as an object literal, by name', function (done) {
            var expected = 'anonymous literal';
            
            global.define('aLiteral', {
                aLiteral: expected
            });
            
            global.require(['aLiteral'], function (actual) {
                expect(actual.aLiteral).toBe(expected);
                done();
            });
        });
    }); // /define
    
    describe('require, when requiring modules', function () {
        it('should be able to require an array of modules by name', function (done) {
            global.require([testModuleDefinitions.emptyToo.name], function (result) {
                expect(result.depOut).toBe(testModuleDefinitions.empty.output);
                expect(result.thisOut).toBe(testModuleDefinitions.emptyToo.output);
                
                done();
            });
        });
        
        it('should be able to require single modules by name', function () {
            var result = global.require(testModuleDefinitions.emptyToo.name);
            
            expect(result.depOut).toBe(testModuleDefinitions.empty.output);
            expect(result.thisOut).toBe(testModuleDefinitions.emptyToo.output);
        });
        
        // if the second argument of define is a factory that accepts arguments, but 
        // there are no dependencies, then it should not be executed when being resolved
        // we assume it is a factory
        it('should be able to require factories by name', function (done) {
            var expected = 'hello world!';
            
            container.define('messenger', function (msg) {
                return msg;
            });

            container.require(function (require, exports, module) {
                var messenger = require('messenger');

                expect(messenger(expected)).toBe(expected);
                done();
            });
        });
        
        it('should be able to require modules inline', function (done) {
            global.require(function (require, exports, module) {
                var result = require(testModuleDefinitions.emptyToo.name);
                
                expect(result.depOut).toBe(testModuleDefinitions.empty.output);
                expect(result.thisOut).toBe(testModuleDefinitions.emptyToo.output);
                
                done();
            });
        });
        
        it('should grant the factory access to the inner container', function (done) {
            global.require(function (require, exports, module) {
                var actual,
                    expected = 'lala';
                
                exports.lala = expected;
                actual = require('lala');
                
                expect(actual).toBe(expected);
                
                done();
            });
        });
    }); // /require
});
