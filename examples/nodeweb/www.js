/*jslint node: true*/
module.exports.name = 'www';
module.exports.dependencies = ['expressApp', 'debug', 'http'];
module.exports.factory = function (app, debug, http) {
    "use strict";
    
    var port,
        server,
        onError,
        onListening;
    
    /*
    // Get port from environment and store in Express.
    */
    port = parseInt(process.env.PORT, 10) || 3000;
    app.set('port', port);

    
    /*
    // Create HTTP server.
    */
    server = http.createServer(app);
    
    
    /*
    // Event listener for HTTP server "error" event.
    */
    onError = function (error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        // handle specific listen errors with friendly messages
        switch (error.code) {
        case 'EACCES':
            console.error('Port ' + port + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error('Port ' + port + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
        }
    };

    
    /*
    // Event listener for HTTP server "listening" event.
    */
    onListening = function () {
        debug('Listening on port ' + server.address().port);
    };

    
    /*
    // Listen on provided port, on all network interfaces.
    */
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
    
    return server;
};
