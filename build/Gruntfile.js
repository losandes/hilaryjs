/*jslint node: true*/
/*globals module*/
module.exports = function (grunt) {
    "use strict";

    var os = 'osx',
        fs = require('fs'),
        filesToCopy = [{
            src: ['../index.js'],
            dest: '../examples/express/node_modules/hilary/index.js',
            filter: 'isFile'
        }];

    (function (fs) {
        var files = fs.readdirSync('../release'),
            i,
            name;

        for (i = 0; i < files.length; i += 1) {
            name = files[i];
            filesToCopy.push({
                src: ['../release/' + name],
                dest: '../examples/express/public/bower_components/hilary/release/' + name,
                filter: 'isFile'
            });
            filesToCopy.push({
                src: ['../release/' + name],
                dest: '../examples/express/node_modules/hilary/src/' + name,
                filter: 'isFile'
            });
        }

    }(fs));

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            debug: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    beautify: true,
                    mangle: false,
                    compress: false,
                    sourceMap: false,
                    drop_console: false,
                    preserveComments: 'some'
                },
                files: {
                    '../release/hilary.js': ['../src/hilary.js'],
                    '../release/hilary.amd.js': ['../src/hilary.amd.js'],
                    '../release/hilaryWithAMD.js': ['../src/hilary.js', '../src/hilary.amd.js'],
                    '../release/hilary.jQueryEventEmitter.js': ['../src/hilary.jQueryEventEmitter.js']
                }
            },
            release: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                        //                    mangle: true,
                        //                    compress: true,
                        //                    sourceMap: true,
                        //                    drop_console: true
                },
                files: {
                    '../release/hilary.min.js': ['../src/hilary.js'],
                    '../release/hilary.amd.min.js': ['../src/hilary.amd.js'],
                    '../release/hilaryWithAMD.min.js': ['../src/hilary.js', '../src/hilary.amd.js'],
                    '../release/hilary.jQueryEventEmitter.min.js': ['../src/hilary.jQueryEventEmitter.js']
                }
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'nyan', // 'spec', // 'min', // 'nyan', // 'xunit',
                    //captureFile: 'results.txt', // Optionally capture the reporter output to a file
                    quiet: false // Optionally suppress output to standard out (defaults to false)
                        //clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
                },
                require: 'coverage/blanket',
                src: ['../test/node/test.js']
            },
            coverage: {
                options: {
                    reporter: 'html-cov',
                    // use the quiet flag to suppress the mocha console output
                    quiet: true,
                    // specify a destination file to capture the mocha
                    // output (the quiet option does not suppress this)
                    captureFile: 'coverage.html'
                },
                src: ['../test/node/test.js']
            }
        },
        karma: {
            options: {
                // see http://karma-runner.github.io/0.8/config/configuration-file.html
                basePath: '../',
                frameworks: ['mocha', 'chai'],
                files: [
                    "test/browser/bower_components/jquery/dist/jquery.min.js",
                    "test/browser/bower_components/async/lib/async.js",
                    "test/browser/test.setup.js",
                    // hilary
                    "release/hilary.min.js",
                    "release/hilary.jQueryEventEmitter.min.js",
                    "release/hilary.amd.min.js",
                    // mock data
                    "test/mockData.js",
                    // specs
                    { pattern: 'test/*.fixture.js', included: true, served: true }, // watched: false, served: true}
                    { pattern: 'test/browser/*.fixture.js', included: true, served: true },
                    // runner
                    "test/browser/test.js"
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
            continuous: {
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },
        copy: {
            main: {
                files: filesToCopy
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-mocha-test'); // node
    grunt.loadNpmTasks('grunt-mocha'); // browser
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-karma');
    
    // arguments
    os = grunt.option('os') || 'osx';

    // Default task(s).
    grunt.registerTask('default', ['uglify:debug', 'uglify:release', 'mochaTest', 'karma:unit_' + os, 'copy']);
    grunt.registerTask('test_node', ['mochaTest']);
    grunt.registerTask('test_browser', ['uglify', 'karma:unit_' + os]);
    grunt.registerTask('debug_browser', ['uglify', 'karma:debug_' + os]);

};
