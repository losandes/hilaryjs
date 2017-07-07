When resolving a module, if the factory is parameterless or if the module has registered dependencies, the factory is executed and returned. Otherwise, the factory itself is returned.

We recommend following the [composition root pattern](http://blog.ploeh.dk/2011/07/28/CompositionRoot/), and to avoid the service-location anti-pattern that is prevalent in node apps. This will make your code easier to maintain, and give you a single location to understand your object graph.

You can resolve a single dependency by name:

```JavaScript
var myModule = scope.resolve('myModule');
```

You can also resolve arrays of dependencies:

```JavaScript
scope.resolveMany(['myModule', 'myFactory', 'myOtherModule'],
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

When resolving modules in a child container, Hilary will recurse through the parent graph, if it cannot resolve the module in the immediate scope. In other words, if you attempt to resolve a module in a child container, and the child container does not have a registration, but the parent container does, the module from the parent will be returned.

```JavaScript
var parentScope = new Hilary(),
    childScope = parentScope.createChildContainer();

parentScope.register({
    name: 'myModule',
    factory: function() {
        return 'do something!';
    }
});

parentScope.register({
    name: 'myFactory',
    factory: function(expectation) {
        return expectation;
    }
});

childScope.register({
    name: 'myOtherModule',
    factory: {
        message: 'say something!'
    }
});

// modules on the child scope can depend on modules in both the parent and child scopes
// modules in the parent scope do know about the child scope
childScope.register({
    name: 'myChildScopeModule',
    dependencies: ['myModule', 'myFactory', 'myOtherModule'],
    factory: function (myModule, myFactory, myOtherModule) {
        return {
            go: function () {
                console.log(myModule);                       // prints 'do something!'
                console.log(myFactory('expect something!')); // prints 'expect something!'
                console.log(myOtherModule.message);          // prints 'say something!'
            }
        };
    }
});

childScope.resolve('myChildScopeModule').go();
```

### Graceful Degrade to Node.js require and window Globals
When resolving modules, if Hilary does not find the module, it will attempt to resolve the module via Node's require function or the browser's window object, as appropriate. This allows you to take advantage of Dependency Injection without registering components, and to inject a different module for that dependency for testing, or at a later date.

For instance, in Node, you could require http, without registering it:

```JavaScript
scope.register({
    name: 'server',
    dependencies: ['http'],
    factory: function (http) {
        "use strict";
    
        http.createServer(function (req, res) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Hello World\n');
        }).listen(1337, '127.0.0.1');

        console.log('Server running at http://127.0.0.1:1337/');
    
        return http;
    }
});

...

scope.resolve('server');
```

In the browser, you can list globals, like ``jQuery`` without having to register them:

```JavaScript
scope.register({
    name: 'viewModel',
    dependencies: ['jQuery'],
    factory: function ($) {
        $('#main').text('hello world!');
    }
});

...

scope.resolve('viewModel');
```

### Checking to see if a module exists
You can check to see if a module exists using ``exists``, which returns a boolean: true if the modules exists, otherwise false.

```JavaScript
Hilary.scope('myScope').exists('myModule');
```
