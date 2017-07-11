'use strict';

var Listener = require('./q-and-a/Listener.js'),
    printer = require('./q-and-a/printer.js'),
    Question = require('./q-and-a/Question.js'),
    questions = require('./questions.js');

var question = new Question.factory(printer.factory, Listener.factory),
    selected = questions[Math.floor(Math.random() * questions.length)];

question.ask(selected.q, selected.a);
