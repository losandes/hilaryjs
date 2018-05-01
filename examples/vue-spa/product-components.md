Building a SPA with Vue.js & Hilary: Product Components
=======================================================
The app we're building is an e-commerce store that sells books. The search bar in our header should return products that match the search to fill the page. Let's build our first domain: products

## Create the products directory and files

```Shell
/papyr/app $ mkdir products
/papyr/app $ cd products
/papyr/app/products $ touch product-component.js
/papyr/app/products $ touch Product.js
/papyr/app/products $ touch products-component.js
/papyr/app/products $ touch products-controller.js
/papyr/app/products $ touch products-repository.js
/papyr/app/products $ touch products.less
```

The `products-component` will have an array of `product-component`, so this example will demonstrate nested components in Vue.js.

## Create the product-component
The product component is a card that displays the product picture, name, description, and price. The `product.[PROPERTY]` accessors are possible because the `products-component` exposes `product` to `product-component` using an attribute: `v-bind:product="product"` (the following section for more detail).

```JavaScript
// /papyr/app/products/product-component.js
module.exports = {
  scope: 'papyr',
  name: 'product-component',
  dependencies: ['Vue'],
  factory: (Vue) => {
    'use strict'

    const viewDetails = (product) => {
      page(`/books/${product.uid}`)
    }

    const addToCart = (product) => { console.log('TODO', product) }

    const component = Vue.component('product', {
    template: `
      <div class="product-card">
        <div class="thumbnail">
          <a class="thumbnail-img" href="javascript:void(0);" v-on:click="viewDetails(product)">
            <img v-bind:src="product.thumbnailLink" v-bind:alt="product.thumbnailAlt">
          </a>
        </div>
        <div class="caption">
          <h3><a href="javascript:void(0);" v-on:click="viewDetails(product)">{{product.title}}</a></h3>
          <div class="description">{{product.description}}</div>
          <div class="overlay"></div>
        </div>
        <div class="buy-button">
          <button v-on:click="addToCart(product)">{{product.priceText}}</button>
        </div>
      </div>
    `,
    props: ['product'],
    methods: { viewDetails, addToCart }
    })

    return Object.freeze({ name: 'product', component })
  }
}
```

## Create the products-component
The `products-component` displays an array of `product-component`. Note that we can use the name of the component (`product` in this case) as the element name in Vue.js, and that the for loop is on the product component itself, not on an outer div/element. Best practices are to supply a unique key. `v-bind:product="product"` puts the `product` object in scope for the `product-component`.

```JavaScript
module.exports = {
  scope: 'papyr',
  name: 'products-component',
  dependencies: ['Vue'],
  factory: (Vue) => {
    'use strict'

    const state = {
      products: []
    }

    const component = Vue.component('products', {
      template: `
      <div class="component products-component">
        <product v-for="product in products"
          v-bind:key="product.uid" v-bind:product="product">
        </product>
      </div>
    `,
      data: () => state
    })

    const setProducts = (products) => {
      state.products = products
    }

    const addProducts = (products) => {
      // it's usually better to overwrite the array than to n+1 modify it
      // to reduce DOM trashing
      state.products = state.products.concat(products)
    }

    return Object.freeze({ name: 'products', component, setProducts, addProducts })
  }
}
```

### On Immutability vs Reactivity
Vue.js DOM binding is reactive: it relies on state mutation to update the DOM. So, we can't completely avoid mutability. Each component is a singleton, and we have to mutate state to get Vue.js to work.

That doesn't mean we can't write immutable code elsewhere, nor that we need to mutate properties on the objects that we bind to our components. It does mean that the state itself _has to be mutable_.

For instance, the header state looks like this:

```JavaScript
const state = {
  brand: 'Papyr',
  query: qs.getCurrent().q || ''
}
```

If we freeze that state object, Vue can't do it's job, and we'll see errors in the developer console.

```JavaScript
// doesn't work!
const state = Object.freeze({
  brand: 'Papyr',
  query: qs.getCurrent().q || ''
})
```

This is because Vue's approach to reactivity requires that the `query` property be mutated.

The products-component demonstrates a compromise. The state object has the mutable property, `products` on it. When a caller executes `setProducts`, we overwrite the array with a new one. When they call `addProducts`, we again overwrite the array with a new one, having concatenated the values. In this way, we are not mutating the values inside of `products`, in favor of swapping out the whole array.

There may be cases where this is not ideal, and it may possibly cause flicker, or scrolling. However, knowing that Vue is reacting to mutation, if we push 20 new products into the array in a loop in `addProducts`, we're effectively sending 20 events to Vue, instead of 1. It's n+1. This can result in DOM thrashing and performance problems with large arrays.

