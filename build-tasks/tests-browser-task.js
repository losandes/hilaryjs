/*jshint camelcase: false*/
module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-mocha'); // browser
    grunt.loadNpmTasks('grunt-karma');

    // Update the grunt config
    grunt.config.set('karma', {
        options: {
            // see http://karma-runner.github.io/0.8/config/configuration-file.html
            basePath: './',
            frameworks: ['mocha', 'chai'],
            files: [
                'tests/browser-setup.js',
                'node_modules/polyn/release/polyn.min.js',
                // hilary
                'release-candidate/hilary.min.js',
                // specs
                { pattern: 'tests/specs/*specs.js', included: true, served: true }, // watched: false
                // runner
                'tests/testRunner.js',
                'tests/bootstrapper.js'
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
        unit_headless: {
            singleRun: true,
            browsers: ['PhantomJS']
        }
    });
};
