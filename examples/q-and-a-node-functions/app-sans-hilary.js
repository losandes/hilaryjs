'use strict';

var Listener = require('./q-and-a/Listener.js'),
    printer = require('./q-and-a/printer.js'),
    questionFactory = require('./q-and-a/Question.js'),
    questions = require('./questions.js');

var Question = questionFactory.factory(printer.factory, Listener.factory),
    selected = questions[Math.floor(Math.random() * questions.length)];

new Question(selected.q, selected.a).ask();
