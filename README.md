hilary.js
========

Hilary is an easy to use JavaScript IoC container written for Node.js and the browser.  Hilary's aim is to deliver low-ceremony dependency injection, to aid in decoupling JavaScript modules and testing.  It's named after Hilary Page, who designed building blocks that later became known as Legos.

You can find documentation and examples on our [wiki](https://github.com/Acatar/hilaryjs/wiki). Below is just a quick-start.

> Hilary 2.0 is not backwards compatible with previous versions of Hilary. We don't intend to release a backwards compatibility extension because v1 was in the wild for such a short time. If you already built a lot around v1, open an issue, and we will help you with compatibility/upgrades.

Creating your First Node App with Hilary
========
Install Hilary:

```
npm install hilary
```

In your startup file, require Hilary, create a new scope, and compose your app.

```JavaScript
// startup.js
var Hilary = require('hilary'),
    scope = new Hilary(),
    compose,
    start;

compose = function (scope) {
    "use strict";

    scope.register({
        name: 'http',
        factory: function () {
            var isWin = /^win/.test(process.platform);
            
            if (isWin) {
                // take advantage of the httpsys performance enhancements
                return require('httpsys').http();
            } else {
                // otherwise, stick with the standard http module
                return require('http');
            }
        }
    });
    scope.register(require('./www.js'));
};

start = function () {
    "use strict";

    compose(scope);
    scope.resolve('server');
};

start();
```

```JavaScript
// www.js
module.exports.name = 'server';
module.exports.dependencies = ['http'];
module.exports.factory = function (http) {
    "use strict";
    
    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello World\n');
    }).listen(1337, '127.0.0.1');

    console.log('Server running at http://127.0.0.1:1337/');
    
    return http;
};
```

Creating your First Browser App with Hilary
========

Add a script reference to Hilary before you load your modules:

```HTML
<script src="hilary.min.js"></script>
```

Then define your scope, then your modules and finally compose your app:

```JavaScript
// spa.js
(function (exports, Hilary) {
    "use strict";
    
    exports.spa = new Hilary();
}(window, Hilary));
```

```JavaScript
// myModule.js
(function (spa) {
    spa.register({
        name: 'myRouteEngine',
        dependencies: ['myFactory'],
        factory: function (myFactory) {
            "use strict";
    
            // [CODE]
        }
    });
}(spa));
```

```JavaScript
// bootstrapper.js
(function (spa) {
    "use strict";
    
    var compose,
        start;
    
    compose = function (scope) {
        scope.register({
            name: 'myFactory',
            factory: function () {
                "use strict";

                // [CODE]
            }
        });
    };
    
    start = function () {
        compose(spa);
        resolve('myRouteEngine');
    };
    
    start();
}(spa));
```
