Building a SPA with Vue.js & Hilary
===================================

This example is a walk through for creating a SPA with [vue.js](https://vuejs.org/), [page.js](https://visionmedia.github.io/page.js), and [hilary.js](https://github.com/losandes/hilaryjs). It falls somewhere between a simple example, and a dev-team ready example in that it presents some more complex uses of both vue, and hilary, but does not get into packaging (i.e. web-pack), minification, etc.

A completed implementation of the example is in the [papyr directory](./papyr)

The objectives of this exercise are to:

* Demonstrate a working SPA that uses vue.js, page.js, and hilary.js
* Demonstrate a screaming architecture SPA
* Demonstrate the Dependency Inversion Principle, and Composition Root in a SPA
* Demonstrate nested components
* Show how hilary can reduce the effort required to decouple modules, and bootstrap an application
* Demonstrate how we can write immutable code _and_ work with vue's reactive/mutable approach to managing the DOM, and how that means we have to compromise on immutability, and/or introduce discipline and complexity to achieve it (this is my biggest caveat with Vue)

## Table of Contents

1. [Setup](./setup.md)
1. [Layout](./layout.md)
1. [Composition Root](./composition-root.md)
1. [The Content Vue](./content-vue.md)
1. [The Router](./router.md)
1. [The Home Component](./home-component.md)
1. [The Header Vue](./header-vue.md)
1. [The Product Components](./product-components.md)
1. [The Book Component](./book-component.md)
