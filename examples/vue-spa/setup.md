Building a SPA with Vue.js & Hilary: Setup
==========================================

## NPM package manager
We're going to use npm for dependency, so install node.js if you don't already have it.

To install it with node version manager on a mac:

```Shell
$ brew install nvm
$ nvm install 8.11.1
$ nvm use 8.11.1
$ nvm alias default node
```

We can use nodemon to keep our app up to date, as we develop, so let's install that globally:

```Shell
$ npm install -g nodemon
```

## Dependencies
For this app, we'll depend on the following packages:

* [vue.js](https://vuejs.org/): DOM binding, and components
* [hilary.js](https://github.com/losandes/hilaryjs): Inversion of Control container for Dependency Injection
* [page.js](https://visionmedia.github.io/page.js/): SPA routing
* [polyn](https://github.com/losandes/polyn): validation, and immutability

To server it, we're going to use:

* [express](https://expressjs.com/): nodejs HTTP server
* [serve-static](https://github.com/expressjs/serve-static): middleware for serving static content

> There a many other ways to serve a vue app. While express isn't my go-to for hosting static web sites in production, it's a simple solution for the purposes of this article.

## Initialize the app

### First, create a folder for our app

```Shell
$ mkdir papyr
$ cd papyr
```

### Next, initialize our npm package

```Shell
/papyr $ npm init # and follow the instructions
```

### Install the dependencies

```Shell
/papyr $ npm install --save vue hilary page polyn
/papyr $ npm install --save-dev express serve-static supposed
```

### Create the static server

```Shell
/papyr $ touch server.js
```

### Paste the following code in `server.js`

```JavaScript
// /papyr/server.js
const fs = require('fs')
const express = require('express')
const serveStatic = require('serve-static')

var app = express()

// serve this directory as a static web server
app.use(serveStatic(__dirname))

// 404 - return the SPA index for any files that aren't found
app.use(function (req, res, next) {
  'use strict'

  res.writeHead(200, { 'Content-Type': 'text/html' })
  fs.createReadStream('./index.html').pipe(res)
})

// response to port 3001
app.listen(3001)
console.log('The app is running at http://localhost:3001')
```

### Initialize the package
When we initialized the app with `npm init`, it created a `package.json` file. Let's add a script to start the app to that file. `nodemon server.js -e js,json,html` will tell nodemon to execute the `server.js` file, and restart that file every time we save a file with either a js, json, or html extension in this directory.

```JSON
// /papyr/package.json
{
  // ...
  "scripts": {
    "start": "nodemon server.js -e js,json,html",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  // ...
}
```

### Create an `index.html` file as our entry point

```
/papyr $ touch index.html
```

8. Paste the following into `index.html`

```HTML
<!-- /papyr/index.html -->
<html lang="en">
<head>
  <title>Papyr</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  Hello World!

  <script src="/node_modules/vue/dist/vue.js"></script>
  <script src="/node_modules/page/page.js"></script>
  <script src="/node_modules/polyn/release/polyn.js"></script>
  <script src="/node_modules/hilary/release/hilary.js"></script>
  <script src="/node_modules/hilary/release/hilary-browser-module-shim.js"></script>
</body>
</html>

```

> The hilary-browser-module-shim is optional. It's a shim that allows us to define hilary modules using `module.exports`. Note that an additional convention is required to define your modules when using `module.exports`. We'll discuss that later in this exercise.

9. Run the app, and view it in a browser at http://localhost:3001

```Shell
$ npm start
```
