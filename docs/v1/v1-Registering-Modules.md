Modules are typically registered by name and, when named, must return a value. There are several options for registering modules. This first example has no dependencies and will be executed upon being resolved.

```JavaScript
scope.register('myModule', function() {
    return 'do something!';
});
```

The next example is much like the first, but it accepts and argument without declaring its dependencies. Hilary will return the function as-is, since it has no information to satisfy the arguments. This is useful for creating factories and registering functions directly.

```JavaScript
scope.register('myFactory', function(expectation) {
    return expectation;
});
```

You can register object literals:

```JavaScript
scope.register('myOtherModule', {
    message: 'say something!'
});

// is the same as

scope.register({
    myOtherModule: {
        message: 'say something!'
    }
});
```

This example registers a module that declares its dependencies. When the module is resolved, Hilary will resolve the dependencies, cascade through the dependency graph, and pass the resolved dependencies into the factory as arguments.

```JavaScript
scope.register('myHilaryModule', ['myModule', 'myFactory', 'myOtherModule'],
    function (myModule, myFactory, myOtherModule) {
        return {
            go: function () {
                console.log(myModule);                       // prints 'do something!'
                console.log(myFactory('expect something!')); // prints 'expect something!'
                console.log(myOtherModule.message);          // prints 'say something!'
            }
        };
    }
);
```

If the dependency array syntax doesn't work for you, you can resolve inline, however this takes the Async out of AMD: it's executed immediately so the dependencies are expected to already be loaded on the container.

```JavaScript
scope.register(function (resolve, exports, module) {
    var myModule = resolve('myModule'),
        myFactory = resolve('myFactory'),
        myOtherModule = resolve('myOtherModule');
    
    exports.myAnonModule = {
        go: function () {
            console.log(myModule);                       // prints 'do something!'
            console.log(myFactory('expect something!')); // prints 'expect something!'
            console.log(myOtherModule.message);          // prints 'say something!'
        }
    };
});
```

Now - to put it all together:

```JavaScript
var hilary = new Hilary();

scope.register('myModule', function() {
    return 'do something!';
});

scope.register('myFactory', function(expectation) {
    return expectation;
});

scope.register('myOtherModule', {
    message: 'say something!'
});

scope.register('myHilaryModule', ['myModule', 'myFactory', 'myOtherModule'],
    function (myModule, myFactory, myOtherModule) {
        return {
            go: function () {
                console.log(myModule);                       // prints 'do something!'
                console.log(myFactory('expect something!')); // prints 'expect something!'
                console.log(myOtherModule.message);          // prints 'say something!'
            }
        };
    }
);

scope.resolve('myHilaryModule').go();