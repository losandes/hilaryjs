hilary.js
========

hilary.js is a simple JavaScript IoC container.  hilary's aim is to deliver low-ceremony dependency injection, to aid in decoupling JavaScript modules and testing.  It's named after Hilary Page, who designed building blocks that later became known as Legos.

Most of the basics are covered here. For a deeper understanding of how to use hilary to compose your app, check out 
our [getting started](http://acatar.github.io/hilary/gettingStarted/) example or our [getting started with AMD](http://acatar.github.io/hilary/gettingStartedWithRequire/) example.

##Including hilary in your web app
hilary does not depend on other libraries. All you need to do to use it in a web app is include it in a script tag.
```
<script type="text/javascript" src="hilary.min.js"></script>
```

##Creating containers
We create containers to compartmentalize our modules. it is normal to have a single container for an app, but you can also create as many containers as needed. Creating a container is simple:

```JavaScript
var hilary = new Hilary(),
    hilary2 = new Hilary();
```

The constructors accept a single argument, ``options``. You may never need to use this because most of hilary's dependencies are registered as modules. The options allow the caller to define handlers for features that need to be in place before the first registration occurs, such as exceptions (i.e. throw argumentException) and utilities (i.e. isFunction). Overrides must match the signature of the module they are overriding.

```JavaScript
var hilary = new Hilary({
  utils: myUtilityOverride,
  exceptions: myExceptionsOverride
});
```

###Creating child containers
Containers may also have child containers, for scoping.

```JavaScript
var hilary = new Hilary(),
    child = container.createChildContainer();
```

##Registering modules

We register single modules by name:

```JavaScript
hilary.register('myModule', function() {
    return 'hello world!';
});

hilary.register('myOtherModule', {
    message: 'do something!';
});

hilary.register('myHilaryModule', new HilaryModule(['myModule', 'myOtherModule'], 
    function (myModule, myOtherModule) {
        return {
            go: function () {
                myModule();             // prints 'hello world!'
                myOtherModule.message;  // prints 'do something!'            
            }
        };
}));
```

Notice that several options exist when registering modules. If the module has no dependencies, or if you intend to resolve the dependencies manually, you can register the module definition as a function or object literal. If you want hilary to auto-resolve a modules dependencies, and cascade through the dependency graph, then you have to register the module as in instance of HilaryModule.

HilaryModules accept two arguments: a dependency array, and a module definition. The dependency array should include the name of the modules that the current module depends on. The module definition should accept the resolved modules as arguments, in the same order that they are listed in the dependency array.

###Registering factories

You can register factories too.  If you have modules with arguments that should be new instances every time, factories can be used to keep all of the container logic in one module: your composition root.

Let's say you register the following modules.
```JavaScript
hilary.register('echo', function() {
  return 'echo: ';
});

hilary.register('saySomething', function(echo, saySomething) {
  return echo() + saySomething;
}); 
```

When composing the application, you can register a factory that uses the other modules to expose a decoupled interface:

```JavaScript
hilary.register('echoFactory', function(saySomething) {
  var _echo = hilary.resolve('echo');
  var _saySomething = hilary.resolve('saySomething');
  return _saySomething(_echo, saySomething);
});
```

Then, a module that depends on ``echoFactory`` can use the factory without knowing anything about the modules the factory depends on.

```JavaScript
hilary.register('someModule', new HilaryModule(['echoFactory'], function(echoFactory) {
    echoFactory('hello world!');
});
```

##Resolving modules

Resolving modules simply returns the registered function or object.  Invocation is in the scope of the caller.  We recommend doing all resolving in a single module (i.e. compositionRoot.js).

Resolving is recursively hierarchical, so if you attempt to resolve a module in a child container, and the child container does not have a registration, but the parent container does, the module from the parent will be returned. Building on the registration example from above:

```JavaScript
var myModule = container.resolve('myModule'),
    myOtherModule = container.resolve('myOtherModule');

myModule();
myOtherModule.message;
```

Or simply:

```JavaScript
var myHilaryModule = container.resolve('myHilaryModule');
myHilaryModule.go();
```

If you need access to the container or its parent, when resolving many, there are key names for that:

```JavaScript
var modules = container.resolve('hilary::container'),
    parent = container.resolve('hilary::parent');
```

##The Pipeline

There are several before and after events that you can tie into, to extend hilary.  All of these events can be leveraged by registering a function with the appropriate key name.

###The before register event

Before a module is registered, the "before::register" event is fired, if a function is registered. It accepts three arguments: 

```
@param container: the current container
@param moduleName (string or function): the name of the module or a function that accepts a single parameter: container
@param moduleDefinition (object literal or function): the module definition
```

```JavaScript
container.registerEvent('before::register', function(container, moduleNameOrFunc, moduleDefinition) {
  $(document).trigger('registering::' + moduleNameOrFunc);
});
```

###The after register event

After a module is registered, the "after::register" event is fired, if a funciton is registered. It accepts the same arguments as the "before::register" event.
```JavaScript
container.registerEvent('after::register', function(container, moduleNameOrFunc, moduleDefinition) {
  $(document).trigger('registered::' + moduleNameOrFunc);
});
```

###The before resolve event

Before a module is resolved, the "before::resolve" event is fired, if a function is registered. This module accepts three arguments:

```
@param container: the current container
@param moduleName (string or array of string): the qualified name that the module can be located by in the container or an array of qualified names that the modules can be located by in the container
@param callback (function): if the first argument is an array, then the resolved dependencies will be passed into the callback function in the order that they exist in the array
```

```JavaScript
container.registerEvent('before::resolve', function(container, moduleNameOrDependencies, callback) {
  if (typeof(moduleNameOrDependencies) === 'string')
    $(document).trigger('resolving::' + moduleNameOrDependencies);
});
```

###The after resolve event

After the module(s) are resolved, the "hilary::after::resolve" event is fired, if a function is registered. It accepts the same arguments as the "hilary::before::resolve" event.

```JavaScript
hilary.registerEvent('hilary::after::resolve', function(container, moduleNameOrDependencies, callback) {
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
hilary.registerEvent('hilary::before::new::child', function (container, options) {
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
hilary.registerEvent('hilary::after::new::child', function (container, options, child) {
  $(document).trigger('createdChildContainer');
});
```
