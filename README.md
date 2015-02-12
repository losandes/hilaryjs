hilary.js
========

hilary.js is a simple JavaScript IoC container written for Node.js and the browser.  hilary's aim is to deliver low-ceremony dependency injection, to aid in decoupling JavaScript modules and testing.  It's named after Hilary Page, who designed building blocks that later became known as Legos.

##Installing hilary in Node
```
npm install hilary
```

Then in your node module:

```
var Hilary = require('hilary');

var scope = new Hilary();
var hilaryModule = new Hilary.HilaryModule(['foo'], function (foo) { /*[CODE]*/ });
```

##Including hilary in your web app
hilary does not depend on other libraries. All you need to do to use it in a web app is include it in a script tag.

```
<script type="text/javascript" src="hilary.min.js"></script>
```

##The AMD extensions
By default, hilary's ``register`` and ``resolve`` functions accept AMD style arguments. AMD syntax, ``define`` and ``register``, can be added with the AMD extension. Note that hilary AMD excludes module loading. We might add a loader extension for that in the future - let us know if that's important to you via Github issues.

```
<script type="text/javascript" src="hilary.amd.min.js"></script>
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
  exceptions: myExceptionsOverride,
  lessMagic: true
});
```

###Creating child containers
Containers may also have child containers, for scoping.

```JavaScript
var hilary = new Hilary(),
    child = hilary.createChildContainer();
```

##Registering modules

We register single modules by name. There are several options for registering modules. This first example has no dependencies and will be executed upon being resolved.

```JavaScript
hilary.register('myModule', function() {
    return 'do something!';
});
```

The next example is much like the first, but it accepts and argument without declaring its dependencies. Hilary will return the function as-is, since it has no information to satisfy the arguments. This is useful for creating factories and registering functions directly.

```JavaScript
hilary.register('myFactory', function(expectation) {
    return expectation;
});
```

You can register object literals:

```JavaScript
hilary.register('myOtherModule', {
    message: 'say something!'
});

// is the same as

hilary.register({
    myOtherModule: {
        message: 'say something!'
    }
});
```

This example registers a module that declares its dependencies. When the module is resolved, Hilary will resolve the dependencies, cascade through the dependency graph, and pass the resolved dependencies into the factory as arguments.

```JavaScript
hilary.register('myHilaryModule', ['myModule', 'myFactory', 'myOtherModule'],
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
```

If the dependency array syntax doesn't work for you, you can resolve inline, however this takes the Async out of AMD: it's executed immediately so the dependencies are expected to already be loaded on the container.

```JavaScript
hilary.register(function (resolve, exports, module) {
    var myModule = resolve('myModule'),
        myFactory = resolve('myFactory'),
        myOtherModule = resolve('myOtherModule');
    
    exports.myAnonModule = {
        go: function () {
            console.log(myModule);                       // prints 'do something!'
            console.log(myFactory('expect something!')); // prints 'expect something!'
            console.log(myOtherModule.message);          // prints 'say something!'
        }
    };
});
```

Now - to put it all together:

```JavaScript
var hilary = new Hilary();

hilary.register('myModule', function() {
    return 'do something!';
});

hilary.register('myFactory', function(expectation) {
    return expectation;
});

hilary.register('myOtherModule', {
    message: 'say something!'
});

hilary.register('myHilaryModule', ['myModule', 'myFactory', 'myOtherModule'],
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

hilary.resolve('myHilaryModule').go();
```

##Resolving modules

Resolving modules simply returns the registered function or object.  Invocation is in the scope of the caller.  We recommend doing all resolving in a single module (i.e. compositionRoot.js). Building on the registration example from above:

```JavaScript
hilary.resolve(['myModule', 'myFactory', 'myOtherModule'],
    function (myModule, myFactory, myOtherModule) {
        console.log(myModule);                       // prints 'do something!'
        console.log(myFactory('expect something!')); // prints 'expect something!'
        console.log(myOtherModule.message);          // prints 'say something!'
    }
);
```

If you need access to the container or its parent, there are key names for that:

```JavaScript
var modules = hilary.resolve('hilary::container'),
    parent = hilary.resolve('hilary::parent');
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

##Registering modules :: Less Magic

If you want more control over the Dependency Inversion, we recommend using the ``lessMagic`` argument. This replaces the ``register`` and ``resolve`` arguments with simpler counterparts, and gives you more control over auto-resolution.

```JavaScript
var hilary = new Hilary({ lessMagic: true });

hilary.register('myModule', function() {
    return 'hello world!';
});

hilary.register('myFactory', function(expectation) {
    return expectation;
});

hilary.register('myOtherModule', {
    message: 'do something!'
});
```

Notice these three examples match the AMD style examples above, however there is a significant difference with resolution. The ``myModule`` registration with the parameterless factory will NOT be executed upon resolution. The function itself will be returned.

You can still take advantage of auto-resolution if you want to: by registering a HilaryModule. HilaryModules accept two arguments: a dependency array, and a module definition. The dependency array should include the name of the modules that the current module depends on. The module definition should accept the resolved modules as arguments, in the same order that they are listed in the dependency array.

```JavaScript
hilary.register('myHilaryModule', new HilaryModule(['myModule', 'myFactory', 'myOtherModule'],
    function (myModule, myFactory, myOtherModule) {
        return {
            go: function () {
                console.log(myModule);                       // prints 'do something!'
                console.log(myFactory('expect something!')); // prints 'expect something!'
                console.log(myOtherModule.message);          // prints 'say something!'
            }
        };
    }
));
```

You can also mix and match syntax styles by using the AMD versions of register and resolve (``hilary.amd.register`` and ``hilary.amd.resolve``) on a lessMagic container, but we recommend picking one and sticking with it.

##Resolving modules :: Less Magic

Resolving modules on a lessMagic container simply returns the registered function or object.

Invocation, scope, and container hierarchies are the same as with the AMD containers.

```JavaScript
var myModule = hilary.resolve('myModule'),
    myFactory = hilary.resolve('myFactory'),
    myOtherModule = hilary.resolve('myOtherModule');

console.log(myModule());                     // prints 'do something!'
console.log(myFactory('expect something!')); // prints 'expect something!'
console.log(myOtherModule.message);          // prints 'say something!'
```

##AMD

The AMD extension adds Asynchronous Module Definition specification conventions to Hilary. If you choose to use that extenion, five variables will be added as globals: ``define``, ``require``, ``AMDContainer``, ``Hilary``, and ``HilaryModule``. In order to meet the spec, we had to introduce a global container, ``AMDContainer``. It is an instance of Hilary, so you can access it and take advantage of non-AMD Hilary features if needed. ``define`` and ``require`` exist on each container, so you can also use the AMD conventions with scope, too.

```JavaScript
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

```JavaScript
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
