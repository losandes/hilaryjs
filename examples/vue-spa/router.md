Building a SPA with Vue.js & Hilary: Router
===========================================
Our app will use URL routes as the triggers that cause the user experience to change, and update. We're going to use [page.js](https://visionmedia.github.io/page.js/) for the routing.

## Create the route files

```Shell
/papyr/app $ touch query-string.js
/papyr/app $ touch router.js
```

## Add a query-string module
Page.js gives us the querystring as a string, and we'll need to parse the values from it. Here's a simple (maybe too simple) query string parser.

```JavaScript
// /papyr/app/query-string.js
module.exports = {
  scope: 'papyr',
  name: 'query-string',
  dependencies: [],
  factory: function () {
    'use strict'

    /**
     * This is a rudimentary query string parser. It is NOT standards
     * compliant and isn't suitable for distribution: it doesn't support
     * duplicates.
     * @param {string} queryString - the part of the URL following the question mark, if anything
     */
    const parse = (queryString) => {
      if (!queryString) {
        return {}
      }

      return queryString.split('&')
        .reduce((output, pair) => {
          const keyvalue = pair.split('=')
          output[keyvalue[0]] = decodeURIComponent(keyvalue[1])

          return output
        }, {})
    }

    const getCurrent = () => {
      const current = location.href.split('?');
      return parse(current.length > 1 ? current[1] : '')
    }

    return Object.freeze({ parse, getCurrent })
  }
}
```

## Add a router module
We're going to add a router module to handle 404s and to bind page.js to the document. This will all be encapsulated in a `listen` function so we can choose when to bind page to the document (i.e. after we register our routes).

```JavaScript
// /papyr/app/router.js
module.exports = {
  scope: 'papyr',
  name: 'router',
  dependencies: ['page', 'content-vue'],
  factory: function (page, content) {
    'use strict'

    const listen = () => {
      // Add a catch-all (404)
      page('*', (context) => {
        console.log(`404`, context)
        content.component = 'home'
      })

      // start listening
      page()
    }

    return Object.freeze({ listen })
  }
}
```

## Add our files to `index.html`
The scripts need to be loaded **before** `app.js` is loaded.

```HTML
<!-- /papyr/index.html -->
<!-- ... -->
<script src="/app/query-string.js"></script>
<script src="/app/router.js"></script>

<script src="/app/app.js"></script>
</body>
```

## Compose the router
Finally, we need to compose the router to start listening to document events. We've done all the hard work. We just need to resolve `router` in our bootstrapper, and call `listen`.

```JavaScript
// /papyr/app/app.js
// ...
(scope, next) => {
  console.log('startup::papyr::composing application')
  scope.resolve('content-vue')      // bind the main content
  scope.resolve('router').listen()  // start listening to document events
  next(null, scope)
}
// ...
```

Now if your app is running (`npm start`), and you refresh the page at http://localhost:3001, the page should be blank, and you should see a 404 in the developer console. That's because we haven't registered a handler for the home page yet. We'll do that next.

