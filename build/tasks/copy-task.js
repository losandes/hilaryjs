var fs = require('fs');

module.exports = function (grunt) {
    'use strict';
    
    var filesToCopy = [{
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
    

    grunt.loadNpmTasks('grunt-contrib-copy');
    
    // Update the grunt config
    grunt.config.set('copy', {
        main: {
            files: filesToCopy
        }
    });
};
