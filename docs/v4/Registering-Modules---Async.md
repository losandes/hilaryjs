Hilary supports Async versions of all registration and auto-registration options, provided you execute the ``useAsync`` function and pass in [async.js](https://github.com/caolan/async):

```JavaScript
var scope = new Hilary().useAsync(async);
```

The async version of each function is appended with ``Async``. For instance, the async version of ``register`` is ``registerAsync``. The async functions return the current scope for chainability. They also accept a ``callback`` argument, so you can handle errors and successes.

```JavaScript
scope.registerAsync({
    name: 'myModule',
    factory: function () {
        return 'do something!';
    }
}, function (err, scope) {
    if (err) {
        // failed :(
    } else {
        // success!
    }
});
```

```JavaScript
scope.autoRegisterAsync(require('./controllers'), function (err, scope) {
    if (err) {
        // failed :(
    } else {
        // success!
    }
});
```
