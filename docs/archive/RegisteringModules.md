###tl;dr
There are several combinations of registering modules that result in different behaviors.

> Note that Hilary will attempt to resolve dependencies that are not registered by using Node.js' ``require`` or looking for globals on ``window``, as appropriate.

```JavaScript
// When a parameterless function is resolved, it will be executed and the
// result will be passed to the function that requires it.
Hilary.scope('myScope').register({
    name: 'myModule',
    factory: function () {
        return 'I am initialized';
    }
});
```

```JavaScript
// When a function with parameters is resolved, Hilary will attempt to
// resolve the dependencies by name and pass those dependencies in
// as arguments.
Hilary.scope('myScope').register({
    name: 'myModule',
    factory: function (dependency1, dependency2) {
        return 'I am initialized, and I can do something with '
               + 'dependency1 and dependency2';
    }
});
```

```JavaScript
// When a function with parameters is resolved, and dependencies are
// declared, Hilary will attempt to resolve the dependencies listed
// in that array, and pass those dependencies in as arguments,
// in the order in which they exist in the dependencies array.
// This behavior is very similar to AMD.
Hilary.scope('myScope').register({
    name: 'myModule',
    dependencies: ['dependency1', 'dependency2'],
    factory: function (d1, d2) {
        return 'I am initialized, and I can do something with d1 and d2';
    }
});
```

```JavaScript
// When a function with parameters is resolved, and dependencies are
// declared as an empty array, Hilary will simply return the factory
// without executing it.
Hilary.scope('myScope').register({
    name: 'myModule',
    dependencies: [],
    factory: function (arg1, arg2) {
        return 'I wasn\'t initialized until I was manually executed '
               + 'by a factory that depended on me. Hopefully they '
               + 'gave me values for arg1 and arg2.';
    }
});
```

###The Long Version
Registered modules require a name and a factory, at a minimum. They may also have dependencies. This first example has no dependencies and will be executed upon being resolved.

```JavaScript
Hilary.scope('myScope').register({
    name: 'myModule',
    factory: function () {
        return 'do something!';
    }
});
```

The next example is much like the first, but the factory accepts an argument but declares an empty dependency array. Hilary will return the function as-is, since there is no information to help satisfy the arguments. This is useful for creating factories and registering functions directly. Alternatively, you can omit the dependencies property and define a parameterless function that returns the function that accepts the expectation argument.

```JavaScript
Hilary.scope('myScope').register({
    name: 'myFactory',
    dependencies: [],
    factory: function(expectation) {
        return expectation;
    }
});
```

The factory doesn't have to be a function. If you register an object literal, Hilary will wrap the literal in a function, to be executed when resolved:

```JavaScript
Hilary.scope('myScope').register({
    name: 'myOtherModule',
    factory: {
        message: 'say something!'
    }
});
```

This example registers a module that declares its dependencies. When the module is resolved, Hilary will resolve the dependencies, cascade through the dependency graph, and pass the resolved dependencies into the factory as arguments.

```JavaScript
Hilary.scope('myScope').register({
    name: 'myHilaryModule',
    // You don't have to declare the dependencies if the names of your arguments match registered modules
    // dependencies: ['myModule', 'myFactory', 'myOtherModule'],
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
```

Now - to put it all together:

```JavaScript
(function (scope) {
    "use strict";
    
    scope.register({
        name: 'myModule',
        factory: function () {
            return 'do something!';
        }
    });

    scope.register({
        name: 'myFactory',
        dependencies: [],
        factory: function(expectation) {
            return expectation;
        }
    });

    scope.register({
        name: 'myOtherModule',
        factory: {
            message: 'say something!'
        }
    });

    scope.register({
        name: 'myHilaryModule',
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

    scope.resolve('myHilaryModule').go();

}(Hilary.scope('myScope')));
```

### Registering Node modules
When registering node modules, it is a best practice is to register a factory that returns the result of the require function, instead of just registering the modules themselves. This approach reduces memory overhead in Hilary, and allows node to behave as it normally would when using the service-location anti-pattern (i.e. node will to do it's own caching and GC, as normal)

```JavaScript
var logger = require('morgan');

scope.register({
    name: 'logger',
    factory: function () {
        return logger;
    }
});
```

Some developers say not to do it the way I'll demonstrate next, because lazy loading your modules can block the thread and cause other issues, but there are cases where this may be more desirable. For instance, if you are using the composition root pattern, require may be executed on startup, anyway.

```JavaScript
scope.register({
    name: 'logger',
    factory: function () {
        return require('morgan');
    }
});
```

### Registering modules that implement blueprints
If your module returns an object that implements a blueprint, you can name the blueprint(s) during module creation and take advantage of batch validation (see [Blueprint](https://github.com/Acatar/hilaryjs/wiki/Blueprint) for more information)

Assume we register the following Blueprints:
```JavaScript
scope.register({
    name: 'FooBlueprint',
    dependencies: ['hilary::Blueprint'],
    factory: function (Blueprint) {
        return new Blueprint({
            name: 'string'
        });
    }
});

scope.register({
    name: 'BarBlueprint',
    dependencies: ['hilary::Blueprint'],
    factory: function (Blueprint) {
        return new Blueprint({
            description: 'string'
        });
    }
});
```

Then, if we register the following modules that implement the above blueprints, they can be validated for signature implementation later.

```JavaScript
// register a module that implements a single blueprint
scope.register({
    name: 'foo',
    blueprint: 'FooBlueprint',
    factory: function () {
        return {
            name: 'Foo name'
        };
    }
});

// register a module that implements multipls blueprints
scope.register({
    name: 'foobar',
    blueprint: ['FooBlueprint', 'BarBlueprint'],
    factory: function () {
        return {
            name: 'Foo name',
            description: 'Bar description',
        };
    }
});
```
