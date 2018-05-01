Building a SPA with Vue.js & Hilary: Home Component
===================================================
To see some content in our app, we need to register a route for the home page.

## Create the home directory and files

```Shell
/papyr/app $ mkdir home
/papyr/app $ cd home
/papyr/app/home $ touch home-component.js
/papyr/app/home $ touch home-controller.js
```

## Add the home component

```JavaScript
// /papyr/app/home/home-component.js
module.exports = {
  scope: 'papyr',
  name: 'home-component',
  dependencies: ['Vue'],
  factory: (Vue) => {
    'use strict'

    const state = {
      heading: 'Welcome to Papyr!',
      body: 'To get started, you can search for books. Try "adams", "wild", "robbins", "swamp", "india", "tropper", "di", "world", or "novel". If nothing returns, make sure you ran `npm run seed`.'
    }

    const component = Vue.component('home', {
      template: `
        <div class="component home-component">
          <h1>{{heading}}</h1>
          <div>{{body}}</div>
        </div>
      `,
      data: () => state
    })

    return Object.freeze({ name: 'home', component })
  }
}
```

## Add the home-controller
We're going to follow a convention for all of our controllers: they should return a function called `registerRoutes`.

```JavaScript
// /papyr/app/home/home-controller.js
module.exports = {
  scope: 'papyr',
  name: 'home-controller',
  dependencies: ['page', 'content-vue'],
  factory: (page, content) => {
    'use strict'

    const registerRoutes = () => {
      page('/', () => {
        content.component = 'home'
      })
    }

    return Object.freeze({ registerRoutes })
  }
}
```

## Register routes in the composition root
The reason our controllers return the `registerRoutes` function is to so our composition root can choose to manipulate things like the order, later. Add a function that enumerates all modules with controller in their name, to register their routes.

```JavaScript
// /papyr/app/app.js
// ...
(scope, next) => {
  console.log('startup::papyr::composing application')
  scope.resolve('content-vue')      // bind the main content
  scope.resolve(/controller/i).forEach((controller) => {
    if (controller && typeof controller.registerRoutes === 'function') {
      controller.registerRoutes()   // resolve controllers to register routes
    }
  })
  scope.resolve('router').listen()  // start listening to document events
  next(null, scope)
}
// ...
```

## Add our files to `index.html`
The scripts need to be loaded **before** `app.js` is loaded.

```HTML
<!-- /papyr/index.html -->
<!-- ... -->
<script src="/app/home/home-component.js"></script>
<script src="/app/home/home-controller.js"></script>

<script src="/app/app.js"></script>
</body>
```

Now when we refresh http://localhost:3001, we should see a "Welcome to Papyr!" message.