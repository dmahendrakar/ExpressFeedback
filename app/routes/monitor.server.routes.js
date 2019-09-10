'use strict';
var path = require('path');
module.exports = function(app) {

    var monitor = require('../controllers/monitor.server.controller');

    app.get('/', monitor.renderHome);

    app.get('/cpm', 
        monitor.mkPoseDir,
        monitor.runCPM,
        function(req, res) { console.log(req.recordpath);res.json(JSON.stringify(req.query)); });

    app.get('/classify', 
        monitor.runClassifier,
        function(req, res) { console.log(req.recordpath);res.json(JSON.stringify(req.query)); });

    app.get('/record',
        monitor.mkRecordDir,
        monitor.runStreamer,
        monitor.convertAvi2Mp4,
        function(req, res) { console.log(req.recordpath);res.json(JSON.stringify({"recordfilepath":req.recordfilepath,"recordpath":req.recordpath})); }
    );
};
