/*jslint node: true*/
module.exports = function (config) {
    "use strict";

    config.set({
        basePath: '../',
        frameworks: ['mocha', 'chai'],
        files: [
            "test/browser/bower_components/jquery/dist/jquery.min.js",
            "test/browser/bower_components/async/lib/async.js",
//            "test/browser/bower_components/chai/chai.js",
//            "test/browser/bower_components/mocha/mocha.js",
            "test/browser/test.setup.js",
            // hilary
            "release/hilary.min.js",
            "release/hilary.jQueryEventEmitter.min.js",
            "release/hilary.amd.min.js",
            // specs
            "test/mockData.js",
            "test/hilary.fixture.js",
            "test/hilary.di.fixture.js",
            "test/hilary.di.async.fixture.js",
            "test/hilary.di.autowire.fixture.js",
            "test/hilary.singletons.fixture.js",
            "test/hilary.pipeline.fixture.js",
            "test/browser/hilary.browser.fixture.js",
            "test/browser/hilary.browser.jQueryEventEmitter.fixture.js",
            "test/browser/hilary.browser.amd.fixture.js",
            // runner
            "test/browser/test.js"
        ]
//        reporters: ['progress'],
//        port: 9876,
//        colors: true,
//        autoWatch: false,
//        singleRun: false,
//
//        // level of logging
//        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
//        logLevel: config.LOG_INFO
    });
};
