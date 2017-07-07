Hilary supports auto-resolving of Node.js modules. To use this feature, your module must export an object with the ``factory`` property. You may also opt to define the ``dependencies`` property.

```JavaScript
module.exports.dependencies = ['myOtherModule'];
module.exports.factory = function (myOtherModule) {
    // module code here
};
```

### Node Indexes

You can use ``autoResolve`` with objects and arrays, to support Node indexes. Suppose you have a controllers folder with an index file that exports the following:

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

Then you can just ``autoResolve`` the entire index:

```JavaScript
scope.autoResolve('./controllers');
```