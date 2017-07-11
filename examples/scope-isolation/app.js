var hilary = require('../../index.js'), //require('hilary'),
    scope1 = hilary.scope('one'),
    scope2 = hilary.scope('two');

scope1.register({
    name: 'scope-isolation',
    factory: 1
});

scope2.register({
    name: 'scope-isolation',
    factory: 2
});

//prints 1
console.log(scope1.resolve('scope-isolation'));

//prints 2
console.log(scope2.resolve('scope-isolation'));
