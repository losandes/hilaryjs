The AMD extension adds Asynchronous Module Definition specification conventions to Hilary. If you choose to use that extenion, five variables will be added as globals: ``define``, ``require``, ``AMDContainer``, ``Hilary``, and ``HilaryModule``. In order to meet the spec, we had to introduce a global container, ``AMDContainer``. It is an instance of Hilary, so you can access it and take advantage of non-AMD Hilary features if needed. ``define`` and ``require`` exist on each container, so you can also use the AMD conventions with scope, too.

```JavaScript
var scope = new Hilary().useAMD();

scope.define('myFactory', function(arg) {
    console.log(arg);
});

scope.require(['myFactory'], function (factory) {
    factory('hello world!');
});
```

Also see [Referencing Hilary in the Browser](https://github.com/losandes/hilaryjs/wiki/Referencing-Hilary-in-the-Browser#the-amd-extension) for installation instructions.