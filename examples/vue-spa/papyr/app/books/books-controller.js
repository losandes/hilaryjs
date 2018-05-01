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
