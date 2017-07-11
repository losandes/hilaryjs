If you want more control over the Dependency Inversion, we recommend using the ``lessMagic`` argument. This replaces the ``register`` and ``resolve`` arguments with simpler counterparts, and gives you more control over auto-resolution.

```JavaScript
var scope = new Hilary({ lessMagic: true });

scope.register('myModule', function() {
    return 'hello world!';
});

scope.register('myFactory', function(expectation) {
    return expectation;
});

scope.register('myOtherModule', {
    message: 'do something!'
});
```

Notice these three examples match the AMD style examples above, however there is a significant difference with resolution. The ``myModule`` registration with the parameterless factory will NOT be executed upon resolution. The function itself will be returned.

You can still take advantage of auto-resolution if you want to: by registering a HilaryModule. HilaryModules accept two arguments: a dependency array, and a module definition. The dependency array should include the name of the modules that the current module depends on. The module definition should accept the resolved modules as arguments, in the same order that they are listed in the dependency array.

```JavaScript
scope.register('myHilaryModule', new HilaryModule(['myModule', 'myFactory', 'myOtherModule'],
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