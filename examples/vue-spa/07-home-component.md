Building a SPA with Vue.js & Hilary: Home Component
===================================================
Now that we have a router, we need to register a route for the home page, so we can see some content.

## Add a home directory, and component

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
      </div>`,
      data: () => state
    })

    return { component }
  }
}
```

## Add the home-controller

```JavaScript
// /papyr/app/home/home-controller.js
module.exports = {
  scope: 'papyr',
  name: 'home-controller',
  dependencies: ['router', 'content-vue'],
  factory: (router, content) => {
    'use strict'

    router.get('/', () => {
      content.component = 'home'
    })
  }
}
```

## Add our files to `index.html`
The scripts need to be loaded **before** `app.js` is loaded.

```HTML
<!-- /papyr/index.html -->
<!-- ... -->
<script src="/app/home/home-component.js"></script>
<script src="/app/home/home-controller.js"></script>
<!-- ... -->
```

Now when we refresh http://localhost:3001, we should see a "Welcome to Papyr!" message.