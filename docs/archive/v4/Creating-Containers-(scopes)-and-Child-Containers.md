### Creating containers
We create containers (scopes) to compartmentalize our modules. it is normal to have a single container for an app, but you can also create as many containers as needed. Creating a container is simple:

```JavaScript
// create named scopes
Hilary.scope('scope1');
Hilary.scope('scope2');

// OR

// create anonymous scopes
var scope1 = new Hilary(),
    scope2 = new Hilary();
```

> One of the benefits of scope is that you can isolate libraries from one another. Using standard AMD, all libraries are registered on a shared container, where naming collisions can still occur, as they would on window. Scope gives you the ability to protect your namespace.

### Creating child containers
Containers may also have child containers, for nested scoping.

```JavaScript
Hilary.scope('myScope');

var child = Hilary.scope('myScope').createChildContainer();

// Like top level containers, child containers can be named:
Hilary.scope('myScope').createChildContainer('childScope');
Hilary.scope('myScope').createChildContainer({ name: 'childScope2' });

Hilary.scope('childScope').register(...);
```

> Example uses of nested scoping include: tenant specific configurations, different scope lifetimes (i.e application lifetime and request lifetime), service-oriented scopes, and more.

### Setting the parent container
Sometimes, you already have two scopes that are defined, and you want to merge them into a parent, child relationship. To do this:

```JavaScript
Hilary.scope('child').setParentContainer(Hilary.scope('parent'));
```

### Creating Containers with extensions
To take advantage of extensions, such as AMD and Async, you can use the ``useAMD`` and ``useAsync`` functions (see Installing Hilary in Node.js and Referencing Hilary in the Browser for more info):

```JavaScript
Hilary.scope('myAMDScope').useAMD();
Hilary.scope('myAsyncScope').useAsync(async);
Hilary.scope('myAMDAndAsyncScope').useAMD().useAsync(async);
```