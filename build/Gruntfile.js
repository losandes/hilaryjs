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
    grunt.registerTask('default', ['uglify:debug', 'uglify:release', 'mochaTest', 'karma:unit_' + os, 'copy']);
    grunt.registerTask('build', ['uglify:debug', 'uglify:release']);
    grunt.registerTask('test_node', ['mochaTest']);
    grunt.registerTask('test_browser', ['uglify', 'karma:unit_' + os]);
    grunt.registerTask('debug_browser', ['uglify', 'karma:debug_' + os]);

};
