/*jshint camelcase: false*/
module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-mocha'); // browser
    grunt.loadNpmTasks('grunt-karma');

    // Update the grunt config
    grunt.config.set('karma', {
        options: {
            // see http://karma-runner.github.io/0.8/config/configuration-file.html
            basePath: '../',
            frameworks: ['mocha', 'chai'],
            files: [
                'test/browser/bower_components/jquery/dist/jquery.min.js',
                'test/browser/bower_components/async/lib/async.js',
                'test/browser/test.setup.js',
                // hilary
                // 'release/hilary.js',
                'release/hilary.min.js',
                'release/hilary.jQueryEventEmitter.min.js',
                'release/hilary.amd.min.js',
                // mock data
                'test/mockData.js',
                // specs
                { pattern: 'test/*.fixture.js', included: true, served: true }, // watched: false, served: true}
                { pattern: 'test/browser/*.fixture.js', included: true, served: true },
                // runner
                'test/browser/test.js'
            ],
            reporters: ['nyan'],
            reportSlowerThan: 2000,
            singleRun: true
        },
        // developer testing mode
        unit_osx: {
            browsers: ['Chrome', 'Firefox', 'Safari']
        },
        debug_osx: {
            browsers: ['Chrome'],
            singleRun: false
        },
        unit_windows: {
            browsers: ['Chrome', 'Firefox', 'IE']
        },
        debug_windows: {
            browsers: ['Chrome'],
            singleRun: false
        },
        //continuous integration mode: run tests once in PhantomJS browser.
        headless: {
            singleRun: true,
            browsers: ['PhantomJS']
        }
    });
};