Because each product we put in the array is immutable, we don't have to worry about mutation for them. However, if this were displaying a form, where users could edit the properties, we would have to make the products mutable in order to support that (i.e. using `Object.assign({}, product)`, or `JSON.parse(JSON.stringify(product))`).

## Add the Product model
This example uses `polyn.Immutable` to validate the data, and to produce an immutable object.

```JavaScript
// /papyr/app/products/Product.js
module.exports = {
  scope: 'papyr',
  name: 'Product',
  dependencies: ['polyn { Immutable }'],
  factory: (Immutable) => {
    'use strict'

    const IProduct = new Immutable({
      __blueprintId: 'Product',
      uid: 'string',
      title: 'string',
      description: 'string',
      price: 'money',
      priceText: 'string',
      thumbnailLink: 'string',
      thumbnailAlt: 'string',
      type: 'string',
      metadata: 'object'
    })

    return function Product (product) {
      product = Object.assign({}, product)
      product.priceText = `$${product.price}`
      product.thumbnailAlt = product.thumbnailAlt || `the picture for the ${product.type}`

      return new IProduct(product)
    }
  }
}
```

## Add the respository
This example uses the repository pattern for talking to a server. The repository in this example just has a JSON object with some mock data to get us up and running. Our repository exposes to functions: `find` and `get`.

```JavaScript
// /papyr/app/products/products-repository.js
module.exports = {
  scope: 'papyr',
  name: 'products-repository',
  dependencies: ['Product'],
  factory: (Product) => {
    'use strict'

    const find = (query) => {
      return getMockProducts()
        .then((products) => {
          return products.filter((product) => {
            const q = query.toLowerCase()
            const productText = JSON.stringify(product).toLowerCase()

            return productText.indexOf(q) > -1
          })
          .map((product) => new Product(product))
        })
    }

    const get = (uid) => {
      return getMockProducts()
        .then((products) => {
          return products.filter((product) =>
            product.uid === uid
          )
        }).then((products) => {
          if (products.length) {
            return products[0]
          }

          throw new Error(`Book with id, ${uid} not found`)
        })
    }

    return Object.freeze({ find, get })
  }
}

function getMockProducts () {
  return Promise.resolve([{
    "_id": "5623c1263b952eb796d79df7",
    "uid": "before_go",
    "title": "One Last Thing Before I Go",
    "description": "“Mistakes have been made.” Drew Silver has begun to accept that life isn’t going to turn out as he expected. His fleeting fame as the drummer for a one-hit wonder rock band is nearly a decade behind him. His ex-wife is about to marry a terrific guy. And his Princeton-bound teenage daughter Casey has just confided in him that she’s pregnant—because Silver is the one she cares least about letting down.",
    "metadata": {
      "authors": [{
        "name": "Jonathan Tropper"
      }]
    },
    "price": 8.77,
    "thumbnailLink": "/images/books/beforeIGo.jpg",
    "type": "book"
  } // ...
  ])
}
```

> See the code for a more complete example

## Add the controller
The controller will register the routes, and the handlers for those routes. This controller has 1 route that will parse the query string, use the query found there to find products, via the products-repository, map the results ontp the products-component, and tell the content-vue to switch to the "products" component.

```JavaScript
// /papyr/app/products/products-controller.js
module.exports = {
  scope: 'papyr',
  name: 'products-controller',
  dependencies: ['page', 'query-string', 'content-vue', 'products-component', 'products-repository'],
  factory: (page, queryString, content, productsComponent, productsRepo) => {
    'use strict'

    const registerRoutes = () => {
      page('/products', (context) => {
        const qs = queryString.parse(context.querystring);
        productsRepo.find(qs.q)
          .then((products) => {
            productsComponent.setProducts(products);
            content.component = 'products'
          })
      })
    }

    return Object.freeze({ registerRoutes })
  }
}
```

## Add styles

```LESS
// /papyr/app/products/products.less
// main: ../../styles/main.less

.products-component {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;

  // ...
} // /.product-component
```

> See the code for a more complete example

## Register the syles in main.less

```LESS
// out: main.css, compress: true, strictMath: true

// add any boilerplate you want here
@import "../app/header/header.less";
@import "../app/products/products.less";
```

## Add our files to index.html

The scripts need to be loaded **before** `app.js` is loaded.

```HTML
<!-- /papyr/index.html -->
<!-- ... -->
<script src="product-component.js"></script>
<script src="Product.js"></script>
<script src="products-component.js"></script>
<script src="products-controller.js"></script>
<script src="products-repository.js"></script>

<script src="/app/app.js"></script>
</body>
```

Now when we refresh http://localhost:3001, we should be able to search for products, and see the results on the page, and if we navigate to http://localhost:3001/products?q=novel, we should also see search results for the page.

