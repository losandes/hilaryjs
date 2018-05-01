Building a SPA with Vue.js & Hilary: Header Vue
===============================================
Now it's time to add the header. We're going to add some branding, and a search bar that will be used to populate the main content.

## Create the header directory and files

```Shell
/papyr/app $ mkdir header
/papyr/app $ cd header
/papyr/app/header $ touch header-component.js
/papyr/app/header $ touch header-vue.js
/papyr/app/header $ touch header.less
```

## Create the header-component

```JavaScript
// /papyr/app/header/header-component.js
module.exports = {
  scope: 'papyr',
  name: 'header-component',
  dependencies: ['Vue', 'page', 'query-string'],
  factory: (Vue, page, qs) => {
    'use strict'

    const state = {
      brand: 'Papyr',
      query: qs.getCurrent().q || ''
    }

    const search = () => {
      page(`/products?q=${encodeURIComponent(state.query)}`)
    }

    const component = Vue.component('main-header', {
      template: `
        <div class="component header-component">
          <div id="brand">
            <a href="/">{{brand}}</a>
          </div>
          <div id="search">
            <input type="text" placeholder="search" v-model="query" v-on:keyup.enter="search">
          </div>
        </div>
      `,
      data: () => state,
      methods: { search }
    })

    return Object.freeze({ name: 'main-header', component })
  }
}
```

We need to bind to the search input, so the user can search for books. To do that, we're going to add two attributes: `v-model`, and `v-on:keyup.enter`.

```HTML
<input type="text" placeholder="search" v-model="query" v-on:keyup.enter="search">
```

Vue components have state. When the properties on that state are modified, Vue manages the changes for us. `v-model` allows us to identify which property on the state that a given element is bound to. In this case, the search input is bound to the `query` property.

Vue components also have an event system, which we can tie into, using `v-on`. In this case, we want to execute the component's `search` function when the user clicks `enter` in the search input.

## Create the header Vue instance

```JavaScript
// /papyr/app/header/header-vue.js
module.exports = {
  scope: 'papyr',
  name: 'header-vue',
  dependencies: ['Vue', 'header-component'],
  factory: (Vue, headerComponent) => {
    'use strict'

    return new Vue({
      el: '#header',
      data: {
        component: 'main-header'
      },
      components: {
        'main-header': headerComponent.component
      }
    })
  }
}
```

## Add some style for the header

```LESS
// /papyr/app/header/header.less
// main: ../../styles/main.less

.header-component {
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;

  // ...
}
```

## import header.less in main.less

```LESS
// out: main.css, compress: true, strictMath: true

// add any boilerplate you want here
@import "../app/header/header.less";
```

## Compose the header-vue
Because the header-vue is an entry point, we need to compose it in our composition root.

```JavaScript
// /papyr/app/app.js
// ...
(scope, next) => {
  console.log('startup::papyr::composing application')
  scope.resolve('header-vue')       // bind the header
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

## Add our files to index.html

The scripts need to be loaded **before** `app.js` is loaded.

```HTML
<!-- /papyr/index.html -->
<!-- ... -->
<script src="header-component.js"></script>
<script src="header-vue.js"></script>

<script src="/app/app.js"></script>
</body>
```

Now when we refresh http://localhost:3001, we should see a header with the title of our app, and a search bar.