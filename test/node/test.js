/*jslint node: true*/
/*globals describe, it*/
var Hilary  = require('../../index.js'),
    scope = new Hilary(),
    shortid = require('shortid'),
    async = require('async'),
    mockData = require('../mockData'),
    spec = {
        describe: describe,
        it: it,
        expect: require('chai').expect,
        should: require('chai').should()
    };


require('../hilary.fixture.js')['hilary.fixture'](Hilary, spec, shortid.generate, mockData.makeMockData);
require('../hilary.di.fixture.js').test(Hilary, spec, shortid.generate, mockData.makeMockData);
require('./hilary.node.di.fixture.js').test(Hilary, spec, async);
require('../hilary.di.async.fixture.js').test(Hilary, spec, shortid.generate, mockData.makeMockData, async);
require('../hilary.singletons.fixture.js').test(Hilary, spec);
