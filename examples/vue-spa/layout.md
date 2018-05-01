Building a SPA with Vue.js & Hilary: Layout
===========================================
Now that we have a shell for our app, we can start building. We're going to start with the layout. I like to break the layout into sections, and make each section an instance of Vue. This app will have 2 sections: header, and content.

> The HTML throughout this page should be added to `index.html`

## Header
The header that we build is going to be rendered in the header section. In order to bind the `component` element (below) to a ViewModel, we can use the `v-bind:is` attribute to identify the ViewModel property that it's bound to.

```HTML
<!-- /papyr/index.html -->
<header id="header">
  <component v-bind:is="component">
    <!-- this is dynamic -->
  </component>
</header>
```

## Content
The components that we build are going to be rendered in the content section. In order to bind the `component` element (below) to a ViewModel, we can use the `v-bind:is` attribute to identify the ViewModel property that it's bound to. This will be used to update the component that is displayed in content as the user navigates the app.

```HTML
<!-- /papyr/index.html -->
<section id="content" role="main">
  <component v-bind:is="component">
    <!-- this is dynamic -->
  </component>
</section>
```

## Styles
This example uses LESS, and all of the styles will be registered in `main.less`. I'm using Easy LESS for VS Code to auto-compile into CSS in this tutorial.

```Shell
/papyr $ mkdir styles
/papyr $ touch main.less
```

### Add the main.less file
```LESS
// out: main.css, compress: true, strictMath: true

// add any boilerplate you want here
```

### Add main.css to index.HTML

```HTML
<!-- /papyr/index.html -->
<!-- ... -->
  <link rel="stylesheet" href="/styles/main.css">
</head>
```

