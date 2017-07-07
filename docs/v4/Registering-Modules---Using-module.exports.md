**[Browser Only]** You can also use `module.exports` syntax to register your modules. Beyond syntax candy, this allows you to decouple your modules from Hilary, making it easier to refactor, or inject global DI behaviors. 

> You must [reference the module.exports extension](https://github.com/losandes/hilaryjs/wiki/Referencing-Hilary-in-the-Browser#the-moduleexports-extension) for this to work.

```JavaScript
module.exports = {
    scope: 'myApp',
    name: 'myModule',
    dependencines: [],
    factory: function () {
        'use strict';

        // do something
    }
};
```

> Note: You should ALWAYS have a names scope, like the example above, in addition to the requirements of Hilary's `register` feature.