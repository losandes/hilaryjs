You can install hilary from npm:

```
npm install hilary
```

You can also add it to your package dependencies, and then run ``npm install``:

```
"dependencies": {
    "hilary": "1.1.x"
}
```

Once you install Hilary, you can require the constructor and create new scopes:

```
var Hilary = require('hilary'),
    scope = new Hilary();
```