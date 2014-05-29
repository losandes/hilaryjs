hilary.js
========

hilary.js is a simple JavaScript IoC container.  hilary's aim is to deliver low-ceremony dependency injection, to aid in decoupling JavaScript modules and testing.  It's named after Hilary Page, who designed building blocks that later became known as Legos.

##The singleton container, and constructors

hilary exists on window, as a singleton, and you can use it directly.  Most of the examples assume that is your use case.  hilary also provides construction of new instances: parent containers, as well as child containers, for scoping.

```JavaScript
var container = hilary.createContainer();
var child = container.createChildContainer();
```

The constructors accept a single argument that you may never need to use because most of hilary's dependencies are registered as modules: options.

```JavaScript
var container = hilary.createContainer({
  utils: myUtilityOverride,
  exceptions: myExceptionsOverride,
  container: { alreadyComposed: function() {  
      return 'you can pass in an existing object literal to get started if you want.';
    }  
  }
});
```

##Registering modules

We register single modules by name:

```JavaScript
hilary.register('myModule', function() {
  return 'hello world!';
});

hilary.register('myOtherModule', function(myModule) {
  return myModule();
});
```

If you have more complex needs, want to register something other than a function, such as an object literal, or you just want to write pure JavaScript, you can register modules directly against the conatainer.  This feature can easily be misused (i.e. using the container for Service Location).  We recommend keeping it simple, and only use the container for registration.

```JavaScript
hilary.register(function(container) {
  container.moduleWithInnerRegistration = function() {
    var complex = doSomeReallyComplexStuff();
    container.getComplex = function() {
      return complex;
    };
  };
});
```

##Resolving modules

Resolving modules simply returns the registered function or object.  Invocation is in the scope of the caller.  We recommend doing all resolving in a single module (i.e. compositionRoot.js).

Resolving is recursively hierarchical, so if you attempt to resolve a module in a child container, and the child container does not have a registration, but the parent container does, the module from the parent will be returned.

```JavaScript
var myModule = hilary.resolve('myModule'),
    myOtherModule = hilary.resolve('myOtherModule');

myOtherModule(myModule);
```

Or, if you prefer to resolve many at once:

```JavaScript
hilary.resolve(['myModule', 'myOtherModule'], function (myModule, MyOtherModule) {
  myOtherModule(myModule);
});
```
If you need access to the container or its parent, when resolving many, there are key names for that:

```JavaScript
hilary.resolve(['hilary::container', 'hilary::parent'], function (container, parent) {
  // ...
});
```

##The Pipeline

There are several before and after events that you can tie into, to extend hilary.  All of these events can be leveraged by registering a function with the appropriate key name.

###The before register event

Before a module is registered, the "hilary::before::register" event is fired, if a function is registered. It accepts three arguments: 

```
@param container: the current container
@param moduleName (string or function): the name of the module or a function that accepts a single parameter: container
@param moduleDefinition (object literal or function): the module definition
```

```JavaScript
hilary.register('hilary::before::register', function(container, moduleNameOrFunc, moduleDefinition) {
  $(document).trigger('registering:' + moduleNameOrFunc);
});
```

###The after register event

After a module is registered, the "hilary::after::register" event is fired, if a funciton is registered. It accepts the same arguments as the "hilary::before::register" event.
```JavaScript
hilary.register('hilary::after::register', function(container, moduleNameOrFunc, moduleDefinition) {
  $(document).trigger('registered:' + moduleNameOrFunc);
});
```

###The before resolveOne event

Before each dependency is resolved, the "hilary::before::resolve::one" event is fired, if a function is registered. It accepts two arguments:

```
@param container: the current container
@param moduleName (string): the qualified name that the module can be located by in the container
```

```JavaScript
hilary.register('hilary::before::resolve::one', function(container, moduleName) {
  $(document).trigger('resolving:' + moduleName);
});
```

###The before resolve event

Before any dependencies are resolved, the "hilary::before::resolve" event is fired, if a function is registered. If you also register the "hilary::before::resolve::one" event, both events will fire.  This module accepts three arguments:

```
@param container: the current container
@param moduleNameOrDependencies (string or array of string): the qualified name that the module can be located by in the container or an array of qualified names that the modules can be located by in the container
@param callback (function): if the first argument is an array, then the resolved dependencies will be passed into the callback function in the order that they exist in the array
```

```JavaScript
hilary.register('hilary::before::resolve', function(container, moduleNameOrDependencies, callback) {
  if (typeof(moduleNameOrDependencies) === 'string')
    $(document).trigger('resolving:' + moduleNameOrDependencies);
});
```

###The after resolve event

After the module(s) are resolved, the "hilary::after::resolve" event is fired, if a function is registered. It accepts the same arguments as the "hilary::before::resolve" event.

```JavaScript
hilary.register('hilary::after::resolve', function(container, moduleNameOrDependencies, callback) {
    if (typeof(moduleNameOrDependencies) === 'string')
      $(document).trigger('resolved:' + moduleNameOrDependencies);
});
```
###The before new child event

Before a new child container is created, the "hilary::before::new::child" event is fired, if a function is registered. It accepts two arguments:

```
@param container: the current container
@param options: any options that were passed into createChildContainer
```

```JavaScript
hilary.register('hilary::before::new::child', function (container, options) {
  $(document).trigger('creatingChildContainer');
});
```

###The after new child event

After a new child container is created, the "hilary::after::new::child" event is fired, if a function is registered. It accepts three arguments:

```
@param container: the current container
@param options: any options that were passed into createChildContainer
@param child: the new child hilary instance
```

```JavaScript
hilary.register('hilary::after::new::child', function (container, options, child) {
  $(document).trigger('createdChildContainer');
});
```


