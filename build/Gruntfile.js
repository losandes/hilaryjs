/*globals module*/
module.exports = function (grunt) {
    "use strict";
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            pivotal: {
                src: ['../release/hilaryWithAMD.min.js'], //'../src/**/*.js',
                options: {
                    specs: '../test/specs/*Fixture.js'
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            my_target: {
                files: {
                    '../release/hilary.min.js': ['../src/hilary.js'],
                    '../release/hilaryWithAMD.min.js': ['../src/hilary.js', '../src/hilary.amd.js'],
                    '../release/hilaryWithAMDAndLoader.min.js': ['../src/hilary.js', '../src/hilary.amd.js', '../src/hilary.loader.js'],
                    '../release/hilaryWithLoader.min.js': ['../src/hilary.js', '../src/hilary.loader.js']
                }
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
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'jasmine', 'copy']);

};