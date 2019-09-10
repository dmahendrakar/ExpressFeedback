'use strict';

var config = require('../config'),
    mongoose = require('mongoose');

module.exports = function () {
    var db = mongoose.connect(config.db,{server:{reconnectTries:Number.MAX_VALUE, reconnectInterval: 60*60*1000}});

    require('../../app/models/monitor.server.model');

    return db;
};
