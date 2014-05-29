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

If you have more complex needs, you can register modules directly against the conatainer.  This feature can easily be misused (i.e. using the container for Service Location).  We recommend keeping it simple, and only use the container for registration.

```JavaScript
hilary.register(function(container) {
  container.myModule = function() {
    return 'hello world!';
  };
  
  container.myOtherModule = function(myModule) {
    return myModule();
  };
});
```
