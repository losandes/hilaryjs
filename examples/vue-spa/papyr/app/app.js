(function (hilary) {
  'use strict'

  // configure the scope for our application
  hilary.scope('papyr', {
    logging: {
      level: 'trace' // trace|debug|info|warn|error|fatal|off
    }
  // bootstrap the application
  }).bootstrap([
    (scope, next) => {
      console.log('startup::papyr::composing application')
      scope.resolve('header-vue')       // bind the header
      scope.resolve('content-vue')      // bind the main content
      scope.resolve(/controller/i).forEach((controller) => {
        if (controller && typeof controller.registerRoutes === 'function') {
          controller.registerRoutes()   // resolve controllers to register routes
        }
      })
      scope.resolve('router').listen()  // start listening to document events
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
