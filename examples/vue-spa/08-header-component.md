Building a SOLID Vue.js App: Header Component
=============================================
Let's put something on that screen, starting with the header.

### Create a header directory

```Shell
/papyr/app $ mkdir header
/papyr/app $ cd header
```

### Create a file for our Vue instance

```Shell
/papyr/app/header $ touch header-vue.js
```


```HTML
<header id="header">
  <div id="brand">
    <a href="/">Papyr</a>
  </div>
  <div id="search">
    <input type="text" placeholder="search">
  </div>
</header>
```

We need to bind to the search input, so the user can search for books. To do that, we're going to add two attributes: `v-model`, and `v-on:keyup.enter`.

```HTML
<input type="text" placeholder="search" v-model="query" v-on:keyup.enter="search">
```

Vue components have state. When the properties on that state are modified, Vue manages the changes for us. `v-model` allows us to identify which property on the state that a given element is bound to. In this case, the search input is bound to the `query` property.

Vue components also have an event system, which we can tie into, using `v-on`. In this case, we want to execute the component's `search` function when the user clicks `enter` in the search input.