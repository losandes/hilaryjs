Hilary supports auto-registration of Node.js modules. To use this feature, your module must export an object with ``name`` and ``factory`` properties. You may also opt to define the ``dependencies`` property.

```JavaScript
module.exports.name = 'myModule';
module.exports.factory = function (myOtherModule) {
    // module code here
};
```

If you follow this convention, all you need to do to register your modules is this:

```JavaScript
var Hilary = require('hilary'),
    scope = new Hilary();

scope.register(require('./myModule'));
```

### Node Indexes

You can use ``autoRegister`` with objects and arrays, to support Node indexes. Suppose you have a controllers folder with an index file that exports the following:

```JavaScript
// index.js
module.exports = [
    require('./homeController.js'),
    require('./fooController.js')
];
```

**===OR===**

```JavaScript
// index.js
module.exports = {
    homeController: require('./homeController.js'),
    fooController: require('./fooController.js')
};
```

Then you can just ``autoRegister`` the entire index:

```JavaScript
scope.autoRegister('./controllers');
```