You can dispose modules, or even the entire container. Consider using different scopes, such as new Hilary instances or child containers if you are doing a lot of disposing. Then you can just delete the scope when you are finished with it.

```JavaScript
// dispose a single module
var isDisposed1 = scope.dispose('myModule');

// dispose multiple modules
var isDisposed2 = scope.dispose(['myModule', 'myOtherModule']);

// dispose all modules on the container
var isDisposed3 = scope.dispose();
```

There are async versions of dispose, too:

```JavaScript
// dispose a single module
scope.disposeAsync('myModule', function (err, result) {
    // result should be true
});

// dispose multiple modules
scope.disposeAsync(['myModule', 'myOtherModule'], function (err, result) {
    // result should be true
});

// dispose all modules on the container
scope.disposeAsync(function (err, result) {
    // result should be true
});
```