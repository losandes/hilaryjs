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
        mocha: {
            test: {
                options: {
                    reporter: 'Nyan', //Spec //Nyan
                    run: true
                },
                src: ['../test/browser/test.html']
            }
        },
        copy: {
            main: {
                files: [
                    { src: ['../release/hilary.min.js'], dest: '../examples/express/public/scripts/hilary.min.js', filter: 'isFile' },
                    { src: ['../src/hilary.js'], dest: '../examples/express/public/scripts/hilary.js', filter: 'isFile' },
                    { src: ['../release/hilary.amd.min.js'], dest: '../examples/express/public/scripts/hilary.amd.min.js', filter: 'isFile' },
                    { src: ['../src/hilary.amd.js'], dest: '../examples/express/public/scripts/hilary.amd.js', filter: 'isFile' },
                    { src: ['../release/hilary.jQueryEventEmitter.min.js'], dest: '../examples/express/public/scripts/hilary.jQueryEventEmitter.min.js', filter: 'isFile' },
                    { src: ['../src/hilary.jQueryEventEmitter.js'], dest: '../examples/express/public/scripts/hilary.jQueryEventEmitter.js', filter: 'isFile' },
                    { src: ['../src/hilary.js'], dest: '../examples/express/node_modules/hilary/src/hilary.js', filter: 'isFile' },
                    { src: ['../src/hilary.amd.js'], dest: '../examples/express/node_modules/hilary/src/hilary.amd.js', filter: 'isFile' },
                    { src: ['../index.js'], dest: '../examples/express/node_modules/hilary/index.js', filter: 'isFile' }
                ]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-mocha-test'); // node
    grunt.loadNpmTasks('grunt-mocha');      // browser
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'mocha', 'mochaTest', 'copy']);
    grunt.registerTask('testnode', ['mochaTest']);
    grunt.registerTask('testbrowser', ['uglify', 'mocha']);

};
