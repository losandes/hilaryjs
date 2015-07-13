/*jshint mocha: true*/
(function (exports) {
    'use strict';
    
    exports['hilary.is.fixture'] = function (Hilary, spec) {
        // SETUP

        var scope = new Hilary(),
            expect = spec.expect,
            it = spec.it,
            describe = spec.describe,
            is = scope.getContext().is;
        
        describe('is, ', function () {

        //{
        //    getType: undefined,
        //    defined: undefined,
        //    function: undefined,
        //    object: undefined,
        //    array: undefined,
        //    string: undefined,
        //    boolean: undefined,
        //    datetime: undefined,
        //    number: undefined,
        //    nullOrWhitespace: undefined,
        //    money: undefined,
        //    decimal: undefined,
        //    not: {
        //        defined: undefined,
        //        function: undefined,
        //        object: undefined,
        //        array: undefined,
        //        string: undefined,
        //        boolean: undefined,
        //        datetime: undefined,
        //        number: undefined,
        //        nullOrWhitespace: undefined,
        //        money: undefined,
        //        decimal: undefined
        //    }
        //}

            describe('when getType is called', function () {

                it('should return a string the describes the type of object value represents', function () {
                    // given
                    var sut = 42,
                        expected = 'number',
                        actual;

                    // when
                    actual = is.getType(sut);

                    // then
                    expect(actual).to.equal(expected);
                });

            });

            describe('when checking is.defined', function () {

                it('should return false if the object is undefined, but true if it is null', function () {
                    // given
                    var nullActual,
                        undefinedActual;

                    // when
                    nullActual = is.defined(null);
                    undefinedActual = is.defined(undefined);

                    // then
                    expect(nullActual).to.equal(true);
                    expect(undefinedActual).to.equal(false);
                });

                it('should return true if the object is NOT null or undefined', function () {
                    // given
                    var actual;

                    // when
                    actual = is.defined(42);

                    // then
                    expect(actual).to.equal(actual);
                });

                it('should have a "not" prefix that reverses the results', function () {
                    // given
                    var definedActual,
                        undefinedActual;

                    // when
                    definedActual = is.not.defined(42);
                    undefinedActual = is.not.defined(undefined);

                    // then
                    expect(definedActual).to.equal(false);
                    expect(undefinedActual).to.equal(true);
                });

            });

            describe('when checking is.nullOrUndefined', function () {

                it('should return true if the object is null or undefined', function () {
                    // given
                    var nullActual,
                        undefinedActual;

                    // when
                    nullActual = is.nullOrUndefined(null);
                    undefinedActual = is.nullOrUndefined(undefined);

                    // then
                    expect(nullActual).to.equal(true);
                    expect(undefinedActual).to.equal(true);
                });

                it('should return true if the object is NOT null or undefined', function () {
                    // given
                    var actual;

                    // when
                    actual = is.nullOrUndefined(42);

                    // then
                    expect(actual).to.equal(false);
                });

            });

            describe('when checking is.nullOrWhitespace', function () {

                it('should return true if the object is null or only has whitespace', function () {
                    // given
                    var actuals = [],
                        i;

                    // when
                    actuals.push(is.nullOrWhitespace(null));
                    actuals.push(is.nullOrWhitespace(undefined));
                    actuals.push(is.nullOrWhitespace(''));
                    actuals.push(is.nullOrWhitespace(' '));
                    actuals.push(is.nullOrWhitespace('  '));

                    // then
                    for (i = 0; i < actuals.length; i += 1) {
                        expect(actuals[i]).to.equal(true);
                    }
                });

                it('should return false if the object is NOT null or if it has characters', function () {
                    // given
                    var actuals = [],
                        i;

                    // when
                    actuals.push(is.nullOrWhitespace('null'));
                    actuals.push(is.nullOrWhitespace(' null '));
                    actuals.push(is.nullOrWhitespace('  null    '));

                    // then
                    for (i = 0; i < actuals.length; i += 1) {
                        expect(actuals[i]).to.equal(false);
                    }
                });

            });

            describe('when checking is.function', function () {

                it('should return true if the object is a function', function () {
                    // given
                    var func = function () {},
                        actual;

                    // when
                    actual = is.function(func);

                    // then
                    expect(actual).to.equal(true);
                });

                it('should return false if the object is NOT a function', function () {
                    // given
                    var func = 42,
                        actual;

                    // when
                    actual = is.function(func);

                    // then
                    expect(actual).to.equal(false);
                });

                it('should have a "not" prefix that reverses the results', function () {
                    // given
                    var func = function () {},
                        notFunc = 42,
                        actualFunc,
                        actualNoFunc;

                    // when
                    actualFunc = is.not.function(func);
                    actualNoFunc = is.not.function(notFunc);

                    // then
                    expect(actualFunc).to.equal(false);
                    expect(actualNoFunc).to.equal(true);
                });

            });

            describe('when checking is.object', function () {

                it('should return true if the object is an object', function () {
                    // given
                    var actual = [],
                        i;

                    // when
                    actual.push(is.object({}));
                    actual.push(is.object({ foo: 'bar'}));
                    actual.push(is.object({ "foo": "bar" }));


                    // then
                    for (i = 0; i < actual.length; i += 1) {
                        expect(actual[i]).to.equal(true);
                    }
                });

                it('should return false if the object is NOT an object', function () {
                    // given
                    var actual = [],
                        i;

                    // when
                    actual.push(is.object(function () {}));
                    actual.push(is.object(42));
                    actual.push(is.object('object'));
                    actual.push(is.object([]));

                    // then
                    for (i = 0; i < actual.length; i += 1) {
                        expect(actual[i]).to.equal(false);
                    }
                });

                it('should have a "not" prefix that reverses the results', function () {
                    // given
                    var actualObj = [],
                        actualNotObj = [],
                        i;

                    // when
                    actualObj.push(is.not.object({}));
                    actualObj.push(is.not.object({ foo: 'bar'}));
                    actualObj.push(is.not.object({ "foo": "bar"}));

                    actualNotObj.push(is.not.object(function () {}));
                    actualNotObj.push(is.not.object(42));
                    actualNotObj.push(is.not.object('object'));
                    actualNotObj.push(is.not.object([]));

                    // then
                    for (i = 0; i < actualObj.length; i += 1) {
                        expect(actualObj[i]).to.equal(false);
                    }

                    for (i = 0; i < actualNotObj.length; i += 1) {
                        expect(actualNotObj[i]).to.equal(true);
                    }
                });

            });

            describe('when checking is.array', function () {

                it('should return true if the object is an array', function () {
                    // given
                    var sut = [],
                        actual;

                    // when
                    actual = is.array(sut);

                    // then
                    expect(actual).to.equal(true);
                });

                it('should return false if the object is NOT an array', function () {
                    // given
                    var sut = 42,
                        actual;

                    // when
                    actual = is.array(sut);

                    // then
                    expect(actual).to.equal(false);
                });

                it('should have a "not" prefix that reverses the results', function () {
                    // given
                    var happySut = 42,
                        sadSut = [],
                        happyActual,
                        sadActual;

                    // when
                    happyActual = is.not.array(happySut);
                    sadActual = is.not.array(sadSut);

                    // then
                    expect(happyActual).to.equal(true);
                    expect(sadActual).to.equal(false);
                });

            });

            describe('when checking is.string', function () {

                it('should return true if the object is a string', function () {
                    // given
                    var sut = 'sut',
                        actual;

                    // when
                    actual = is.string(sut);

                    // then
                    expect(actual).to.equal(true);
                });

                it('should return false if the object is NOT a string', function () {
                    // given
                    var sut = 42,
                        actual;

                    // when
                    actual = is.string(sut);

                    // then
                    expect(actual).to.equal(false);
                });

                it('should have a "not" prefix that reverses the results', function () {
                    // given
                    var happySut = 42,
                        sadSut = 'sut',
                        happyActual,
                        sadActual;

                    // when
                    happyActual = is.not.string(happySut);
                    sadActual = is.not.string(sadSut);

                    // then
                    expect(happyActual).to.equal(true);
                    expect(sadActual).to.equal(false);
                });

            });

            describe('when checking is.boolean', function () {

                it('should return true if the object is a boolean', function () {
                    // given
                    var sut = true,
                        actual;

                    // when
                    actual = is.boolean(sut);

                    // then
                    expect(actual).to.equal(true);
                });

                it('should return false if the object is NOT a boolean', function () {
                    // given
                    var sut = 42,
                        actual;

                    // when
                    actual = is.boolean(sut);

                    // then
                    expect(actual).to.equal(false);
                });

                it('should have a "not" prefix that reverses the results', function () {
                    // given
                    var happySut = 42,
                        sadSut = true,
                        happyActual,
                        sadActual;

                    // when
                    happyActual = is.not.boolean(happySut);
                    sadActual = is.not.boolean(sadSut);

                    // then
                    expect(happyActual).to.equal(true);
                    expect(sadActual).to.equal(false);
                });

            });

            describe('when checking is.datetime', function () {

                it('should return true if the object is a Date', function () {
                    // given
                    var sut = new Date(),
                        actual;

                    // when
                    actual = is.datetime(sut);

                    // then
                    expect(actual).to.equal(true);
                });

                it('should return false if the object is NOT a Date', function () {
                    // given
                    var sut = 42,
                        actual;

                    // when
                    actual = is.datetime(sut);

                    // then
                    expect(actual).to.equal(false);
                });

                it('should have a "not" prefix that reverses the results', function () {
                    // given
                    var happySut = 42,
                        sadSut = new Date(),
                        happyActual,
                        sadActual;

                    // when
                    happyActual = is.not.datetime(happySut);
                    sadActual = is.not.datetime(sadSut);

                    // then
                    expect(happyActual).to.equal(true);
                    expect(sadActual).to.equal(false);
                });

            });

            describe('when checking is.regexp', function () {

                it('should return true if the object is a RegExp', function () {
                    // given
                    var sut1 = /[A-B]/,
                        sut2 = new RegExp('regex'),
                        actual1,
                        actual2;

                    // when
                    actual1 = is.regexp(sut1);
                    actual2 = is.regexp(sut2);

                    // then
                    expect(actual1).to.equal(true);
                    expect(actual2).to.equal(true);
                });

                it('should return false if the object is NOT a RegExp', function () {
                    // given
                    var sut = 42,
                        actual;

                    // when
                    actual = is.regexp(sut);

                    // then
                    expect(actual).to.equal(false);
                });

                it('should have a "not" prefix that reverses the results', function () {
                    // given
                    var happySut = 42,
                        sadSut = /[A-B]/,
                        happyActual,
                        sadActual;

                    // when
                    happyActual = is.not.regexp(happySut);
                    sadActual = is.not.regexp(sadSut);

                    // then
                    expect(happyActual).to.equal(true);
                    expect(sadActual).to.equal(false);
                });

            });

            describe('when checking is.number', function () {

                it('should return true if the object is a number', function () {
                    // given
                    var actual = [],
                        i;

                    // when
                    actual.push(is.number(42));
                    actual.push(is.number(42.42));
                    actual.push(is.number(42.4242424242));
                    actual.push(is.number(-42));
                    actual.push(is.number(-42.42));
                    actual.push(is.number(-42.4242424242));
                    actual.push(is.number(Infinity));

                    // then
                    for (i = 0; i < actual.length; i += 1) {
                        expect(actual[i]).to.equal(true);
                    }
                });

                it('should return false if the object is NOT a number', function () {
                    // given
                    var sut = '42',
                        actual;

                    // when
                    actual = is.number(sut);

                    // then
                    expect(actual).to.equal(false);
                });

                it('should have a "not" prefix that reverses the results', function () {
                    // given
                    var happyActual = [],
                        sadActual = [],
                        i;

                    // when
                    happyActual.push(is.not.number('42'));

                    sadActual.push(is.not.number(42));
                    sadActual.push(is.not.number(42.42));
                    sadActual.push(is.not.number(42.4242424242));
                    sadActual.push(is.not.number(-42));
                    sadActual.push(is.not.number(-42.42));
                    sadActual.push(is.not.number(-42.4242424242));
                    sadActual.push(is.not.number(Infinity));

                    // then
                    for (i = 0; i < happyActual.length; i += 1) {
                        expect(happyActual[i]).to.equal(true);
                    }

                    for (i = 0; i < sadActual.length; i += 1) {
                        expect(sadActual[i]).to.equal(false);
                    }
                });

            });

            describe('when checking is.money', function () {

                it('should return true if the object is a positive or negative number with up to 2 decimal places', function () {
                    // given
                    var actual = [],
                        i;

                    // when
                    actual.push(is.money(42));
                    actual.push(is.money(42.4));
                    actual.push(is.money(42.42));
                    actual.push(is.money(-42));
                    actual.push(is.money(-42.4));
                    actual.push(is.money(-42.42));
                    actual.push(is.money('42'));
                    actual.push(is.money('42.4'));
                    actual.push(is.money('42.42'));
                    actual.push(is.money('-42'));
                    actual.push(is.money('-42.4'));
                    actual.push(is.money('-42.42'));
                    actual.push(is.money('0'));
                    actual.push(is.money('0.0'));
                    actual.push(is.money('0.00'));


                    // then
                    for (i = 0; i < actual.length; i += 1) {
                        expect(actual[i]).to.equal(true);
                    }
                });

                it('should return false if the object is not a number, or if it exceeds 2 decimal places', function () {
                    // given
                    var actual = [],
                        i;

                    // when
                    actual.push(is.money(42.4242424242));
                    actual.push(is.money(-42.4242424242));
                    actual.push(is.money('42.4242424242'));
                    actual.push(is.money('-42.4242424242'));
                    actual.push(is.money('a42'));
                    actual.push(is.money('-a42'));
                    actual.push(is.money('42.ab'));
                    actual.push(is.money('-42.ab'));
                    actual.push(is.money('42ab'));
                    actual.push(is.money('-42ab'));
                    actual.push(is.money(Infinity));

                    // then
                    for (i = 0; i < actual.length; i += 1) {
                        expect(actual[i]).to.equal(false);
                    }
                });

                it('should have a "not" prefix that reverses the results', function () {
                    // given
                    var happyActual = [],
                        sadActual = [],
                        i;

                    // when
                    happyActual.push(is.not.money(42.4242424242));
                    happyActual.push(is.not.money(-42.4242424242));
                    happyActual.push(is.not.money('42.4242424242'));
                    happyActual.push(is.not.money('-42.4242424242'));
                    happyActual.push(is.not.money('a42'));
                    happyActual.push(is.not.money('-a42'));
                    happyActual.push(is.not.money('42.ab'));
                    happyActual.push(is.not.money('-42.ab'));
                    happyActual.push(is.not.money('42ab'));
                    happyActual.push(is.not.money('-42ab'));
                    happyActual.push(is.not.money(Infinity));

                    sadActual.push(is.not.money(42));
                    sadActual.push(is.not.money(42.4));
                    sadActual.push(is.not.money(42.42));
                    sadActual.push(is.not.money(-42));
                    sadActual.push(is.not.money(-42.4));
                    sadActual.push(is.not.money(-42.42));
                    sadActual.push(is.not.money('42'));
                    sadActual.push(is.not.money('42.4'));
                    sadActual.push(is.not.money('42.42'));
                    sadActual.push(is.not.money('-42'));
                    sadActual.push(is.not.money('-42.4'));
                    sadActual.push(is.not.money('-42.42'));
                    sadActual.push(is.not.money('0'));
                    sadActual.push(is.not.money('0.0'));
                    sadActual.push(is.not.money('0.00'));

                    // then
                    for (i = 0; i < happyActual.length; i += 1) {
                        expect(happyActual[i]).to.equal(true);
                    }

                    for (i = 0; i < sadActual.length; i += 1) {
                        expect(sadActual[i]).to.equal(false);
                    }
                });

            });

            describe('when checking is.decimal', function () {

                it('should return true if the object is a positive or negative decimal or number', function () {
                    // given
                    var actual = [],
                        i;

                    // when
                    actual.push(is.decimal(42));
                    actual.push(is.decimal(42.4));
                    actual.push(is.decimal(42.42));
                    actual.push(is.decimal(-42));
                    actual.push(is.decimal(-42.4));
                    actual.push(is.decimal(-42.42));
                    actual.push(is.decimal(42.4242424242));
                    actual.push(is.decimal(-42.4242424242));
                    actual.push(is.decimal(Infinity));


                    // then
                    for (i = 0; i < actual.length; i += 1) {
                        expect(actual[i]).to.equal(true);
                    }
                });

                it('should return false if the object is not a decimal or number', function () {
                    // given
                    var actual = [],
                        i;

                    // when
                    actual.push(is.decimal('42'));
                    actual.push(is.decimal('42.4'));
                    actual.push(is.decimal('42.42'));
                    actual.push(is.decimal('-42'));
                    actual.push(is.decimal('-42.4'));
                    actual.push(is.decimal('-42.42'));
                    actual.push(is.decimal('0'));
                    actual.push(is.decimal('0.0'));
                    actual.push(is.decimal('0.00'));

                    // then
                    for (i = 0; i < actual.length; i += 1) {
                        expect(actual[i]).to.equal(false);
                    }
                });

                it('should have a "not" prefix that reverses the results', function () {
                    // given
                    var happyActual = [],
                        sadActual = [],
                        i;

                    // when
                    happyActual.push(is.not.decimal('42'));
                    happyActual.push(is.not.decimal('42.4'));
                    happyActual.push(is.not.decimal('42.42'));
                    happyActual.push(is.not.decimal('-42'));
                    happyActual.push(is.not.decimal('-42.4'));
                    happyActual.push(is.not.decimal('-42.42'));
                    happyActual.push(is.not.decimal('0'));
                    happyActual.push(is.not.decimal('0.0'));
                    happyActual.push(is.not.decimal('0.00'));

                    sadActual.push(is.not.decimal(42));
                    sadActual.push(is.not.decimal(42.4));
                    sadActual.push(is.not.decimal(42.42));
                    sadActual.push(is.not.decimal(-42));
                    sadActual.push(is.not.decimal(-42.4));
                    sadActual.push(is.not.decimal(-42.42));
                    sadActual.push(is.not.decimal(42.4242424242));
                    sadActual.push(is.not.decimal(-42.4242424242));
                    sadActual.push(is.not.decimal(Infinity));

                    // then
                    for (i = 0; i < happyActual.length; i += 1) {
                        expect(happyActual[i]).to.equal(true);
                    }

                    for (i = 0; i < sadActual.length; i += 1) {
                        expect(sadActual[i]).to.equal(false);
                    }
                });

            });

            describe('when checking is.decimal with the places argument', function () {

                it('should return true if the object is a positive or negative decimal with the given amount of decimal places', function () {
                    // given
                    var actual = [],
                        i;

                    // when
                    actual.push(is.decimal(42, 0));
                    actual.push(is.decimal(42.4, 1));
                    actual.push(is.decimal(42.42, 2));
                    actual.push(is.decimal(-42, 0));
                    actual.push(is.decimal(-42.4, 1));
                    actual.push(is.decimal(-42.42, 2));
                    actual.push(is.decimal(42.4242424242, 10));
                    actual.push(is.decimal(-42.4242424242, 10));

                    // then
                    for (i = 0; i < actual.length; i += 1) {
                        expect(actual[i]).to.equal(true);
                    }
                });

                it('should return false if the object is a positive or negative decimal, but has a different number of decimal places', function () {
                    // given
                    var actual = [],
                        i;

                    // when
                    actual.push(is.decimal(42, 1));
                    actual.push(is.decimal(42.4, 2));
                    actual.push(is.decimal(42.42, 3));
                    actual.push(is.decimal(-42, 1));
                    actual.push(is.decimal(-42.4, 2));
                    actual.push(is.decimal(-42.42, 3));
                    actual.push(is.decimal(42.4242424242, 12));
                    actual.push(is.decimal(-42.4242424242, 12));

                    // then
                    for (i = 0; i < actual.length; i += 1) {
                        expect(actual[i]).to.equal(true);
                    }
                });

            });

        });
        
        
    };
        
}((typeof module !== 'undefined' && module.exports) ? module.exports : window));
