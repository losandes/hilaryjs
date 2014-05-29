hilary.js
========

hilary.js is a simple JavaScript IoC container.  It's named after Hilary Page, who designed building blocks that later became known as Legos.

##The singleton container, and constructors

hilary exists on window, and you can use it directly.  Most of the examples assume that is your use case, but hilary allows the 
construction of new parent containers, as well as child containers, for scoping.

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

If you have more complex needs, or want to register something other than a function, such as an object literal, you can register modules directly against the conatainer.  This feature can easily be misused (i.e. using the container for Service Location).  We recommend keeping it simple, and only use the container for registration.

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

#The before register event

```JavaScript
hilary.register('hilary::before::register', function(container, moduleNameOrFunc, moduleDefinition) {
  $(document).trigger('registering:' + moduleNameOrFunc);
});
```




