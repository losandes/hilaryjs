### Creating containers
We create containers (scopes) to compartmentalize our modules. it is normal to have a single container for an app, but you can also create as many containers as needed. Creating a container is simple:

```JavaScript
var scope1 = new Hilary(),
    scope2 = new Hilary();
```

The constructors accept an optional argument, ``options``. The options allow the caller to define handlers for features that need to be in place before the first registration occurs, such as exceptions (i.e. throw argumentException) and utilities (i.e. isFunction). Overrides must match the signature of the module they are overriding.

```JavaScript
var scope = new Hilary({
  utils: myUtilityOverride,
  exceptions: myExceptionsOverride,
  lessMagic: true
});
```

> One of the benefits of scope is that you can isolate libraries from one another. Using standard AMD, all libraries are registered on a shared container, where naming collisions can still occur. Scope gives you the ability to protect your namespace.

### Creating child containers
Containers may also have child containers, for nested scoping.

```JavaScript
var scope = new Hilary(),
    child = scope.createChildContainer();
```

> Example uses of nested scoping include: tenant specific configurations, different scope lifetimes (i.e application lifetime and request lifetime), service-oriented scopes, and more.