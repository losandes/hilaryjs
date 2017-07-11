var hilary = require('../../index.js'), //require('hilary'),
    common = new require('./common.js'),
    nestedByName = hilary.scope('nestedByName', {
        parent: 'common'
    }),
    nestedByScope = hilary.scope('nestedByScope', {
        parent: common.scope
    });

nestedByName.register({ name: 'module1', factory: 'one' });
nestedByScope.register({ name: 'module1', factory: 'one' });

console.log(
    nestedByName.resolve('module1') === 'one' ? 'PASS:' : 'FAIL:',
    'it should resolve from the immediate scope, when a module is registered'

);
console.log(
    nestedByName.resolve('module2') === 2 ? 'PASS:' : 'FAIL:',
    'it should fall back to the parent scope, when a module isn\'t found'
);

console.log(
    nestedByName.resolve('module1') === 'one' ? 'PASS:' : 'FAIL:',
    'it should resolve from the immediate scope, when a module is registered'
);
console.log(
    nestedByName.resolve('module2') === 2 ? 'PASS:' : 'FAIL:',
    'it should fall back to the parent scope, when a module isn\'t found'
);
