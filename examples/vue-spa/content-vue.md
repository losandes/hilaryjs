Building a SPA with Vue.js & Hilary: Content Vue
================================================
The content section in our HTML is where the main content will be displayed. It's where the majority of our components will be bound. In this step, we're going to setup a naming convention, so our components are registered automatically, when we add the scripts to the DOM.

> Alternatively, we can register components by hand, in our main Vue instance

## Create the layout directory and files

```Shell
/papyr/app $ mkdir layout-content
/papyr/app $ cd layout-content
/papyr/app/layout-content $ touch content-vue.js
```

## Define the main Vue instance
This code will register a module, named "content-vue" on the "papyr" scope in hilary. It depends on Vue, and on any module with "component" in it's name. It returns an instance of Vue, and we can change what is displayed in the `#content` element by setting `component` to the name of any component that was returned by `/component/i`.

```JavaScript
// /papyr/app/layout-content/content-vue.js
module.exports = {
  scope: 'papyr',
  name: 'content-vue',
  dependencies: ['Vue', /component/i],
  factory: (Vue, components) => {
    'use strict'

    const app = new Vue({
      el: '#content',
      data: {
        component: 'loading'
      },
      components: components.filter((item) => {
        return item && typeof item.component === 'object'
      }).reduce((output, item) => {
        output[item.name] = item.component
        return output
      }, {})
    })

    const self = {}

    Object.defineProperty(self, 'component', {
      get: () => {
        return app.component
      },
      set: (name) => {
        scroll(0, 0)
        app.component = 'loading' // forces the component to reload unless the current component is loading
        app.component = name
      },
      enumerable: true,
      configurable: false
    })

    return Object.freeze(self)
  }
}
```

## Add the loading component
Our module above sets the initial component to loading, but we haven't created that yet. Let's do that now.

```Shell
/papyr/app/layout-content $ touch loading-component.js
```

```JavaScript
// /papyr/app/layout-content/loading-component.js
module.exports = {
  scope: 'papyr',
  name: 'loading-component',
  factory: (Vue) => {
    'use strict'

    const state = {
      copy: 'Loading...'
    }

    const component = Vue.component('loading', {
      template: `
        <div class="component loading-component">{{copy}}</div>
      `,
      data: () => state
    })

    return Object.freeze({ name: 'loading', component })
  }
}
```

> There are arguments for and against writing the HTML inline with the JavaScript. This exercise passes no judgement either way.

## Add our files to `index.html`
The scripts need to be loaded **before** `app.js` is loaded.

```HTML
<!-- /papyr/index.html -->
<!-- ... -->
<script src="/node_modules/hilary/release/hilary-browser-module-shim.js"></script>

<script src="/app/layout-content/content-vue.js"></script>
<script src="/app/layout-content/loading-component.js"></script>

<script src="/app/app.js"></script>
</body>
```

## Compose the content component
Finally, we need to compose the content component. We've done all the hard work. We just need to resolve `content-vue` in our bootstrapper. Resolve the "content-vue" module in the first function in the array that is passed to `bootstrap` in `app.js`.

```JavaScript
// /papyr/app/app.js
// ...
(scope, next) => {
  console.log('startup::papyr::composing application')
  scope.resolve('content-vue')      // bind the main content
  next(null, scope)
}
// ...
```

Now if your app is running (`npm start`), you should see "Loading..." if you refresh the page at http://localhost:3001.
