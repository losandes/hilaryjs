Building a SOLID Vue.js App: Layout
===================================
Now that we have a shell for our app, we can start building. We're going to start with the layout. I like to break the layout into sections, and make each section an instance of Vue. This app will have 2 sections: header, and content.

> The HTML throughout this page should be added to `index.html`

## Header
The header that we build is going to be rendered in the header section. Here is the initial HTML, without any vue attributes:

```HTML
<!-- /papyr/index.html -->
<header id="header">
  <component>
    <!-- this will be dynamic -->
  </component>
</header>
```

In order to bind the `component` element to a ViewModel, we can use the `v-bind:is` attribute to identify the ViewModel property that it's bound to.

```HTML
<!-- /papyr/index.html -->
<header id="header">
  <component v-bind:is="component">
    <!-- this is dynamic -->
  </component>
</header>
```

## Content
The components that we build are going to be rendered in the content section. Here is the initial HTML, without any vue attributes:

```HTML
<!-- /papyr/index.html -->
<section id="content" role="main">
  <component>
    <!-- this will be dynamic -->
  </component>
</section>
```

In order to bind the `component` element to a ViewModel, we can use the `v-bind:is` attribute to identify the ViewModel property that it's bound to. This will be used to update the component that is displayed in content as the user navigates the app.

```HTML
<!-- /papyr/index.html -->
<section id="content" role="main">
  <component v-bind:is="component">
    <!-- this is dynamic -->
  </component>
</section>
```
