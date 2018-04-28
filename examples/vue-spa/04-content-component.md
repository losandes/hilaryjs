Building a SOLID Vue.js App: Content Component
==============================================
The content section in our HTML is where the main content will be displayed. It's where the majority of our components will be bound. In this step, we're going to setup a naming convention, so our components are registered automatically, when we add the scripts to the DOM.

> Alternatively, we can register components by hand, in our main Vue instance

## Add a folder and file for our main Vue instance

```Shell
/papyr/app $ mkdir layout-content
/papyr/app $ cd layout-content
/papyr/app/layout-content $ touch content-vue.js
```

## Define the main Vue instance
This code will register a module, named "content-vue" on the "papyr" scope in hilary. It depends on Vue, and on the "all-components" module we registered in our bootstrapper above. It returns an instance of Vue, and we can change what is displayed in the `#content` element by setting `component` to the name of another component that was returned by "all-components".

```JavaScript
// /papyr/app/layout-content/content-vue.js
module.exports = {
  scope: 'papyr',
  name: 'content-vue',
  // note the expression used in dependencies: this will resolve all modules
  // that have the word component in their name
  dependencies: ['Vue', /component/i],
  factory: (Vue, components) => {
    'use strict'

    return new Vue({
      el: '#content',
      data: {
        component: 'loading'
      },
      // note the convention we will follow is that component modules will
      // export an object with a `component` property
      components: components.map((item) => item.component)
    })
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

    return { component }
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
<!-- ... -->
```

## Compose the content component
Finally, we need to compose the content component. We've done all the hard work. We just need to resolve `content-vue` in our bootstrapper. Resolve the "content-vue" module in the first function in the array that is passed to `bootstrap` in `app.js`.

```JavaScript
// /papyr/app/app.js
// ...
(scope, next) => {
  console.log('startup::papyr::composing application')
  scope.resolve('content-vue')
  next(null, scope)
}
// ...
```

Now if your app is running (`npm start`), you should see "Loading..." if you refresh the page at http://localhost:3001.
