// var mongoose = require('./config/lib/mongoose'),
var express = require('./config/lib/express');

// var db = mongoose();
var app = express();

process.env.TZ = 'Asia/Calcutta';

if (module === require.main) {
    var server = app.listen(process.env.PORT || 3000, function () {
        var host = server.address().address;
        var port = server.address().port;

        console.log('App '+' listening at http://%s:%s', host, port);
    });
}

module.exports = app;