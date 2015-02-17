/*globals module*/
module.exports = function (grunt) {
    "use strict";
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            my_target: {
                files: {
                    '../release/hilary.min.js': ['../src/hilary.js'],
                    '../release/hilary.amd.min.js': ['../src/hilary.amd.js'],
                    '../release/hilaryWithAMD.min.js': ['../src/hilary.js', '../src/hilary.amd.js']
                }
            }
        },
        jasmine: {
            pivotal: {
                src: ['../release/hilaryWithAMD.min.js'], //'../src/**/*.js',
                options: {
                    specs: '../test/browser/specs/*Fixture.js'
                }
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec', // 'spec', // 'min', // 'nyan', // 'xunit',
                    //captureFile: 'results.txt', // Optionally capture the reporter output to a file
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
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
        copy: {
            main: {
                files: [
                    {src: ['../src/*'], dest: '../examples/nodeweb/public/scripts/', filter: 'isFile'}
                ]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'jasmine', 'mochaTest', 'copy']);

};
