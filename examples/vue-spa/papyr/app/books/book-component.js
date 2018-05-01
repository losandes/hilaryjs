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
            <figure class='book'>
            <!-- Front -->
              <ul class='hardcover_front'>
                <li>
                  <img v-if="showThumbnail(book)"
                    v-bind:src="book.thumbnailLink"
                    v-bind:alt="book.thumbnailAlt">
                  <div v-else class="coverDesign yellow"></div>
                </li>
                <li></li>
              </ul>
            <!-- Pages -->
              <ul class='page'>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
              </ul>
            <!-- Back -->
              <ul class='hardcover_back'>
                <li></li>
                <li></li>
              </ul>
              <ul class='book_spine'>
                <li></li>
                <li></li>
              </ul>
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
