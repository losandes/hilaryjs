Installing Hilary in Node.js
==========

You can install hilary from npm:

```
npm install hilary
```

You can also add it to your package dependencies, and then run ``npm install``:

```JavaScript
"dependencies": {
    "hilary": "2.0.x"
}
```

Once you install Hilary, you can require the constructor and create new scopes. The following example represents several options, of which you would normally pick one:

```JavaScript
var Hilary = require('hilary'),
    // require async.js (https://github.com/caolan/async)
    async = require('async'),
    // a regular Hilary instance
    scope = new Hilary(),
    // a Hilary instance with the AMD extension
    amdScope = new Hilary().useAMD(),
    // a Hilary instance with the Async extension
    asyncScope = new Hilary().useAsync(async),
    // a Hilary instance with the AMD and Async extensions
    multiScope = new Hilary().useAMD().useAsync(async);
```

