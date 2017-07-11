###tl;dr
There are several combinations of registering modules that result in different behaviors.

> When using Hilary with Node.js, Hilary gracefully degrades to `require`, when a registered module is not found. There is no need to explicitly register built-in modules, such as `http`, or `crypto`, or to register the modules listed in your package.json.

> When using Hilary in the browser, Hilary gracefully degrades to `window`, when a registered module is not found. There is no need to explicitly register built-in modules, such as `File`, or `JSON`, or to register the modules added as globals by your app, such as `jQuery`.

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
// declared as false, or an empty array, Hilary will simply return the factory
// without executing it.
Hilary.scope('myScope').register({
    name: 'myModule',
    dependencies: false, // or [],
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

The next example is much like the first, but the factory accepts an argument but declares an empty dependency array, or sets `dependencies` to false. Hilary will return the function as-is, since there is no information to help satisfy the arguments. This is useful for creating factories and registering functions directly. Alternatively, you can omit the dependencies property and define a parameterless function that returns the function that accepts the expectation argument.

```JavaScript
Hilary.scope('myScope').register({
    name: 'myFactory',
    dependencies: false, // or [],
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
        dependencies: false, // or [],
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
When using Hilary with Node.js, Hilary gracefully degrades to `require`, when a registered module is not found. There is no need to explicitly register built-in modules, such as `http`, or `crypto`, or to register the modules listed in your package.json.

Yet, sometimes we have a need to register these modules. For instance, we may wish to choose which modules to inject, depending on environment variables. We may simply want to change the name of a module.

When registering Node.js modules that we would otherwise `require`, it is a best practice to register a factory that returns the result of the require function that is set to a variable outside of the factory. This approach reduces memory overhead in Hilary, and lets Node.js manage caching and garbage collection as it normally would.

```JavaScript
var logger = require('morgan');

scope.register({
    name: 'logger',
    factory: function () {
        return logger;
    }
});
```

Of course you can also just `return require('foo');` in your factory, too. However, this is a blocking call, and it may introduce undesirable latency at runtime.

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

Then, if we register the following modules that implement the above blueprints, we can validate these modules, using [batch validation](https://github.com/losandes/hilaryjs/wiki/Blueprint#batch-validation), [onComposed](https://github.com/losandes/hilaryjs/wiki/Bootstrapper#finally---oncomposed).

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

// register a module that implements multiple blueprints
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