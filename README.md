hilary.js
========

hilary.js is a simple JavaScript IoC container.  It's named after Hilary Page, who designed building blocks that later became known as Legos.

##The singleton container, and constructors

hilary exists on window, and you can use it directly.  Most of the examples assume that is your use case, but hilary allows the 
construction of new parent containers, as well as child containers, for scoping.

```
var container = hilary.createContainer();
var child = container.createChildContainer();
```