/*jshint camelcase: false*/
module.exports = function (grunt) {
    'use strict';

    var banner = '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        files = [
            './src/locale.js',
            './src/Exception.js',
            './src/Container.js',
            './src/Context.js',
            './src/HilaryModule.js',
            './src/Logger.js',
            './src/ResolveTasks.js',
            './src/HilaryApi.js',
            './src/index.js'
        ],
        output = {
            './release/hilary.js': files
        },
        outputMinified = {
            './release/hilary.min.js': files
        },
        outputTest = {
            './release-candidate/hilary.js': files
        },
        outputTestMinified = {
            './release-candidate/hilary.min.js': files
        };

    grunt.loadNpmTasks('grunt-contrib-uglify'); // node

    // Update the grunt config
    grunt.config.set('uglify', {
        debug: {
            options: {
                banner: banner,
                beautify: true,
                mangle: false,
                compress: false,
                sourceMap: false,
                drop_console: false,
                preserveComments: 'some'
            },
            files: output
        },
        release: {
            options: {
                banner: banner
                // mangle: true,
                // compress: true,
                // sourceMap: true,
                // drop_console: true
            },
            files: outputMinified
        },
        testDebug: {
            options: {
                banner: banner,
                beautify: true,
                mangle: false,
                compress: false,
                sourceMap: false,
                drop_console: false,
                preserveComments: 'some'
            },
            files: outputTest
        },
        testRelease: {
            options: {
                banner: banner
                // mangle: true,
                // compress: true,
                // sourceMap: true,
                // drop_console: true
            },
            files: outputTestMinified
        }
    });
};
