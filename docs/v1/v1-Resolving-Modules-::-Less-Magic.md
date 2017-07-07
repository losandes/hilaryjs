Resolving modules on a lessMagic container simply returns the registered function or object.

Invocation, scope, and container hierarchies are the same as with the AMD containers.

```JavaScript
var myModule = scope.resolve('myModule'),
    myFactory = scope.resolve('myFactory'),
    myOtherModule = scope.resolve('myOtherModule');

console.log(myModule());                     // prints 'do something!'
console.log(myFactory('expect something!')); // prints 'expect something!'
console.log(myOtherModule.message);          // prints 'say something!'
```