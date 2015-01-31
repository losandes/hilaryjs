hilary.js
========

hilary.js is a simple JavaScript IoC container.  hilary's aim is to deliver low-ceremony dependency injection, to aid in decoupling JavaScript modules and testing.  It's named after Hilary Page, who designed building blocks that later became known as Legos.

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
    child = hilary.createChildContainer();
```

##Registering modules

We register single modules by name:

```JavaScript
hilary.register('myModule', function() {
    return 'hello world!';
});

hilary.register('myOtherModule', {
    message: 'do something!'
});

hilary.register('myHilaryModule', new HilaryModule(['myModule', 'myOtherModule'], 
    function (myModule, myOtherModule) {
        return {
            go: function () {
                console.log(myModule());                // prints 'hello world!'
                console.log(myOtherModule.message);     // prints 'do something!'
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

When composing the application, you can register a factory that uses the other modules to expose a decoupled interface (note you should only resolve your dependencies in a composition root, otherwise you are using the service-location anti-pattern):

```JavaScript
hilary.register('echoFactory', function(saySomething) {
  var _echo = hilary.resolve('echo');
  var _saySomething = hilary.resolve('saySomething');
  return _saySomething(_echo, saySomething);
});
```

Then, a module that depends on ``echoFactory`` can use the factory without knowing anything about the modules the factory depends on.

```JavaScript
hilary.register('someModule', new HilaryModule(['echoFactory'], function(echo) {
    echo('hello world!');
});
```

##Resolving modules

Resolving modules simply returns the registered function or object.  Invocation is in the scope of the caller.  We recommend doing all resolving in a single module (i.e. compositionRoot.js).

Resolving is recursively hierarchical, so if you attempt to resolve a module in a child container, and the child container does not have a registration, but the parent container does, the module from the parent will be returned. Building on the registration example from above:

```JavaScript
var myModule = hilary.resolve('myModule'),
    myOtherModule = hilary.resolve('myOtherModule');

console.log(myModule());
console.log(myOtherModule.message);
```

Or simply:

```JavaScript
var myHilaryModule = hilary.resolve('myHilaryModule');
myHilaryModule.go();
```

If you need access to the container or its parent, there are key names for that:

```JavaScript
var modules = hilary.resolve('hilary::container'),
    parent = hilary.resolve('hilary::parent');
```

##AMD

The AMD extension adds Asynchronous Module Definition specification conventions to Hilary. If you choose to use that extenion, five variables will be added as globals: ``define``, ``require``, ``AMDContainer``, ``Hilary``, and ``HilaryModule``. In order to meet the spec, we had to introduce a global container, ``AMDContainer``. It is an instance of Hilary, so you can access it and take advantage of non-AMD Hilary features if needed. ``define`` and ``require`` exist on each container, so you can also use the AMD conventions with scope, too.

```
var hilary = new Hilary();

hilary.define('myFactory', function(arg) {
    console.log(arg);
});

hilary.require(['myFactory'], function (factory) {
    factory('hello world!');
});
```

###Define

With AMD, registrations look like this:

```
// with AMD, functions are executed when they are resolved
define('myModule', function() {
    return {
        message: 'hello world!'
    };
});

// unless the function accepts an argument without declaring dependencies
define('myFactory', function(arg) {
    console.log(arg);
});

// you can define object literals in multiple ways
define('myOtherModule', {
    message: 'do something!'
});

define({ 
    myLiteral: {
        message: 'literally!'
    }
});

// and you can require dependencies by passing an array argument
define('myHilaryModule', ['myModule', 'myOtherModule', 'myFactory', 'myLiteral'], 
    function (myModule, myOtherModule, myFactory, myLiteral) {
        return {
            go: function () {
                console.log(myModule.message);          // prints 'hello world!'
                console.log(myOtherModule.message);     // prints 'do something!'
                myFactory('say something!');            // prints 'say something!'
                console.log(myLiteral.message);         // prints 'literally!'
            }
        };
});

// or by defining an anonymous function that accepts the require, exports and module arguments
define(function (require, exports, module) {
    var myModule = require('myModule'),
        myFactory = require('myFactory');
    
    exports.myAnonModule = {
        go: function () {
            console.log(myModule.message);          // prints 'hello world!'
            myFactory('say something!');            // prints 'say something!'
        }
    };
});
```

###Require

Resolving with require:

```JavaScript
require(function (require, exports, module) {
    var myModule = require('myModule'),
        myOtherModule = require('myOtherModule');
    
    console.log(myModule.message);
    console.log(myOtherModule.message);
});
```

Or:

```JavaScript
require(['myHilaryModule'], function (myHilaryModule) {
    myHilaryModule.go();
});
```

##The Pipeline

There are several before and after events that you can tie into, to extend hilary.  All of these events can be leveraged by registering a function with the appropriate key name.

###The before register event

Before a module is registered, the "hilary::before::register" event is fired, if a function is registered. It accepts three arguments: 

```
@param container: the current container
@param moduleName (string): the name of the module
@param moduleDefinition (object literal, function, or HilaryModule): the module definition
```

```JavaScript
hilary.registerEvent('hilary::before::register', function(container, moduleName, moduleDefinition) {
    $(document).trigger('registering::' + moduleName);
});
```

###The after register event

After a module is registered, the "hilary::after::register" event is fired, if a funciton is registered. It accepts the same arguments as the "hilary::before::register" event.
```JavaScript
hilary.registerEvent('hilary::after::register', function(container, moduleName, moduleDefinition) {
    $(document).trigger('registered::' + moduleName);
});
```

###The before resolve event

Before a module is resolved, the "hilary::before::resolve" event is fired, if a function is registered. This module accepts three arguments:

```
@param container: the current container
@param moduleName (string): the qualified name that the module can be located by in the container
```

```JavaScript
hilary.registerEvent('hilary::before::resolve', function(container, moduleName) {
    $(document).trigger('resolving::' + moduleName);
});
```

###The after resolve event

After the module(s) are resolved, the "hilary::after::resolve" event is fired, if a function is registered. It accepts the same arguments as the "hilary::before::resolve" event.

```JavaScript
hilary.registerEvent('hilary::after::resolve', function(container, moduleName) {
    $(document).trigger('resolved::' + moduleName);
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

###Limiting an event to one execution

Sometimes we only want an eventHandler to be executed once. All event handlers that are registered in Hilary can be configured to behave this way by adding a ``once`` property to the eventHandler.

```JavaScript
var eventHandler = function(container, moduleName) {
    if (moduleName === 'someAsyncModule') {
        // do something
    }
};
eventHandler.once = true;

hilary.registerEvent('hilary::after::resolve', eventHandler);
```
