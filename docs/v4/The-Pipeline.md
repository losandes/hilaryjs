Hilary emits several events, which you can register handlers for. Each event supports multiple handlers, which are executed in the order in which they were registered. The handlers pass an error argument, and a payload onto the next handler/step in the pipeline, so there is opportunity to affect an operations outcome (i.e. you could load data or JavaScript from a server before continuing, or post a log message).

### tl;dr

#### Handlers
* pipeline.before.register(err, data, next)
* pipeline.after.register(err, data, next)
* pipeline.before.resolve(err, data, next)
* pipeline.after.resolve(err, data, next)
* pipeline.before.newChild(err, data, next)
* pipeline.after.newChild(err, data, next)
* pipeline.on.error(err)

#### Params
- @param **err** (Error): an exception if one was passed from earlier in the pipeline
- @param **data** (Object): the payload of the data argument depends on the event (details provided per event)
- @param **next** (Function)(optional): When next is declared in your routeHandler, it must be executed to continue the pipeline. This gives you the opportunity to run asynchronous operations in your handler.

> note that the examples in this article comment out the ``composeLifecycle`` function of a ``Bootstrapper``. This is to illustrate that the recommended way to register events is in the ``composeLifecycle`` function. The pipeline can also be found at ``scope.getContext().pipeline``. 

> ``scope.registerEvent`` is deprecated.

### Registering a before-register event
Before a module is registered, the ``hilary::before::register`` event is triggered. The data payload includes:

```
@param scope: the current scope
@param moduleInfo (HilaryModule): the module definition
```

```JavaScript
// scope.Bootstrapper({
//    composeLifecycle: function (err, scope, pipeline) {

        pipeline.before.register(function (err, data) {
            $(document).trigger('registering::' + data.moduleInfo.name);
        });

//    }
// });
```

### Registering an after-register event
After a module is registered, the ``hilary::after::register`` event is triggered. The data payload includes:

```
@param scope: the current scope
@param moduleInfo (HilaryModule): the module definition
```

```JavaScript
// scope.Bootstrapper({
//    composeLifecycle: function (err, scope, pipeline) {

        pipeline.register.after.register(function (err, data) {
            $(document).trigger('registered::' + data.moduleInfo.name);
        });

//    }
// });
```

### Registering a before-resolve event
Before a module is resolved, the ``hilary::before::resolve`` event is triggered. The data payload includes:

```
@param scope: the current scope
@param moduleName (string): the qualified name that the module can be located by in the scope
```

```JavaScript
// scope.Bootstrapper({
//    composeLifecycle: function (err, scope, pipeline) {

        pipeline.register.before.resolve(function (err, data) {
            $(document).trigger('resolving::' + data.moduleName);
        });

//    }
// });
```

### Registering an after-resolve event
After a module is resolved, the ``hilary::after::resolve`` event is triggered. The data payload includes:

```
@param scope: the current scope
@param moduleName (string): the qualified name that the module can be located by in the scope
@param result (object): the module that was resolved
```

```JavaScript
// scope.Bootstrapper({
//    composeLifecycle: function (err, scope, pipeline) {

        pipeline.register.after.resolve(function (err, data) {
            $(document).trigger('resolved::' + data.moduleName);
        });

//    }
// });
```

### Registering a before-new-child event
Before a new child container is created, the ``hilary::before::new::child`` event is triggered. The data payload includes:

```
@param scope: the current scope
@param options: any options that were passed into createChildContainer
```

```JavaScript
// scope.Bootstrapper({
//    composeLifecycle: function (err, scope, pipeline) {

        pipeline.register.before.newChild(function (err, data) {
            $(document).trigger('creatingChildContainer');
        });

//    }
// });
```

### Registering an after-new-child event
After a new child container is created, the ``hilary::after::new::child`` event is triggered. The data payload includes:

```
@param scope: the current scope
@param options: any options that were passed into createChildContainer
@param child: the new child hilary instance
```

```JavaScript
// scope.Bootstrapper({
//    composeLifecycle: function (err, scope, pipeline) {

        pipeline.register.after.newChild(function (err, data) {
            $(document).trigger('creatingChildContainer');
        });

//    }
// });
```

### Registering an error event
When an error is encountered, the ``hilary::error`` event is triggered. The err argument of this may be manipulated from its original form: Hilary attempts to transform errors into JavaScript Error objects.

For instance, if the error, ``{ status: 500, message: 'whoops!' }``, is passed through the pipeline and Hilary emits that error, ``err.message`` would equal 'whoops!' and ``err.data`` would equal ``{ status: 500, message: 'whoops!' }``.

```JavaScript
// scope.Bootstrapper({
//    composeLifecycle: function (err, scope, pipeline) {

        pipeline.register.on.error(function (err) {
            $(document).trigger('error');
        });

//    }
// });
```

### The PipelineEvent
You can just register a function as an event handler, when registering pipeline events. When you need to register a more complex eventHandler, it's best to do this with a ``PipelineEvent``. PipelineEvents accept one argument with the following acceptable properties:

- **eventHandler** (Function): The action to be taken when the event is triggered. It accepts up to three arguments: ``err``, ``data``, ``next``:
    - *err*: any error passed from earlier in the PipelineEvents
    - *data*: the payload varies by event type
    - *next*: a callback function for async operations. When this argument is present, it must be called to continue the pipeline, otherwise, the operation will never complete.
- **once** (Boolean): when true, this event will be removed after the first time it is triggered.  
- **remove** (Function): When this function returns true, the eventHandler will be removed from the pipeline, and will not be triggered again. It accepts two arguments:
    - *err*: any error passed from earlier in the PipelineEvents
    - *data*: the payload varies by event type

> note that ``once`` and ``remove`` are not intended to be used together. ``once`` trumps ``remove``.

###Limiting an event to one execution

Sometimes we only want an eventHandler to be executed once. All event handlers that are registered in Hilary can be configured to behave this way by adding a ``once`` property to the eventHandler.

```JavaScript
// new Hilary().Bootstrapper({
//     composeLifecycle: function (err, scope, pipeline) {

        pipeline.register.after.resolve(new scope.PipelineEvent({
            eventHandler: function(err, data) {
                if (data.moduleName === 'someAsyncModule') {
                    // do something
                }
            },
            once: true
        }));

//    }
// });
```

### Removing events after they execute

Deciding whether or not an event can be removed is not always as simple as the ``once`` feature. To conditionally remove an event after it is triggered, use the ``remove`` feature. When ``remove`` returns true, the event will be removed from the pipeline and will not be triggered again.

```JavaScript
// new Hilary().Bootstrapper({
//    composeLifecycle: function (err, scope, pipeline) {

        pipeline.register.after.register(new scope.PipelineEvent({
            eventHandler: function(err, data) {
                if (data.moduleInfo.name === 'someAsyncModule') {
                    // do something
                }
            },
            // remove: when
            remove: function (err, data) {
                if (data.moduleInfo.name === 'someAsyncModule') {
                    return true;
                }
            }
        }));

//    }
// });
```