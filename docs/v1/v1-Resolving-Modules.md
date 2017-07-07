Resolving modules simply returns the registered function or object. We recommend doing all resolving in a single module (i.e. compositionRoot.js / app.js / server.js). Building on the [registration examples](https://github.com/Acatar/hilaryjs/wiki/Registering-Modules):

```JavaScript
scope.resolve(['myModule', 'myFactory', 'myOtherModule'],
    function (myModule, myFactory, myOtherModule) {
        console.log(myModule);                       // prints 'do something!'
        console.log(myFactory('expect something!')); // prints 'expect something!'
        console.log(myOtherModule.message);          // prints 'say something!'
    }
);
```

If you need access to the container or its parent, there are key names for that:

```JavaScript
var modules = scope.resolve('hilary::container'),
    parent = scope.resolve('hilary::parent');
```

Resolving is recursively hierarchical, so if you attempt to resolve a module in a child container, and the child container does not have a registration, but the parent container does, the module from the parent will be returned.

```JavaScript
var parentScope = new Hilary(),
    childScope = parentScope.createChildContainer();

parentScope.register('myModule', function() {
    return 'do something!';
});

parentScope.register('myFactory', function(expectation) {
    return expectation;
});

parentScope.register('myOtherModule', {
    message: 'say something!'
});

// modules on the child scope can depend on modules in both the parent and child scopes
// modules in the parent scope do know about the child scope
childScope.register('myHilaryModule', ['myModule', 'myFactory', 'myOtherModule'],
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

childScope.resolve('myHilaryModule').go();
```