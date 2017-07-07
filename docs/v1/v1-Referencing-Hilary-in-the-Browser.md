Hilary does not depend on other libraries. All you need to do to use it in a web app is include it in a script tag.

```HTML
<script src="hilary.min.js"></script>
```

### The AMD extensions
By default, hilary's ``register`` and ``resolve`` functions accept AMD style arguments. AMD syntax, ``define`` and ``register``, can be added with the AMD extension.

```HTML
<script src="hilary.amd.min.js"></script>
```

> Note that hilary AMD excludes module loading. We might add a loader extension for that in the future - let us know if that's important to you via Github issues.
