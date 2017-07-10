'use strict';

var hilary = require('../../index.js'), //require('hilary');
    qAndA = require('./q-and-a'),
    questions = require('./questions.js');

hilary.scope('myApp', {
    log: {
        level: 'trace'
    }
}).bootstrap([
    function (scope, next) {
        scope.register(qAndA);

        next(null, scope);
    }
], function (err, scope) {
    if (err) {
        throw err;
    }

    var Question = scope.resolve('question'),
        selected = questions[Math.floor(Math.random() * questions.length)];

    new Question(selected.q, selected.a).ask();
});
