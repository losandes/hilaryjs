Hilary is designed from the ground up to be extensible. To extend Hilary, use the ``extend`` function on Hilary. The first argument is the name of your extension. The second argument is your extension, which can accept a scope argument. 

The scope that is provided is equivalent of ``this`` (Hilary's internal scope). From the scope, you can access Hilary features, such as ``register`` and ``resolve``. Once your extension is registered on Hilary, all newly created Hilary instances will include your extension.

Here is an example extension that simply logs the registration out to the console after registering a new module:

```JavaScript
Hilary.extend('helloRegister', function (scope) {
    return function (moduleName, dependencies, factory) {
        scope.register(moduleName, dependencies, factory);
        console.log('registered', moduleName);
    };
});
```

Using your extensions is just like using any other Hilary features.

```JavaScript
var app = new Hilary();

app.helloRegister('hello', function () {
    console.log('hello world!');
});
```

### Initialization
You can also add events that will be executed each time a Hilary instance is created. The events receive the same scope that extensions do. A second argument is also passed, giving access to the config/options.

```JavaScript
Hilary.onInit(function (scope, config) {
    $(document).trigger('hilary::initialized', [{ scope: scope, config: config }]);
});
```
