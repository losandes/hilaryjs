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
        printDefinition('build', 'prepares release candidates, runs all tests, and prepares release if they pass', '-os');
        printDefinition('package', 'prepares release candidates, runs all tests, and prepares release if they pass', '-os');
        printDefinition('test', 'prepares release candidates, runs all tests, and prepares release if they pass', '-os');
        printDefinition('test-node', 'runs the node (server side) developer tests', '--grep');
        printDefinition('test-node --grep=something', 'runs any node (server side) test that matches the grep text developer tests', '--grep');
        printDefinition('test-browser', 'runs the browser side (karma) developer tests.', '-os');
        printDefinition('debug-browser', 'runs the browser side (karma) developer tests in debug mode.', '-os');
        console.log('');

        printHeader('Switches');
        printDefinition('-os', 'When running tests, you can choose which os you are using to get a different set of browsers.');
        printDefinition('-os osx', '(default) runs the browser tests in Chrome, Firefox and Safari');
        printDefinition('-os windows', 'runs the browser tests in Chrome, Firefox and IE');
        printDefinition('-os headless', 'runs the browser tests in PhantomJS');
        console.log('');

        printHeader('Examples');
        printExample('$ grunt -os windows');
        printExample('$ grunt build');
        printExample('$ grunt test-node');
        printExample('$ grunt test-browser -os windows');
        console.log('');
    });
};
