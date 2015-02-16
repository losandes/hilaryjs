hilary.js
========

Hilary is a simple JavaScript IoC container written for Node.js and the browser.  Hilary's aim is to deliver low-ceremony dependency injection, to aid in decoupling JavaScript modules and testing.  It's named after Hilary Page, who designed building blocks that later became known as Legos.

You can find documentation and examples on our [wiki] (https://github.com/Acatar/hilaryjs/wiki). Below is just a quick-start.

For Node
========
Install Hilary:

```
npm install hilary
```

In your startup file, require Hilary, create a new scope, and compose your app.

```JavaScript
// app.js
var Hilary = require('hilary'),
    container = new Hilary(),
    compose,
    start;

compose = function (container) {
    container.register('http', require('http'));
    container.register('server', require('./server.js'));
};

start = function () {
    compose(container);
    container.resolve('server');
};

start();
```

```JavaScript
// server.js
module.exports.name = 'server';
module.exports.dependencies = ['http'];
module.exports.factory = function (http) {
    var http = require('http');

    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello World\n');
    }).listen(1337, '127.0.0.1');

    console.log('Server running at http://127.0.0.1:1337/');
};
```

For the Browser
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
} (window, Hilary));
```

```JavaScript
// myModule.js
spa.register('myModule', ['myFactory'], function (myFactory) {
    "use strict";
    
    // [CODE]
});
```

```JavaScript
// bootstrapper.js
spa.resolve(function (resolve, exports, window) {
    "use strict";
    
    var compose,
        start;
    
    compose = function (container) {
        container.register('myFactory', function () {
            "use strict";
            
            // [CODE]
        });        
    };
    
    start = function () {
        compose(spa);
        resolve('myModule');
    };
    
    start();
});
```


