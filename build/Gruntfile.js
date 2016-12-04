module.exports = function (grunt) {
    'use strict';

    var os = 'osx';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
    });

    // Load external tasks
    grunt.loadTasks('tasks');

    // arguments
    os = grunt.option('os') || 'osx';

    // Default task(s).
    grunt.registerTask('default', ['help']);
    grunt.registerTask('package', ['uglify:debug', 'uglify:release', 'mochaTest', 'karma:unit_' + os, 'copy']);
    grunt.registerTask('build', ['uglify:debug', 'uglify:release']);
    grunt.registerTask('test-node', ['mochaTest']);
    grunt.registerTask('test-browser', ['uglify', 'karma:unit_' + os]);
    grunt.registerTask('debug', ['uglify', 'karma:debug_' + os]);
    grunt.registerTask('debug-browser', ['uglify', 'karma:debug_' + os]);

};
