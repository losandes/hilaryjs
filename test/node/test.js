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


require('../hilary.fixture.js')['hilary.fixture'](Hilary, spec, shortid.generate, mockData.makeMockData, async);
require('../hilary.di.fixture.js')['hilary.di.fixture'](Hilary, spec, shortid.generate, mockData.makeMockData);
require('./hilary.node.di.fixture.js').test(Hilary, spec, async);
require('../hilary.di.async.fixture.js')['hilary.di.async.fixture'](Hilary, spec, shortid.generate, mockData.makeMockData, async);
require('../hilary.singletons.fixture.js')['hilary.singletons.fixture'](Hilary, spec);
require('../hilary.pipeline.fixture.js')['hilary.pipeline.fixture'](Hilary, spec, shortid.generate, mockData.makeMockData, async);
