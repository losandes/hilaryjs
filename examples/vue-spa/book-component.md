Building a SPA with Vue.js & Hilary: Book Component
===================================================
Finally, we need a book component, so when the user chooses a product, they can navigate to a details page.

## Create the books directory and files

```Shell
/papyr/app $ mkdir books
/papyr/app $ cd books
/papyr/app/books $ touch Book.js
/papyr/app/books $ touch book-component.js
/papyr/app/books $ touch books-controller.js
/papyr/app/books $ touch books.less
/papyr/app/books $ touch books-render.less
```

## Create the book-component

```JavaScript
module.exports = {
  scope: 'papyr',
  name: 'book-component',
  dependencies: ['Vue'],
  factory: (Vue) => {
    'use strict'

    const state = {
      book: {}
    }

    const showThumbnail = (book) => { return book.thumbnailLink }
    const addToCart = (book) => { console.log('TODO', book) }

    const component = Vue.component('book', {
      template: `
        <div class="component book-component">
          <div class="book-render">
            <!-- ... -->
            </figure>
          </div>
          <div class="book-details">
            <h1>{{book.title}}</h1>
            <h3>{{book.authors}}</h3>
            <div>{{book.description}}</div>
            <div class="buy-button">
              <button v-on:click="addToCart(book)">
                {{book.priceText}}
              </button>
            </div>
          </div>
        </div>
      `,
      data: () => state,
      methods: { showThumbnail, addToCart }
    })

    const setBook = (book) => {
      state.book = book
    }

    return Object.freeze({ name: 'book', component, setBook })
  }
}
```

> See the code file for more details

## Create the Book model

```JavaScript
module.exports = {
  scope: 'papyr',
  name: 'Book',
  dependencies: ['polyn { Immutable }'],
  factory: (Immutable) => {
    'use strict'

    const IBook = new Immutable({
      __blueprintId: 'Book',
      uid: 'string',
      title: 'string',
      description: 'string',
      price: 'money',
      priceText: 'string',
      thumbnailLink: 'string',
      thumbnailAlt: 'string',
      type: 'string',
      authors: 'string'
    })

    return function Book (product) {
      product = Object.assign({}, product)
      product.priceText = `$${product.price}`
      product.thumbnailAlt = product.thumbnailAlt ||
        `the book cover of ${product.title}`
      product.authors = product.metadata && Array.isArray(product.metadata.authors)
        ? product.metadata.authors.map((author) => author.name).join(', ')
        : ''

      return new IBook(product)
    }
  }
}
```

## Create the book controller

```JavaScript
module.exports = {
  scope: 'papyr',
  name: 'books-controller',
  dependencies: ['page', 'content-vue', 'Book', 'book-component', 'products-repository'],
  factory: (page, content, Book, bookComponent, productsRepo) => {
    'use strict'

    const registerRoutes = () => {
      page('/books/:uid', (context) => {
        productsRepo.get(context.params.uid)
          .then((book) => {
            return new Book(book)
          })
          .then((book) => {
            bookComponent.setBook(book);
            content.component = 'book'
          }).catch((err) => {
            console.log(err)
            content.component = 'home'
          })
      })
    }

    return Object.freeze({ registerRoutes })
  }
}
```

## Add some styles

```LESS
// /papyr/app/books/books-3d.less

// This prints a 3d book with the book cover on the page
// See the file for more details
```

```LESS
// /papyr/app/books/books.less
// main: ../../styles/main.less

.book-component {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;

  .buy-button {
    width: 100%;
    display: flex;
    justify-content: flex-end;

    button {
      margin-top: 20px;
      font-weight: 600;
      cursor: pointer;
      color: green;
      padding: 10px;
    }
  }
}

@media screen and (max-width: 37.8125em) {
  .book-component {
    display: flex;
    flex-flow: row wrap;
  }
}
```

## Register the syles in main.less

```LESS
// out: main.css, compress: true, strictMath: true

// add any boilerplate you want here
@import "../app/header/header.less";
@import "../app/products/products.less";
@import "../app/books/books.less";
@import "../app/books/books-3d.less";
```

## Add our files to index.html

The scripts need to be loaded **before** `app.js` is loaded.

```HTML
<!-- /papyr/index.html -->
<!-- ... -->
<script src="book-component.js"></script>
<script src="Book.js"></script>
<script src="books-controller.js"></script>

<script src="/app/app.js"></script>
</body>
```

Now when we navigate to http://localhost:3001/books/swamplandia, we should see the book details on the page
