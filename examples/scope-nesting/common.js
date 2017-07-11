var hilary = require('../../index.js'), //require('hilary'),
    scope = hilary.scope('common');

scope.register({ name: 'module1', factory: 1 });
scope.register({ name: 'module2', factory: 2 });

module.exports.scope = scope;
