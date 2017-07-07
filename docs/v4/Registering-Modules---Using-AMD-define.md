**[Browser Only]** With the [AMD extension](https://github.com/losandes/hilaryjs/wiki/Referencing-Hilary-in-the-Browser#the-amd-extension), you can register modules, according to the AMD spec.

> Also see [Using AMD require](https://github.com/losandes/hilaryjs/wiki/Resolving-Modules-::-Using-AMD-require)

```JavaScript
// with AMD, functions are executed when they are resolved
define('myModule', function() {
    return {
        message: 'hello world!'
    };
});

// unless the function accepts an argument and declares empty dependencies
define('myFactory', [], function(arg) {
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