Hilary supports Async versions of all resolution and auto-resolution options, provided you execute the ``useAsync`` function and pass in [async.js](https://github.com/caolan/async):

```JavaScript
var scope = new Hilary().useAsync(async);
```

The async version of each function is appended with ``Async``. For instance, the async version of ``resolve`` is ``resolveAsync``. The async functions return the current scope for chainability. They also accept a ``callback`` argument, so you can handle errors and interact with the results.

```JavaScript
scope.resolveAsync('myModule', function (err, result) {
    if (err) {
        // failed :(
    } else {
        console.log(result);
    }
});
```

```JavaScript
scope.resolveManyAsync(['myModule', 'myFactory', 'myOtherModule'],
    function (err, results) {
        console.log(results.myModule);                       // prints 'do something!'
        console.log(results.myFactory('expect something!')); // prints 'expect something!'
        console.log(results.myOtherModule.message);          // prints 'say something!'
    });
```

```JavaScript
scope.autoResolveAsync(require('./controllers'), function (err) {
    if (err) {
        // failed :(
    } else {
        // success!
    }
});
```
