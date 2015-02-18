/*jslint node: true*/
/*globals describe, it*/
var Hilary  = require('../../index.js'),
    scope = new Hilary(),
    spec = {
        describe: describe,
        it: it,
        expect: require('chai').expect,
        should: require('chai').should()
    };

require('./hilaryIoCFixture.js').test(Hilary, spec);
require('./hilarySingletonsFixture.js').test(Hilary, spec);
