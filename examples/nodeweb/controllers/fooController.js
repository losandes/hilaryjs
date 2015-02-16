/*jslint node: true*/
module.exports.dependencies = ['router'];
module.exports.factory = function (router) {
    "use strict";
    
    router.get('/foo', function (req, res) {
        res.render('index', { title: 'Foo' });
    });
};
