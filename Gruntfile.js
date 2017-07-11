module.exports = function (grunt) {
    'use strict';

    var os = 'osx';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
    });

    // Load external tasks
    grunt.loadTasks('build-tasks');

    // arguments
    os = grunt.option('os') || 'osx';

    // Default task(s).
    grunt.registerTask('default', ['help']);
    grunt.registerTask('package', ['test']);
    grunt.registerTask('build', ['test']);
    grunt.registerTask('test', ['test-node', 'test-browser']);
    grunt.registerTask('test-node', ['mochaTest']);
    grunt.registerTask('test-browser', [
        'uglify:testDebug',     // build hilary for testing
        'uglify:testRelease',
        'karma:unit_' + os,     // run the tests
        'uglify:debug',         // if they pass, build the release
        'uglify:release'
    ]);
    grunt.registerTask('debug', ['debug-browser']);
    grunt.registerTask('debug-browser', [
        'uglify:testDebug',     // build hilary for testing
        'uglify:testRelease',
        'karma:debug_' + os     // debug the tests
    ]);

};
