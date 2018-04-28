(function (hilary) {
  'use strict'

  // configure the scope for our application
  hilary.scope('papyr', {
    logging: {
      level: 'info' // trace|debug|info|warn|error|fatal|off
    }
  // bootstrap the application
  }).bootstrap([
    (scope, next) => {
      console.log('startup::papyr::composing application')
      scope.resolve('startup')
      next(null, scope)
    }
  ], (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('startup::papyr::application running')
    }
  })
}(hilary))
