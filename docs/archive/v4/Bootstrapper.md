Hilary includes a Bootstrapper to help you compose and startup your app. The Bootstrapper has a simple (a)synchronous pipeline with the following components, which are listed in the order in which they are executed.

1. composeLifecycle
2. composeModules
3. onComposed

None of the components are required when Bootstrapping Hilary, and each component works with or without accepting arguments. 

### Synchronous Bootstrapping

The following example takes advantage of all of these features, synchronously:

```JavaScript
Hilary.scope('app').Bootstrapper({
    composeLifecycle: function (err, scope, pipeline) {
        pipeline.register.before.register(function (err, data) {
            console.log('app::before::register', data.moduleInfo);
        });
    },    
    composeModules: function (err, scope) {
        var singleton = 'hello world!';
        scope.register({ 
            name: 'someSingleton',
            factory: function () { 
                return singleton; 
            } 
        });
    },
    onComposed: function (err, scope) {
        console.log(scope.resolve('someSingleton'));
    }
});
```

### Asynchronous Bootstrapping

The next example shows how you might proceed if you need to take advantage of the async features. 

> Note that if you request the next argument, you must execute it for the pipeline to continue. Simply omit it from your function args if you don't want/need to do that.

```JavaScript
Hilary.scope('app').Bootstrapper({
    composeLifecycle: function (err, scope, pipeline, next) {
        $.get('/pipelines', function (asyncData) {
            pipeline.register.before.register(function (err, eventData) {
                console.log('app::before::register', {
                    eventData: eventData,
                    asyncData: asyncData
                });
            });            
            
            next(err, scope);            
        });
    },    
    composeModules: function (err, scope, next) {
        var singleton = 'hello world!';
        
        $.get('/modules', function (asyncData) {
            scope.register({ 
                name: 'someSingleton', 
                factory: function () { 
                    return { 
                        singleton: singleton, 
                        data: asyncData 
                    }; 
                } 
            });
            
            next(err, scope);
        });
    },
    onComposed: function (err, scope) {
        console.log(scope.resolve('someSingleton'));
    }
});
```

### Composing the lifecycle
The first function in the pipeline gives you the ability to compose the lifecycle. This is first so you can register your events before module composition, and especially to define your error handling (Hilary does not throw errors - it emits them). ``composeLifecycle`` receives up to four arguments:

- **err** (Error): an error object, if an error occurred earlier in the pipeline
- **scope** (Hilary.scope): The current [scope](/Acatar/hilaryjs/wiki/Creating-Containers-(scopes)-and-Child-Containers)
- **pipeline** (Object): the [pipeline](/Acatar/hilaryjs/wiki/The-Pipeline) for the current scope
- **next** (Function): gives you the ability to control when the next event in the pipeline is executed (this must be executed for the pipeline to continue!)

### Composing modules
Module composition occurs after the lifecycle is defined, in the ``composeModules`` function. This represents the ["root" of your composition](http://blog.ploeh.dk/2011/07/28/CompositionRoot/), and is meant to be used to declare/affect your dependency graph (i.e. modules that ask for IFoo receive the SpecialFoo implementation). It is It receives up to three arguments:

- **err** (Error): an error object, if an error occurred earlier in the pipeline
- **scope** (Hilary.scope): The current [scope](/Acatar/hilaryjs/wiki/Creating-Containers-(scopes)-and-Child-Containers)
- **next** (Function): gives you the ability to control when the next event in the pipeline is executed (this must be executed for the pipeline to continue!)

> Note that if you need to resolve something in ``composeModules``, you should use a factory pattern. No modules should be resolved directly in ``composeModules``, as it implies that the order in which modules are loaded and registered matters.

```JavaScript
// Hilary.scope('app').Bootstrapper({
//    composeLifecycle: ...

    composeModules: function (err, scope) {
        scope.register({ 
            name: 'IFoo',
            factory: function () { 
                return scope.resolve('SpecialFoo'); 
            } 
        });
    },

//    onComposed: ...
// });
```

### Finally - onComposed

At the end of the pipeline, ``onComposed`` is called. This is where you start your app, and the point at which it is safe to start resolving modules. It is It receives two arguments:

- **err** (Error): an error object, if an error occurred earlier in the pipeline
- **scope** (Hilary.scope): The current [scope](/Acatar/hilaryjs/wiki/Creating-Containers-(scopes)-and-Child-Containers)