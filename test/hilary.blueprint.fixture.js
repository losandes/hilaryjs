/*jshint mocha: true, unused: false*/
/*globals describe, it*/
(function (exports) {
    'use strict';

    exports['hilary.blueprint.fixture'] = function (Hilary, spec) {
        // SETUP

        var scope = new Hilary(),
            should = spec.should,
            expect = spec.expect,
            it = spec.it,
            describe = spec.describe,
            id = scope.getContext().id,
            is = scope.getContext().is,
            Blueprint = Hilary.Blueprint;

        // /SETUP

        // SPEC
        describe('Hilary Blueprint', function () {
            var sutSetup;

            sutSetup = function () {
                var bp = new Hilary.Blueprint({
                    __blueprintId: 'bp',
                    num: 'number',
                    str: 'string',
                    arr: 'array',
                    currency: 'money',
                    bool: 'bool',
                    obj: 'object',
                    func: {
                        type: 'function',
                        args: ['arg1', 'arg2']
                    },
                    dec: {
                        type: 'decimal',
                        places: 2
                    }
                });

                return {
                    blueprint: bp
                };
            };

            describe('when a Blueprint is constructed and it has the __blueprintId property', function () {

                it('should maintain the value of the __blueprintId', function () {
                    // given
                    var uid = id.createUid(8),
                        sut;

                    // when
                    sut = new Blueprint({ __blueprintId: uid });

                    // then
                    expect(sut.__blueprintId).to.equal(uid);
                });

            });

            describe('when a Blueprint is constructed and it is missing the __blueprintId property', function () {

                it('should be given a 8 character unique identifier', function () {
                    // given
                    var sut;

                    // when
                    sut = new Blueprint({ foo: 'bar' });

                    // then
                    expect(is.string(sut.__blueprintId)).to.equal(true);
                    expect(sut.__blueprintId.length).to.equal(8);
                });

            });

            describe('when an object that implements a given Blueprint is passed as an argument to signatureMatches', function () {

                it('should pass true in as the second argument to the callback', function (done) {
                    // given
                    var sut = sutSetup(),
                        obj = {
                            num: 42,
                            str: 'string',
                            arr: [],
                            currency: '42.42',
                            bool: true,
                            obj: {
                                foo: 'bar'
                            },
                            func: function (arg1, arg2) {},
                            dec: 42.42
                        };

                    // when
                    sut.blueprint.signatureMatches(obj, function (err, result) {
                        // then
                        expect(result).to.equal(true);
                        done();
                    });

                });

                it('should pass true in as the second argument to the callback, even when there are additional properties', function (done) {
                    // given
                    var sut = sutSetup(),
                        obj = {
                            num: 42,
                            str: 'string',
                            arr: [],
                            currency: '42.42',
                            bool: true,
                            obj: {
                                foo: 'bar'
                            },
                            func: function (arg1, arg2) {},
                            dec: 42.42,
                            foo: 'foo',
                            bar: 'bar'
                        };

                    // when
                    sut.blueprint.signatureMatches(obj, function (err, result) {
                        // then
                        expect(result).to.equal(true);
                        done();
                    });

                });

            });

            describe('when an object that does not implement a given Blueprint is passed as an argument to signatureMatches', function () {

                it('should pass false in as the second argument to the callback', function (done) {
                    // given
                    var sut = sutSetup(),
                        obj = {};

                    // when
                    sut.blueprint.signatureMatches(obj, function (err, result) {
                        // then
                        expect(result).to.equal(false);
                        done();
                    });

                });

                it('should pass an array of errors in as the first argument to the callback', function (done) {
                    // given
                    var sut = sutSetup(),
                        obj = {};

                    // when
                    sut.blueprint.signatureMatches(obj, function (err, result) {
                        // then
                        expect(is.array(err)).to.equal(true);
                        expect(err.length).to.be.at.least(5);
                        done();
                    });

                });

                it('should pass an array of errors in as the first argument to the callback', function (done) {
                    // given
                    var sut = sutSetup(),
                        obj = {
                            num: 42,
                            str: 'string',
                            arr: [],
                            currency: '42.42',
                            bool: true,
                            obj: {
                                foo: 'bar'
                            },
                            dec: 42.42
                        };

                    // when
                    sut.blueprint.signatureMatches(obj, function (err, result) {
                        // then
                        expect(result).to.equal(false);

                        // there should be an error that a function is missing
                        // and another that it is missing arguments
                        // for a total of 2 errors
                        expect(err.length).to.equal(2);
                        done();
                    });

                });

            });

            describe('when a Blueprint property is an object and has a validate function', function () {

                it('should execute the validate function instead of using the built in validation', function (done) {
                    // given
                    var bp = new Blueprint({
                            prop: {
                                validate: function (implementationProperty, errorArray) {
                                    // then
                                    expect(implementationProperty).to.equal(42);
                                    done();
                                }
                            }
                        }),
                        implementation = {
                            prop: 42
                        };

                    // when
                    bp.signatureMatches(implementation, function (err, result) {
                        /*ingore: we're making sure the validate function was actually called*/
                    });
                });

                it('should allow the validate function to affect the signatureMatches result', function (done) {
                    // given
                    var errorMessage = 'error message',
                        bp = new Blueprint({
                            prop: {
                                validate: function (implementationProperty, errorArray) {
                                    // then
                                    errorArray.push(errorMessage);
                                }
                            }
                        }),
                        implementation = {
                            prop: 42
                        };

                    // when
                    bp.signatureMatches(implementation, function (err, result) {
                        expect(err[0]).to.equal(errorMessage);
                        done();
                    });
                });

            });

            describe('when the sync version of signatureMatches is used', function () {

                it('should behave synchronously, with the same information that is available in the async signatureMatches', function () {
                    // given
                    var sut = sutSetup(),
                        actual,
                        obj = {
                            num: 42,
                            str: 'string',
                            arr: [],
                            currency: '42.42',
                            bool: true,
                            obj: {
                                foo: 'bar'
                            },
                            func: function (arg1, arg2) {},
                            dec: 42.42
                        };

                    // when
                    actual = sut.blueprint.syncSignatureMatches(obj);

                    // then
                    expect(actual.result).to.equal(true);
                });

            });

            describe('when a blueprint inherits another blueprint', function () {

                it('should have the properties of both blueprints', function () {
                    // given
                    var bp1 = new Blueprint({
                            name: 'string'
                        }),
                        bp2 = new Blueprint({
                            description: 'string'
                        });

                    // when
                    bp2.inherits(bp1);

                    // then
                    expect(bp2.props.name).to.equal('string');
                    expect(bp2.props.description).to.equal('string');
                });

            });

            describe('when defining Blueprint functions', function () {

                it('The args property should be optional', function () {
                    // given
                    var bp1 = new Blueprint({
                            func: {
                                type: 'function'
                            }
                        }),
                        imp1 = {
                            func: function () {}
                        },
                        actual;

                    // when
                    actual = bp1.syncSignatureMatches(imp1);

                    // then
                    expect(actual.result).to.equal(true);
                });

                it('can be defined without an object literal', function () {
                    // given
                    var bp1 = new Blueprint({
                            func: 'function'
                        }),
                        imp1 = {
                            func: function () {}
                        },
                        actual;

                    // when
                    actual = bp1.syncSignatureMatches(imp1);

                    // then
                    expect(actual.result).to.equal(true);
                });

            });

            describe('when registering modules', function () {

                it('should be able to define the blueprint by name', function () {
                    // given
                    var moduleName = id.createUid(8),
                        expected = id.createUid(8),
                        factory;

                    factory = function () {
                        return expected;
                    };

                    // when
                    scope.register({
                        name: moduleName,
                        factory: factory,
                        blueprint: expected
                    });

                    // then
                    scope.getContext().container[moduleName].blueprint.should.equal(expected);
                });

                it('should be able to define the blueprint in an array', function () {
                    // given
                    var moduleName = id.createUid(8),
                        expected1 = id.createUid(8),
                        expected2 = id.createUid(8),
                        factory;

                    factory = function () {
                        return expected1;
                    };

                    // when
                    scope.register({
                        name: moduleName,
                        factory: factory,
                        blueprint: [expected1, expected2]
                    });

                    // then
                    scope.getContext().container[moduleName].blueprint[0].should.equal(expected1);
                    scope.getContext().container[moduleName].blueprint[1].should.equal(expected2);
                });

            }); // /registering

            spec.describe('when validating modules that are registered with blueprints', function () {

                it('should return a happy result if the modules implement the blueprint', function () {

                    // given
                    var scope = new Hilary(),
                        blueprintName = id.createUid(8),
                        moduleName = id.createUid(8),
                        actual;

                    // when
                    scope.register({
                        name: blueprintName,
                        factory: function () {
                            return sutSetup().blueprint;
                        },
                    });

                    scope.register({
                        name: moduleName,
                        factory: function () {
                            return {
                                num: 42,
                                str: 'string',
                                arr: [],
                                currency: '42.42',
                                bool: true,
                                obj: {
                                    foo: 'bar'
                                },
                                func: function (arg1, arg2) {},
                                dec: 42.42
                            };
                        },
                        blueprint: blueprintName
                    });

                    actual = scope.validateBlueprints();

                    // then
                    expect(actual.result).to.equal(true);

                });

                it('should return a happy result if the modules implement each blueprint in the array', function () {

                    // given
                    var scope = new Hilary(),
                        blueprintName1 = id.createUid(8),
                        blueprintName2 = id.createUid(8),
                        moduleName = id.createUid(8),
                        actual,
                        bp1 = new Blueprint({
                            name: 'string'
                        }),
                        bp2 = new Blueprint({
                            description: 'string'
                        });

                    // when
                    scope.register({
                        name: blueprintName1,
                        factory: function () {
                            return bp1;
                        },
                    });

                    scope.register({
                        name: blueprintName2,
                        factory: function () {
                            return bp2;
                        },
                    });

                    scope.register({
                        name: moduleName,
                        factory: function () {
                            return {
                                name: 'hello',
                                description: 'world'
                            };
                        },
                        blueprint: [blueprintName1, blueprintName2]
                    });

                    actual = scope.validateBlueprints();

                    // then
                    expect(actual.result).to.equal(true);

                });

                it('should return a sad result if the modules do NOT implement the blueprint', function () {

                    // given
                    var scope = new Hilary(),
                        blueprintName = id.createUid(8),
                        moduleName = id.createUid(8),
                        actual;

                    // when
                    scope.register({
                        name: blueprintName,
                        factory: function () {
                            return sutSetup().blueprint;
                        },
                    });

                    scope.register({
                        name: moduleName,
                        factory: function () {
                            return {
                                num: 42,
                                str: 'string',
                                arr: [],
                                currency: '42.42',
                                //bool: true,
                                obj: {
                                    foo: 'bar'
                                },
                                func: function (arg1, arg2) {},
                                dec: 42.42
                            };
                        },
                        blueprint: blueprintName
                    });

                    actual = scope.validateBlueprints();

                    // then
                    expect(actual.result).to.equal(false);
                    expect(actual.errors).to.not.equal(null);

                });

                it('should return a sad result if the modules do NOT implement each blueprint in the array', function () {

                    // given
                    var scope = new Hilary(),
                        blueprintName1 = id.createUid(8),
                        blueprintName2 = id.createUid(8),
                        moduleName = id.createUid(8),
                        actual,
                        bp1 = new Blueprint({
                            name: 'string'
                        }),
                        bp2 = new Blueprint({
                            description: 'string'
                        });

                    // when
                    scope.register({
                        name: blueprintName1,
                        factory: function () {
                            return bp1;
                        },
                    });

                    scope.register({
                        name: blueprintName2,
                        factory: function () {
                            return bp2;
                        },
                    });

                    scope.register({
                        name: moduleName,
                        factory: function () {
                            return {
                                name: 'hello',
                                //description: 'world'
                            };
                        },
                        blueprint: [blueprintName1, blueprintName2]
                    });

                    actual = scope.validateBlueprints();

                    // then
                    expect(actual.result).to.equal(false);
                    expect(actual.errors).to.not.equal(null);

                });

            }); // /validating

        }); // /SPEC
    };

}((typeof module !== 'undefined' && module.exports) ? module.exports : window));
