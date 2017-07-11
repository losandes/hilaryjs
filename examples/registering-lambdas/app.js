'use strict';

var hilary = require('../../index.js'), //require('hilary');
    scope = hilary.scope('myApp'),
    qAndA = require('./q-and-a'),
    questions = require('./questions.js');

scope.bootstrap([
    scope.makeRegistrationTask(qAndA)
], function (err, scope) {
    if (err) {
        throw err;
    }

    var Question = scope.resolve('question'),
        selected = questions[Math.floor(Math.random() * questions.length)];

    new Question(selected.q, selected.a).ask();
});
