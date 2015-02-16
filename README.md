hilary.js
========

Hilary is a simple JavaScript IoC container written for Node.js and the browser.  Hilary's aim is to deliver low-ceremony dependency injection, to aid in decoupling JavaScript modules and testing.  It's named after Hilary Page, who designed building blocks that later became known as Legos.

You can find documentation and examples on our [wiki] (https://github.com/Acatar/hilaryjs/wiki). Below is just a quick-start.

## For Node
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


