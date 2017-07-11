There are several ways to register singletons. Below we'll illustrate several registration techniques that result in a single instance of your module being resolved per application lifecycle.

The easiest way to register a module as a singleton in Hilary is to set the ``singleton`` property to ``true`` in the module definition. This approach is necessary if you are loading modules out of order, and your module has dependencies. The singleton will be created the first time this module is resolved. Note that, while a single instance will be used upon successful requests, this singleton pattern does not provide stateful singularity. because dependents receive the singleton through arguments in their function, they are operating on a copy.

```JavaScript
// mySingleton.js
scope.register({
    name: 'mySingleton',
    singleton: true,                            // this tells hilary to 
    dependencies: ['someDependency'],           // only ever resolve one
    factory: function (someDependency) {        // instance of this module
        return {
            state: someDependency.getState()
        };
    }
});
```

To create a stateful singleton, the object that tracks your state must exist outside of your factory:

```JavaScript
(function (scope) {
    'use strict';
    
    var state = {};

    scope.register({
        name: 'statefulSingleton',
        singleton: true,
        factory: function () {
            var self = {
                    get: undefined,
                    set: undefined,
                    exists: undefined,
                    dispose: undefined
                };

            self.get = function (uid) {
                return state[uid];
            };

            self.set = function (courseUid, value) {
                state[uid] = value;
            };

            self.exists = function (courseUid) {
                return state[uid];
            };

            self.dispose = function (uid) {
                if (typeof uid === 'string') {
                    sate[uid] = null;
                } else {
                    state = {};
                }
            };

            return self;
        }
    });
    
}(Hilary.scope('example')));
```

Singletons can also be registered by passing an object literal into the factory argument. This is useful if your module has no dependencies, if you are registering things like constants, or if you want to wrap your registration in an iffe to give properties application lifecycle state. The singleton will be created upon registration.

```JavaScript
// mySingleton.js
scope.register({
    name: 'mySingleton',
    factory: {           // register an object literal
        state: 'on'
    }
});
```

Modules that are registered with factories that accept arguments, but have an empty array assigned to dependencies are also treated as singletons. This is useful if your module has no dependencies, if you are registering things like constructors, or if you want to wrap your registration in an iffe to give properties application lifecycle state. The singleton will be created upon registration.

```JavaScript
// myCtor.js
scope.register({
    name: 'MyCtor',
    dependencies: [],            // set the dependencies to an empty array
    factory: function (arg1) {   // and accept an argument in the factory
        return {
            state: arg1
        };
    }
});
```

Maybe you're writing a node express app, and you want a single instance of express to be used by your modules:

```JavaScript
scope.register('app', express());
```

### Avoiding Singletons
Singletons can cause all kinds of hard to solve problems in your code base due to the static/shared state of a singleton module. Always consider the negative paths that are possible when you register a singleton. Following are examples of how to avoid singletons, when you need to. We'll skip the one where you just don't declare ``singleton: true``.

Perhaps you need to register an object literal, but the values of that object are not constant. You wouldn't want a singleton for that, and it's easy to avoid by wrapping the object in a function. The following module will return a fresh copy of the object each time it is resolved.

```JavaScript
scope.register({
    name: 'myObject',
    factory: function () {
        return {
            state: '{{name}}: on'
        };
    }
});
```

Perhaps you need to register a constructor, and your module includes private properties outside of the constructor function. The following module will return a fresh copy of the constructor each time it is resolved.

```JavaScript
scope.register({
    name: 'MyCtor',
    factory: function () {
        var state = 'on',
            setState,
            getState;

        setState = function (newState) {
            state = newState === 'off' ? 'off' : 'on';
        };

        getState = function () {
            return state;
        };

        return function (options) {   // return the constructor
            options = options || {};
            setState(options.state);

            return {
                getState: getState,
                setState: setState
            };
        };
    }
});
```