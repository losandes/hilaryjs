This module will enumerate our controllers to register their routes, and finally bind the router to the document events to start our app.

```JavaScript
// /papyr/app/startup.js
module.exports = {
  scope: 'papyr',
  name: 'startup',
  dependencies: ['router', /controller/i],
  factory: function (router, controllers) {
    'use strict'

    controllers.forEach((controller) => {
      if (controller && typeof controller.registerRoutes === 'function') {
        controller.registerRoutes();
      }
    })

    router.listen();
  }
}
```

Note the convention we are setting for controllers: we expect them to export a function named, `registerRoutes`. Technically this is not required. Any controller that calls `router.get` in it's factory function will register itself. However this is magic/implicit registration, and doesn't allow us to modify the order of registration later, if we need to. Following is an example controller that meets this convention (we'll create this controller in the next step):

```JavaScript
module.exports = {
  scope: 'papyr',
  name: 'home-controller',
  dependencies: ['router', 'content-vue'],
  factory: (router, content) => {
    'use strict'

    const registerRoutes = () => {
      router.get('/', (ctx, next) => {
        content.component = 'home'
        next()
      })
    }

    return { registerRoutes }
  }
}
```

This will also work, and doesn't require us to enumerate the controllers in `startup.js`. All that's required for this to work is that our startup file depends on `/controllers/i`. We have no control over route matching order doing it this way.

```JavaScript
module.exports = {
  scope: 'papyr',
  name: 'home-controller',
  dependencies: ['router', 'content-vue'],
  factory: (router, content) => {
    'use strict'

    router.get('/', (ctx, next) => {
      content.component = 'home'
      next()
    })
  }
}
```