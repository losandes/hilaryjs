Hilary does not depend on other libraries, unless you enable the Async option. All you need to do to use it in a web app is include it in a script tag.

```HTML
<script src="[PATH]/release/hilary.min.js"></script>
```

```JavaScript
Hilary.scope('myScope');
```

### The module.exports extension
Hilary's ``register`` function can be accessed using `module.exports` with the [module.exports extension](https://github.com/losandes/hilaryjs/wiki/Registering-Modules-::-Using-module.exports).

```HTML
<script src="[PATH]/release/hilary.min.js"></script>
<script src="[PATH]/release/hilary.moduleExports.min.js"></script>
```

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

### The AMD extension
Hilary's ``register`` and ``resolve`` functions accept proprietary arguments. If you prefer AMD syntax, ``define`` and ``register`` can be added with the AMD extension.

```HTML
<script src="[PATH]/release/hilary.min.js"></script>
<script src="[PATH]/release/hilary.amd.min.js"></script>
```

```JavaScript
Hilary.scope('myScope').useAMD();
```

> Note that hilary AMD excludes module loading. We might add a loader extension for that in the future - let us know if that's important to you via Github issues.

### The async extension
While Hilary's async features are meant for the server, they can also be used in the browser. You must include [async.js](https://github.com/caolan/async) to take advantage of Hilary async features:

```HTML
<script src="[PATH]/release/async.js"></script>
<script src="[PATH]/release/hilary.min.js"></script>
```

```JavaScript
Hilary.scope('myScope').useAsync(async);
```

### Multiple extensions:
The extensions are chainable:

```HTML
<script src="[PATH]/release/async.js"></script>
<script src="[PATH]/release/hilary.min.js"></script>
<script src="[PATH]/release/hilary.amd.min.js"></script>
```

```JavaScript
Hilary.scope('myScope').useAMD().useAsync(async);
```