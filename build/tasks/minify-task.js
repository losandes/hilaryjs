/*jshint camelcase: false*/
module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-uglify'); // node

    // Update the grunt config
    grunt.config.set('uglify', {
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
                '../release/hilary.moduleExports.js': ['../src/hilary.moduleExports.js'],
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
                '../release/hilary.moduleExports.min.js': ['../src/hilary.moduleExports.js'],
                '../release/hilaryWithAMD.min.js': ['../src/hilary.js', '../src/hilary.amd.js'],
                '../release/hilary.jQueryEventEmitter.min.js': ['../src/hilary.jQueryEventEmitter.js']
            }
        }
    });
};
