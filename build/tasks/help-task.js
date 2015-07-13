var chalk = require('chalk');

module.exports = function (grunt) {
    'use strict';
    
    var printDefinition,
        printHeader,
        printExample;
    
    printDefinition = function (name, definition, switchList) {
        if (switchList) {
            console.log(chalk.bold.blue(name), chalk.white(definition) + chalk.italic.magenta(' ' + switchList));
        } else {
            console.log(chalk.bold.blue(name), chalk.white(definition));
        }
    };
    
    printHeader = function (header) {
        console.log(chalk.bold.bgYellow.black(header));
    };
    
    printExample = function (example) {
        console.log(chalk.white(example));
    };

    grunt.registerTask('help', 'prints out the grunt tasks that are registered', function () {
        console.log('');
        printHeader('Legend');
        printDefinition('command', 'definition/explanation/behavior', 'supported switches');
        console.log('');
        
        printHeader('Commands');
        printDefinition('default', 'uglifies hilary, then runs the unit tests on the uglified code, and finally copies the uglified files to example directories if the unit tests pass', '-os');
        printDefinition('build', 'uglifies hilary');
        printDefinition('test_node', 'runs the node (server side) developer tests');
        printDefinition('test_browser', 'runs the browser side (karma) developer tests.', '-os');
        printDefinition('debug_browser', 'runs the browser side (karma) developer tests in debug mode.', '-os');
        console.log('');
        
        printHeader('Switches');
        printDefinition('-os', 'When running tests, you can choose which os you are using to get a different set of browsers.');
        printDefinition('-os osx', '(default) runs the browser tests in Chrome, Firefox and Safari');
        printDefinition('-os windows', 'runs the browser tests in Chrome, Firefox and IE');
        printDefinition('-os continuous', 'runs the browser tests in PhantomJS');
        console.log('');
        
        printHeader('Examples');
        printExample('$ grunt -os windows');
        printExample('$ grunt build');
        printExample('$ grunt test_node');
        printExample('$ grunt test_browser -os windows');
        console.log('');
    });
};
